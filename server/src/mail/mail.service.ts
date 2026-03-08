import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.getOrThrow<string>('RESEND_API_KEY'));
    this.from = this.configService.get<string>('MAIL_FROM', 'onboarding@resend.dev');
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ messageId: string }> {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(error.message);
    }

    this.logger.log(`Email sent: ${data?.id ?? 'unknown'}`);
    return { messageId: data?.id ?? '' };
  }
}
