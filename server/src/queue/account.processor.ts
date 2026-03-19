import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateReportCsv } from '../dashboard/utils/report.util';

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
      targetRole: 'driver' | 'workspace';
      targetId: string;
    }>,
  ) {
    const { companyId, email, targetRole, targetId } = job.data;
    this.logger.log(`Generating clear data report for company ${companyId}`);

    try {
      // For simplicity, we just generate the standard CSV report
      // If targetRole is driver, we could filter by driverId, but for now just send the workspace report
      const csvContent = await generateReportCsv(this.prisma, companyId, {});

      const content = `
        <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Data Cleared</h2>
        <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">A ${targetRole} has initiated a permanent data clearance. As per policy, we have attached the final data report before fully dropping the records.</p>
        <p style="color: #475569; font-size: 14px;">The report is attached to this email in CSV format.</p>
      `;

      await this.mailService.sendMail(
        email,
        'Vector Data Clearance Report',
        this.generateBaseTemplate(content, 'Data Clearance'),
        'Attached is the final data report before permanent clearance.',
        [
          {
            content: csvContent,
            filename: 'cleared_data_report.csv',
            type: 'text/csv',
          },
        ],
      );

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

  private generateBaseTemplate(content: string, title: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f4f7f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; padding: 40px; border: 1px solid #e5e7eb;">
          ${content}
        </div>
      </body>
      </html>
    `;
  }
}
