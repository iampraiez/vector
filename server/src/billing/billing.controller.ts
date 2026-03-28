import {
  Controller,
  Post,
  Headers,
  Body,
  Req,
  UnauthorizedException,
  HttpCode,
  Logger,
  BadRequestException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import type { PaystackWebHookPayload } from './billing.service';
import {
  PaystackService,
  PaystackTransactionVerifyResponse,
} from './paystack.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { User } from '@prisma/client';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly billingService: BillingService,
    private readonly paystackService: PaystackService,
    private readonly prisma: PrismaService,
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

  /**
   * Verify Paystack payment - called from frontend after redirect from Paystack
   * Handles idempotency to prevent duplicate processing
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post('verify')
  @HttpCode(200)
  async verifyPayment(
    @Body() body: { reference: string },
    @CurrentUser() user: User,
  ) {
    if (!body.reference) {
      throw new BadRequestException('Missing payment reference');
    }

    const userId = user.id;
    const userEmail = user.email;

    if (!userId || !userEmail) {
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.log(`Verifying payment for reference: ${body.reference}`);

    try {
      // Check if we've already processed this reference (idempotency)
      const existingBilling = await this.prisma.billingRecord.findFirst({
        where: {
          paystack_reference: body.reference,
        },
      });

      // If already processed, return success (idempotent response)
      if (existingBilling) {
        this.logger.log(
          `Payment already verified for reference: ${body.reference}`,
        );

        // Get the invoice for this billing record
        const invoice = await this.prisma.invoice.findFirst({
          where: {
            company_id: existingBilling.company_id,
            paid_at: {
              not: null,
            },
          },
          orderBy: { created_at: 'desc' },
        });

        return {
          success: true,
          status: 'verified',
          message: 'Payment verified successfully',
          invoice: invoice ? this.formatInvoice(invoice) : null,
        };
      }

      // Verify with Paystack
      let verification: PaystackTransactionVerifyResponse & {
        transaction_status: string;
      };
      try {
        verification = await this.paystackService.verifyTransaction(
          body.reference,
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Paystack verification failed for reference: ${body.reference}`,
          message,
        );
        return {
          success: false,
          status: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'Payment verification failed from Paystack',
        };
      }

      // At this point, verification succeeded and transaction_status is 'success'
      const metadata = verification.metadata;
      const planId = metadata?.plan_id || 'starter';
      const billingCycle = metadata?.billing_cycle || 'monthly';

      // Calculate period end
      const periodEnd = new Date();
      if (planId !== 'free') {
        if (billingCycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);
      }

      const seats = planId === 'free' ? 2 : planId === 'starter' ? 5 : 20;

      try {
        const invoice = await this.prisma.$transaction(async (tx) => {
          // Get user's company
          const userData = await tx.user.findUnique({
            where: { id: user.id },
          });

          if (!userData?.company_id) {
            throw new UnauthorizedException('User company not found');
          }

          // Find or create billing record
          const billingRecord = await tx.billingRecord.findFirst({
            where: { company_id: userData.company_id },
          });

          if (!billingRecord) {
            await tx.billingRecord.create({
              data: {
                company_id: userData.company_id,
                plan_id: planId,
                status: 'active',
                paystack_reference: body.reference,
                current_period_start: new Date(),
                current_period_end: periodEnd,
                seats_included: seats,
              },
            });
          } else {
            // Update existing billing record with payment reference
            await tx.billingRecord.update({
              where: { id: billingRecord.id },
              data: {
                paystack_reference: body.reference,
                status: 'active',
                plan_id: planId,
                current_period_start: new Date(),
                current_period_end: periodEnd,
                seats_included: seats,
              },
            });
          }

          // Update company tier
          await tx.company.update({
            where: { id: userData.company_id },
            data: {
              subscription_tier: planId,
              subscription_locked: false,
            },
          });

          // Create invoice record
          return tx.invoice.create({
            data: {
              company_id: userData.company_id,
              amount_cents: verification.amount || 0,
              status: 'paid',
              description: `Plan: ${planId} (${billingCycle})`,
              invoice_pdf_url: '',
              paid_at: new Date(verification.paid_at || Date.now()),
              period_start: new Date(),
              period_end: periodEnd,
              paystack_invoice_id: body.reference,
            },
          });
        });

        this.logger.log(`Payment verified and processed for user ${user.id}`);

        return {
          success: true,
          status: 'success',
          message: 'Payment verified successfully',
          invoice: this.formatInvoice(invoice),
        };
      } catch (error) {
        // Handle unique constraint (idempotency hit)
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          this.logger.log(
            `Idempotency hit for reference: ${body.reference}. Skipping update.`,
          );
          return {
            success: true,
            status: 'verified',
            message: 'Payment already processed',
            invoice: null, // Frontend should handle this or fetch the last invoice
          };
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Error verifying payment:', error);
      return {
        success: false,
        status: 'error',
        message: 'Error verifying payment',
      };
    }
  }

  /**
   * Get invoices for the authenticated user's company
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('invoices')
  async getInvoices(@CurrentUser() user: User) {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    if (!userData?.company_id) {
      throw new UnauthorizedException('User company not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { company_id: userData.company_id },
      orderBy: { created_at: 'desc' },
    });

    return {
      invoices: invoices.map((inv) => this.formatInvoice(inv)),
    };
  }

  private formatInvoice(invoice: {
    id: string;
    amount_cents: number;
    status: string;
    paid_at: Date | null;
    period_start: Date;
    period_end: Date;
    invoice_pdf_url: string | null;
    created_at: Date;
  }) {
    return {
      id: invoice.id,
      amount_cents: invoice.amount_cents,
      amount_naira: (invoice.amount_cents / 100).toFixed(2),
      status: invoice.status,
      paid_at: invoice.paid_at,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      invoice_pdf_url: invoice.invoice_pdf_url,
      created_at: invoice.created_at,
    };
  }
}
