import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly configService: ConfigService) {
    this.from = this.configService.getOrThrow<string>('SENDER_EMAIL');
    const user = this.configService.getOrThrow<string>('EMAIL_USER');
    const pass = this.configService.getOrThrow<string>('EMAIL_PASS');

    const options: SMTPTransport.Options = {
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    };

    this.transporter = nodemailer.createTransport(options);
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    attachments?: { content: string; filename: string; type: string }[],
  ): Promise<{ messageId: string }> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Vector Fleet" <${this.from}>`,
        to,
        subject,
        text:
          text ||
          html
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
        html,
        attachments: attachments?.map((a) => ({
          content: Buffer.from(a.content, 'utf-8'),
          filename: a.filename,
          contentType: a.type,
        })),
      };

      const info: SMTPTransport.SentMessageInfo =
        await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent via SMTP to ${to}: ${String(info.messageId)}`,
      );

      return { messageId: String(info.messageId) };
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}: ${String(error)}`);
      throw new Error(`Email delivery failed: ${String(error)}`);
    }
  }
}
