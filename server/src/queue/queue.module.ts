import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { EmailProcessor } from './email.processor';
import { NotificationProcessor } from './notification.processor';
import { AccountProcessor } from './account.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import * as Bull from 'bull';
import Redis, { RedisOptions } from 'ioredis';

@Global()
@Module({
  imports: [
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');
        const redisOptions = {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        };

        // Shared across all queues for 'client' and 'subscriber' roles
        const sharedClient = new Redis(redisUrl, redisOptions);
        const sharedSubscriber = new Redis(redisUrl, redisOptions);

        return {
          prefix: 'vector:queue',
          createClient: (type: string, options: RedisOptions) => {
            const safeOptions: RedisOptions = {
              ...options,
              maxRetriesPerRequest: null,
              enableReadyCheck: false,
            };

            switch (type) {
              case 'client':
                return sharedClient;
              case 'subscriber':
                return sharedSubscriber;
              case 'bclient':
                return new Redis(redisUrl, safeOptions);
              default:
                return new Redis(redisUrl, safeOptions);
            }
          },
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
          settings: {
            maxStalledCount: 1,
            lockDuration: 30000,
            stalledInterval: 30000,
          },
        };
      },
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
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectQueue('account') private readonly accountQueue: Bull.Queue,
    @InjectQueue('email') private readonly emailQueue: Bull.Queue,
    @InjectQueue('notification') private readonly notificationQueue: Bull.Queue,
  ) {}

  async onModuleInit() {
    // Register daily trial expiry check
    await this.accountQueue.add(
      'checkTrialExpiry',
      {},
      {
        repeat: { cron: '0 0 * * *' },
        jobId: 'daily-trial-expiry-check',
      },
    );

    // Register active order status refresh (every 15 mins)
    await this.accountQueue.add(
      'refreshAllOrderStatuses',
      {},
      {
        repeat: { cron: '*/15 * * * *' },
        jobId: 'periodic-order-status-refresh',
      },
    );
  }

  async onModuleDestroy() {
    console.log('Closing Bull queues...');
    await Promise.allSettled([
      this.accountQueue.close(),
      this.emailQueue.close(),
      this.notificationQueue.close(),
    ]);
    console.log('Bull queues closed.');
  }
}
