import { Module } from '@nestjs/common';
import { PaystackWebhookController } from './paystack-webhook.controller';
import { PaystackWebhookService } from './paystack-webhook.service';
import { BillingModule } from '../billing/billing.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [BillingModule, PrismaModule],
  controllers: [PaystackWebhookController],
  providers: [PaystackWebhookService],
  exports: [PaystackWebhookService],
})
export class WebhooksModule {}
