import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateReportCsv } from '../dashboard/utils/report.util';
import {
  dataClearedTemplate,
  historyExportTemplate,
  historyEmptyTemplate,
} from '../common/template';

@Processor('account')
export class AccountProcessor {
  private readonly logger = new Logger(AccountProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('clearDataReport')
  async handleClearDataReport(
    job: Job<{
      companyId: string;
      email: string;
      /** Optional copy for fleet when a driver clears their own data */
      fleetManagerEmail?: string;
      targetRole: 'driver' | 'workspace';
      targetId: string;
    }>,
  ) {
    const { companyId, email, fleetManagerEmail, targetRole, targetId } =
      job.data;
    this.logger.log(`Generating clear data report for company ${companyId}`);

    try {
      // For simplicity, we just generate the standard CSV report
      // If targetRole is driver, we could filter by driverId, but for now just send the workspace report
      const csvContent = await generateReportCsv(this.prisma, companyId, {});

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

      // Now actually clear the data
      if (targetRole === 'workspace') {
        // Delete all stops, routes, ratings for company
        await this.prisma.stop.deleteMany({ where: { company_id: companyId } });
        await this.prisma.route.deleteMany({
          where: { company_id: companyId },
        });
        await this.prisma.deliveryRating.deleteMany({
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
    job: Job<{
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
  async handleDeleteAccount(job: Job<{ userId: string }>) {
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
}
