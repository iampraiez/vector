import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST', 'smtp.example.com'),
            port: this.configService.get<number>('SMTP_PORT', 587),
            secure: this.configService.get<boolean>('SMTP_SECURE', false),
            auth: {
                user: this.configService.get<string>('SMTP_USER', 'user'),
                pass: this.configService.get<string>('SMTP_PASS', 'pass'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try {
            const from = this.configService.get<string>('SMTP_FROM', '"Vector Support" <noreply@vector.com>');
            const info = await this.transporter.sendMail({
                from,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }
}
