import { Module, Global, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { EmailProcessor } from './email.processor';
import { NotificationProcessor } from './notification.processor';
import { AccountProcessor } from './account.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Queue } from 'bullmq';

@Global()
@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: configService.getOrThrow<string>('REDIS_URL'),
        settings: {
          maxStalledCount: 0,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
    BullModule.registerQueue({
      name: 'account',
    }),
    MailModule,
    NotificationsModule,
  ],
  providers: [EmailProcessor, NotificationProcessor, AccountProcessor],
  exports: [BullModule],
})
export class QueueModule implements OnModuleInit {
  constructor(@InjectQueue('account') private readonly accountQueue: Queue) {}

  async onModuleInit() {
    // Register daily trial expiry check
    await this.accountQueue.add(
      'checkTrialExpiry',
      {},
      {
        repeat: { pattern: '0 0 * * *' },
        jobId: 'daily-trial-expiry-check',
      },
    );

    // Register active order status refresh (every 15 mins)
    await this.accountQueue.add(
      'refreshAllOrderStatuses',
      {},
      {
        repeat: { pattern: '*/15 * * * *' },
        jobId: 'periodic-order-status-refresh',
      },
    );
  }
}
