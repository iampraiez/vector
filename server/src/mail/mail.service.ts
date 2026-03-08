import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ messageId: string }> {
    try {
      const from = this.configService.get<string>(
        'SMTP_FROM',
        `"Vector Support" <${this.configService.get<string>('SMTP_USER')}>`,
      );
      const info = (await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      })) as { messageId: string };
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
