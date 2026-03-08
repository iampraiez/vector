import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  private generateBaseTemplate(content: string, title: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 40px; text-align: center; background-color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #2563eb;">Vector</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Vector Logistics. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  @Process('sendVerification')
  async handleSendVerification(job: Job<{ email: string; token: string }>) {
    const { email, token } = job.data;
    this.logger.log(`Processing verification email for ${email}`);

    const text = `Your verification code is: ${token}. Please enter this code in the application. Expire in 1 hour.`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Welcome to Vector!</h2>
      <p style="color: #475569; font-size: 16px;">Use the code below to verify your email address:</p>
      
      <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-radius: 8px; margin: 32px 0; border: 1px solid #e2e8f0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${token}</span>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">This code will expire in <strong>1 hour</strong>.</p>
    `;

    await this.mailService.sendMail(
      email,
      'Verify Your Vector Account',
      this.generateBaseTemplate(content, 'Verify Your Account'),
      text,
    );
  }

  @Process('sendPasswordReset')
  async handleSendPasswordReset(
    job: Job<{ email: string; token: string; resetLink: string }>,
  ) {
    const { email, resetLink } = job.data;
    this.logger.log(`Processing password reset email for ${email}`);

    const text = `We received a request to reset your Vector password. Click the link to reset it: ${resetLink}. Expires in 30 minutes.`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">We received a request to reset your Vector password. Click the button below to set a new one:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">This link will expire in <strong>30 minutes</strong>.</p>
      <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">If you did not request this, please ignore this email. Your account remains secure.</p>
    `;

    await this.mailService.sendMail(
      email,
      'Reset Your Vector Password',
      this.generateBaseTemplate(content, 'Password Reset'),
      text,
    );
  }
}
