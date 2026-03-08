import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { EmailProcessor } from './email.processor';
import { NotificationProcessor } from './notification.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis:
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
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
    MailModule,
  ],
  providers: [EmailProcessor, NotificationProcessor],
  exports: [BullModule],
})
export class QueueModule {}
