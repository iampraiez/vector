import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaystackWebhookService } from './paystack-webhook.service';

interface PaystackPaymentCompleted {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    customer: {
      id: number;
      email: string;
    };
    metadata: {
      company_id: string;
      plan_id: string;
      plan_name: string;
      billing_cycle: string;
    };
  };
}

@Controller('api/webhooks/paystack')
export class PaystackWebhookController {
  private readonly logger = new Logger(PaystackWebhookController.name);

  constructor(
    private readonly paystackWebhookService: PaystackWebhookService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handlePaystackWebhook(
    @Body() payload: PaystackPaymentCompleted,
    @Headers('x-paystack-signature') signature: string,
  ) {
    this.logger.log(`Received Paystack webhook event: ${payload.event}`);

    // Verify signature
    const isValid = this.paystackWebhookService.verifySignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle different events
    switch (payload.event) {
      case 'charge.success':
        await this.paystackWebhookService.handleChargeSuccess(payload.data);
        break;
      case 'charge.failed':
        await this.paystackWebhookService.handleChargeFailed(payload.data);
        break;
      case 'charge.dispute.create':
        await this.paystackWebhookService.handleChargeDispute(payload.data);
        break;
      default:
        this.logger.log(`Unhandled event type: ${payload.event}`);
    }

    return { status: 'success' };
  }
}
