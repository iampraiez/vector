import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { generateReportCsv } from '../dashboard/utils/report.util';
import { ReportQueryDto } from '../dashboard/dto/dashboard.dto';
import {
  reportReadyTemplate,
  verificationEmailTemplate,
  passwordResetTemplate,
  trackingLinkTemplate,
} from '../common/template';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  @Process({ name: 'sendVerification', concurrency: 1 })
  async handleSendVerification(
    job: Bull.Job<{ email: string; token: string }>,
  ) {
    const { email, token } = job.data;
    this.logger.log(`Processing verification email for ${email}`);

    const text = `Vector: Your verification code is ${token}. Please enter it in the app. Code expires in 1 hour.`;

    await this.mailService.sendMail(
      email,
      'Verify Your Vector Account',
      verificationEmailTemplate(token),
      text,
    );
  }

  @Process({ name: 'sendPasswordReset', concurrency: 1 })
  async handleSendPasswordReset(
    job: Bull.Job<{ email: string; token: string; resetLink: string }>,
  ) {
    const { email, resetLink } = job.data;
    this.logger.log(`Processing password reset email for ${email}`);

    const text = `Reset your Vector password: ${resetLink}. This link expires in 30 minutes.`;

    await this.mailService.sendMail(
      email,
      'Reset Your Vector Password',
      passwordResetTemplate(resetLink),
      text,
    );
  }

  @Process({ name: 'sendReport', concurrency: 1 })
  async handleSendReport(
    job: Bull.Job<{ email: string; companyId: string; query: ReportQueryDto }>,
  ) {
    const { email, companyId, query } = job.data;
    this.logger.log(`Generating report for ${email}`);

    try {
      const csvContent = await generateReportCsv(this.prisma, companyId, query);

      const startDateLabel = query.start_date || 'All time';
      const endDateLabel = query.end_date || 'Now';

      await this.mailService.sendMail(
        email,
        'Your Vector Fleet Report',
        reportReadyTemplate(startDateLabel, endDateLabel),
        `Your Vector report is ready and attached. Range: ${startDateLabel} to ${endDateLabel}.`,
        [
          {
            content: csvContent,
            filename: 'vector_report.csv',
            type: 'text/csv',
          },
        ],
      );

      this.logger.log(`Report sent successfully to ${email}`);
    } catch (err) {
      this.logger.error(`Failed to generate/send report for ${email}: ${err}`);
      throw err;
    }
  }

  /**
   * Customer tracking emails — two variants (same HTML helper, different copy):
   * - `status: 'scheduled' | 'assigned'` → “Your Delivery is Scheduled” (manager assignRoute).
   * - `status: 'active'` (else) → “Your Delivery is Out for Delivery” (driver startRoute when no prior send).
   */
  @Process({ name: 'sendTrackingLink', concurrency: 1 })
  async handleSendTrackingLink(
    job: Bull.Job<{
      email: string;
      customerName: string;
      trackingLink: string;
      orderId: string;
      status: string;
      driverName?: string;
    }>,
  ) {
    const { email, trackingLink, orderId, status, driverName } = job.data;
    this.logger.log(`Processing tracking link email for ${email}`);

    const isScheduled = status === 'scheduled' || status === 'assigned';
    const title = isScheduled
      ? 'Your Delivery is Scheduled'
      : 'Your Delivery is Out for Delivery';

    const statusText = isScheduled
      ? `Your order <strong>#${orderId}</strong> has been scheduled for delivery.`
      : `Good news! Your order <strong>#${orderId}</strong> is out for delivery.`;

    const text = `${title}: ${statusText} Track here: ${trackingLink}`;

    await this.mailService.sendMail(
      email,
      title,
      trackingLinkTemplate(title, statusText, trackingLink, driverName),
      text,
    );
  }
}
