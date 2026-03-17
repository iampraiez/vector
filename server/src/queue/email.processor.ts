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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f4f7f5; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02); border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 40px; height: 40px; background-color: #10b981; border-radius: 12px; display: inline-block; text-align: center; vertical-align: middle;">
                        <span style="color: white; font-size: 24px; font-weight: 900; line-height: 40px;">V</span>
                      </div>
                      <span style="font-size: 22px; font-weight: 900; color: #0f172a; margin-left: 10px; letter-spacing: -1px; vertical-align: middle;">VECTOR</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                      &copy; ${new Date().getFullYear()} Vector Fleet Technologies.
                    </p>
                    <div style="margin-top: 12px;">
                      <a href="#" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px;">Help Center</a>
                      <a href="#" style="color: #64748b; font-size: 12px; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                    </div>
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

    const text = `Vector: Your verification code is ${token}. Please enter it in the app. Code expires in 1 hour.`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Verify your email</h2>
      <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">Welcome to Vector. Please use the verification code below to complete your registration:</p>
      
      <div style="background-color: #f0fdf4; padding: 32px; text-align: center; border-radius: 20px; margin: 32px 0; border: 2px dashed #10b981;">
        <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #065f46; font-family: 'Courier New', Courier, monospace;">${token}</span>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">This security code will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
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

    const text = `Reset your Vector password: ${resetLink}. This link expires in 30 minutes.`;

    const content = `
      <h2 style="margin-top: 0; color: #0f172a; font-size: 24px; font-weight: 800; tracking: -0.5px;">Password Reset</h2>
      <p style="color: #475569; font-size: 16px; margin-bottom: 32px;">We've received a request to reset your Vector workspace password. Click the button below to continue:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">Reset Password</a>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 32px; font-weight: 500;">This link is valid for 30 minutes. If you didn't request a reset, your account is still secure.</p>
      <div style="height: 1px; background-color: #f3f4f6; margin: 32px 0;"></div>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">You're receiving this because a password reset was requested for your Vector account. If this wasn't you, please disregard.</p>
    `;

    await this.mailService.sendMail(
      email,
      'Reset Your Vector Password',
      this.generateBaseTemplate(content, 'Password Reset'),
      text,
    );
  }
}
