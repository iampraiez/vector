import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

interface SendGridError {
  response?: {
    body?: unknown;
  };
  message?: string;
}

@Injectable()
export class MailService {
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('SENDGRID_API_KEY');
    sgMail.setApiKey(apiKey);

    this.from = this.configService.getOrThrow<string>('SENDER_EMAIL');
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    attachments?: { content: string; filename: string; type: string }[],
  ): Promise<{ messageId: string }> {
    try {
      await sgMail.send({
        to,
        from: {
          email: this.from,
          name: 'Vector Fleet',
        },
        replyTo: {
          email: this.from,
          name: 'Vector Fleet',
        },
        subject,
        text:
          text ||
          html
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
        html,
        attachments: attachments?.map((a) => ({
          content: Buffer.from(a.content).toString('base64'),
          filename: a.filename,
          type: a.type,
          disposition: 'attachment',
        })),
        headers: {
          'X-Mailer': 'VectorFleet/1.0',
          'X-Priority': '3',
        },
      });

      this.logger.log(`Email sent via SendGrid to ${to}`);

      return { messageId: 'sendgrid-' + Date.now() };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null) {
        const err = error as SendGridError;
        this.logger.error(
          `FULL SENDGRID ERROR: ${JSON.stringify(error, null, 2)}`,
        );
        if (err.response && err.response.body) {
          this.logger.error(
            `Failed to send email to ${to}: ${JSON.stringify(err.response.body)}`,
          );
        } else if (err.message) {
          this.logger.error(`Failed to send email to ${to}: ${err.message}`);
        }
        throw new Error(err.message || 'Unknown email error');
      }
      this.logger.error(`Failed to send email to ${to}: ${String(error)}`);
      throw new Error(String(error));
    }
  }
}
