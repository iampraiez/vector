import {
  Controller,
  Post,
  Headers,
  Body,
  Req,
  UnauthorizedException,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { Public } from '../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import type { PaystackWebHookPayload } from './billing.service';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RequestWithRawBody,
    @Body() payload: PaystackWebHookPayload,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing Paystack signature');
    }

    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      this.logger.error('PAYSTACK_SECRET_KEY is not configured');
      throw new UnauthorizedException('Webhook configuration error');
    }

    // Paystack requires hashing the raw request body
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody ? req.rawBody : JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      this.logger.warn('Invalid Paystack signature');
      throw new UnauthorizedException('Invalid signature');
    }

    // Process the verified event
    await this.billingService.handleWebhookEvent(payload);

    return { status: 'success' };
  }
}
