import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaystackService } from './paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [BillingController],
  providers: [BillingService, PaystackService],
  exports: [BillingService, PaystackService],
})
export class BillingModule {}
