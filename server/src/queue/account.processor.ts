import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StopStatus } from '@prisma/client';
import { generateReportCsv } from '../dashboard/utils/report.util';
import {
  dataClearedTemplate,
  historyExportTemplate,
  historyEmptyTemplate,
  trialExpiredTemplate,
} from '../common/template';

@Processor('account')
export class AccountProcessor {
  private readonly logger = new Logger(AccountProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Process('clearDataReport')
  async handleClearDataReport(
    job: Bull.Job<{
      companyId: string;
      email: string;
      /** Optional copy for fleet when a driver clears their own data */
      fleetManagerEmail?: string;
      targetRole: 'driver' | 'workspace';
      targetId: string;
      /** User who confirmed the OTP (admin or driver user id) */
      actorUserId?: string;
    }>,
  ) {
    const { companyId, email, fleetManagerEmail, targetRole, targetId } =
      job.data;
    const actorUserId = job.data.actorUserId ?? null;
    this.logger.log(`Generating clear data report for company ${companyId}`);

    try {
      // For driver clears, scope the CSV to that driver's data only.
      const csvDriverId = targetRole === 'driver' ? targetId : undefined;

      const csvContent = await generateReportCsv(
        this.prisma,
        companyId,
        {},
        csvDriverId,
      );

      const attachments = [
        {
          content: csvContent,
          filename: 'cleared_data_report.csv',
          type: 'text/csv',
        },
      ];

      const subject = 'Vector Data Clearance Report';
      const textPlain =
        'Attached is the final data report before permanent clearance.';

      // 1. Send report email FIRST — only clear data after email queued
      await this.mailService.sendMail(
        email,
        subject,
        dataClearedTemplate(
          targetRole,
          targetRole === 'driver' ? 'driver' : 'fleet',
        ),
        textPlain,
        attachments,
      );

      const manager = fleetManagerEmail?.trim();
      if (
        manager &&
        manager.toLowerCase() !== email.toLowerCase() &&
        targetRole === 'driver'
      ) {
        await this.mailService.sendMail(
          manager,
          subject,
          dataClearedTemplate('driver', 'fleet'),
          textPlain,
          attachments,
        );
      }

      // 2. Now actually clear the data (after confirming email was queued)
      if (targetRole === 'workspace') {
        await this.prisma.stop.deleteMany({ where: { company_id: companyId } });
        await this.prisma.route.deleteMany({
          where: { company_id: companyId },
        });
        await this.prisma.deliveryRating.deleteMany({
          where: { company_id: companyId },
        });
        await this.prisma.notification.deleteMany({
          where: { company_id: companyId },
        });
      } else if (targetRole === 'driver') {
        await this.prisma.stop.deleteMany({ where: { driver_id: targetId } });
        await this.prisma.route.deleteMany({ where: { driver_id: targetId } });
        await this.prisma.deliveryRating.deleteMany({
          where: { driver_id: targetId },
        });
        // Reset driver stats
        await this.prisma.driver.update({
          where: { id: targetId },
          data: { total_deliveries: 0, total_routes: 0 },
        });
      }

      await this.auditService.log({
        companyId,
        userId: actorUserId,
        action:
          targetRole === 'workspace'
            ? 'workspace.clear_data'
            : 'driver.clear_data',
        resourceType: targetRole === 'workspace' ? 'company' : 'driver',
        resourceId: targetId,
        newValue: { targetRole, email },
      });

      this.logger.log(`Data cleared & report sent successfully to ${email}`);
    } catch (err) {
      this.logger.error(
        `Failed to handle clear data report for ${email}: ${err}`,
      );
      throw err;
    }
  }

  @Process('exportHistory')
  async handleExportHistory(
    job: Bull.Job<{
      userId: string;
      driverId: string;
      email: string;
      range: string;
      startDate?: string;
      endDate?: string;
    }>,
  ) {
    const { userId, email, range, startDate, endDate } = job.data;
    this.logger.log(
      `Generating history export for user ${userId}, range: ${range}`,
    );

    try {
      let start: Date;
      const end = endDate ? new Date(endDate) : new Date();

      if (range === 'week') {
        start = new Date();
        start.setDate(start.getDate() - 7);
      } else if (range === 'month') {
        start = new Date();
        start.setMonth(start.getMonth() - 1);
      } else if (startDate) {
        start = new Date(startDate);
      } else {
        start = new Date(0); // All time
      }

      const routes = await this.prisma.route.findMany({
        where: {
          driver_id: job.data.driverId,
          status: 'completed',
          completed_at: {
            gte: start,
            lte: end,
          },
        },
        include: { stops: true },
        orderBy: { completed_at: 'desc' },
      });

      if (routes.length === 0) {
        await this.mailService.sendMail(
          email,
          'Vector History Export',
          historyEmptyTemplate(range),
          'No history found for the requested period.',
        );
        return;
      }

      // Generate simple CSV
      let csv = 'Date,Route Name,Stops,Distance (km),Completed At\n';
      routes.forEach((r) => {
        csv += `${r.date},"${r.name.replace(/"/g, '""')}",${r.stops.length},${r.total_distance_km || 0},${r.completed_at?.toISOString() || ''}\n`;
      });

      await this.mailService.sendMail(
        email,
        'Vector History Export',
        historyExportTemplate(range, routes.length),
        `Your history report for ${range} is attached.`,
        [
          {
            content: csv,
            filename: `vector_history_${range}_${new Date().toISOString().split('T')[0]}.csv`,
            type: 'text/csv',
          },
        ],
      );

      this.logger.log(`History export sent to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to export history for ${email}: ${err}`);
      throw err;
    }
  }

  @Process('deleteAccount')
  async handleDeleteAccount(
    job: Bull.Job<{
      userId: string;
      userFullName?: string;
      userEmail?: string;
    }>,
  ) {
    const { userId } = job.data;
    this.logger.log(`Running delayed deletion for user ${userId}`);

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        this.logger.log(`User ${userId} not found, already deleted.`);
        return;
      }

      if (user.email_verified) {
        this.logger.log(
          `User ${userId} has re-verified their email. Aborting deletion.`,
        );
        return;
      }

      // Hard delete user and cascades
      await this.prisma.user.delete({ where: { id: userId } });
      this.logger.log(`User ${userId} permanently deleted.`);
    } catch (err) {
      this.logger.error(
        `Failed to execute delayed deletion for ${userId}: ${err}`,
      );
      throw err;
    }
  }

  @Process('checkTrialExpiry')
  async handleCheckTrialExpiry() {
    this.logger.log('Running daily trial expiry check...');

    try {
      const expiredTrials = await this.prisma.billingRecord.findMany({
        where: {
          status: 'trialing',
          current_period_end: { lt: new Date() },
        },
        include: {
          company: true,
        },
      });

      if (expiredTrials.length === 0) {
        this.logger.log('No expired trials found today.');
        return;
      }

      for (const record of expiredTrials) {
        this.logger.log(
          `Locking company ${record.company.name} (${record.company_id}) - trial expired on ${record.current_period_end.toISOString()}`,
        );

        await this.prisma.$transaction(async (tx) => {
          // 1. Lock the company
          await tx.company.update({
            where: { id: record.company_id },
            data: { subscription_locked: true },
          });

          // 2. Update billing status
          await tx.billingRecord.update({
            where: { id: record.id },
            data: { status: 'past_due' },
          });
        });

        // 3. Notify the manager
        if (record.company.contact_email || record.company.billing_email) {
          const recipient =
            record.company.contact_email || record.company.billing_email;
          await this.mailService.sendMail(
            recipient!,
            'Your Vector Trial has Ended',
            trialExpiredTemplate(record.company.name),
            `Your trial for ${record.company.name} has ended. Please upgrade to continue using Vector.`,
          );
        }
      }

      this.logger.log(`Processed ${expiredTrials.length} expired trials.`);
    } catch (err) {
      this.logger.error(`Failed to run trial expiry check: ${err}`);
      throw err;
    }
  }

  @Process('refreshAllOrderStatuses')
  async handleRefreshAllOrderStatuses() {
    this.logger.log('Running periodic order status refresh...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTotalMinutes = currentH * 60 + currentM;

    try {
      // 1. Fetch all active orders (unassigned, assigned, in_progress)
      const activeOrders = await this.prisma.stop.findMany({
        where: {
          status: { in: ['unassigned', 'assigned', 'in_progress'] },
        },
        include: {
          driver: { select: { user_id: true } },
        },
      });

      if (activeOrders.length === 0) {
        this.logger.log('No active orders to refresh.');
        return;
      }

      this.logger.log(`Checking ${activeOrders.length} active orders...`);

      // 2. Track which companies we need admins for to avoid over-fetching
      const companyIds = [
        ...new Set(activeOrders.map((o) => o.company_id)),
      ] as string[];
      const admins = await this.prisma.user.findMany({
        where: {
          company_id: { in: companyIds },
          role: { in: ['manager', 'admin'] },
        },
        orderBy: { created_at: 'asc' },
      });

      const getCompanyAdmin = (companyId: string) =>
        admins.find((a) => a.company_id === companyId);

      let updatedCount = 0;

      for (const order of activeOrders) {
        if (!order.delivery_date) continue;

        let newStatus: StopStatus | null = null;
        const isPast = order.delivery_date < today;
        const isToday = order.delivery_date === today;

        if (isPast) {
          newStatus = 'failed';
        } else if (isToday && order.time_window_end) {
          const [endH, endM] = order.time_window_end.split(':').map(Number);
          const endTotalMinutes = endH * 60 + endM;

          if (currentTotalMinutes > endTotalMinutes) {
            newStatus = 'failed';
          } else if (order.time_window_start) {
            const [startH, startM] = order.time_window_start
              .split(':')
              .map(Number);
            const startTotalMinutes = startH * 60 + startM;

            if (currentTotalMinutes >= startTotalMinutes) {
              newStatus = 'in_progress';
            }
          }
        }

        if (newStatus && newStatus !== order.status) {
          await this.prisma.stop.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              failure_reason:
                newStatus === 'failed' ? 'Time window expired' : undefined,
            },
          });
          updatedCount++;

          if (newStatus === 'failed') {
            const companyAdmin = getCompanyAdmin(order.company_id);
            const targetUserId =
              order.driver?.user_id ?? companyAdmin?.id ?? null;
            if (targetUserId) {
              await this.notificationsService.create({
                userId: targetUserId,
                companyId: order.company_id,
                type: 'delivery_failed',
                title: 'Order expired',
                body: `Order for "${order.customer_name}" has expired.`,
              });
            }
          }
        }
      }

      this.logger.log(`Refresh complete. Updated ${updatedCount} order(s).`);
    } catch (err) {
      this.logger.error(`Failed to refresh order statuses: ${err}`);
      throw err;
    }
  }
}
