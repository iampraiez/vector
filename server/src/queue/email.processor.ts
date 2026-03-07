import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process('sendVerification')
  async handleSendVerification(job: Job<{ email: string; token: string }>) {
    const { email, token } = job.data;
    this.logger.log(`Processing verification email for ${email}`);

    const html = `
      <h1>Welcome to Vector!</h1>
      <p>Your verification code is: <strong>${token}</strong></p>
      <p>Please enter this code in the application to verify your email address.</p>
      <p>This code will expire in 1 hour.</p>
    `;

    await this.mailService.sendMail(email, 'Verify Your Vector Account', html);
  }

  @Process('sendPasswordReset')
  async handleSendPasswordReset(
    job: Job<{ email: string; token: string; resetLink: string }>,
  ) {
    const { email, resetLink } = job.data;
    this.logger.log(`Processing password reset email for ${email}`);

    const html = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your Vector password.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await this.mailService.sendMail(email, 'Reset Your Vector Password', html);
  }
}
