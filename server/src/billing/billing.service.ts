import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

interface PaystackEventData {
  reference?: string;
  amount: number;
  paid_at?: string;
  receipt_url?: string;
  customer: {
    email: string;
    customer_code?: string;
  };
}

export interface PaystackWebHookPayload {
  event: string;
  data: PaystackEventData;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async handleWebhookEvent(eventPayload: PaystackWebHookPayload) {
    const { event, data } = eventPayload;
    this.logger.log(`Received Paystack event: ${event}`);

    try {
      if (event === 'charge.success') {
        await this.handleChargeSuccess(data);
      } else if (event === 'subscription.disable') {
        await this.handleSubscriptionDisable(data);
      } else if (event === 'invoice.payment_failed') {
        await this.handleInvoiceFailed(data);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event}:`, error);
      // We don't re-throw because we want to respond 200 OK to Paystack
      // to acknowledge receipt, even if our internal processing failed.
    }
  }

  private async handleChargeSuccess(data: PaystackEventData) {
    const reference = data.reference;
    if (!reference) return;

    // Find the company's billing record
    const billingRecord = await this.prisma.billingRecord.findFirst({
      where: {
        company: {
          users: {
            some: {
              email: data.customer.email,
              role: 'admin',
            },
          },
        },
      },
      include: { company: true },
    });

    if (!billingRecord) {
      this.logger.warn(
        `No billing record found for charge ${reference} with email ${data.customer.email}`,
      );
      return;
    }

    // Determine plan details
    const isPaid = billingRecord.plan_id !== 'free';
    const periodEnd = isPaid
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000); // 10 years

    const seats =
      billingRecord.plan_id === 'free'
        ? 2
        : billingRecord.plan_id === 'starter'
          ? 5
          : 20;

    // Update the billing record
    await this.prisma.billingRecord.update({
      where: { id: billingRecord.id },
      data: {
        status: 'active',
        current_period_end: periodEnd,
        seats_included: seats,
      },
    });

    // Save invoice record
    await this.prisma.invoice.create({
      data: {
        company_id: billingRecord.company_id,
        amount_cents: data.amount,
        status: 'paid',
        invoice_pdf_url: data.receipt_url || '',
        paid_at: new Date(data.paid_at || Date.now()),
        period_start: new Date(),
        period_end: periodEnd,
      },
    });

    this.logger.log(
      `Activated billing for company ${billingRecord.company_id}`,
    );
  }

  private async handleSubscriptionDisable(data: PaystackEventData) {
    const customerCode = data.customer?.customer_code;
    if (!customerCode) return;

    // In a full integration we'd lookup by paystack_customer_id,
    // but we can fallback to email matching if needed.
    const companyAuths = await this.prisma.user.findMany({
      where: { email: data.customer.email, role: 'admin' },
      select: { company_id: true },
    });

    for (const auth of companyAuths) {
      const billingRecord = await this.prisma.billingRecord.findFirst({
        where: { company_id: auth.company_id },
      });

      if (billingRecord) {
        await this.prisma.billingRecord.update({
          where: { id: billingRecord.id },
          data: { status: 'past_due' }, // Suspend gracefully
        });
        this.logger.log(
          `Marked billing past_due for company ${auth.company_id}`,
        );
        // Optionally notify fleet manager here
      }
    }
  }

  private async handleInvoiceFailed(data: PaystackEventData) {
    // invoice.payment_failed has similar structure
    await this.handleSubscriptionDisable(data);
  }
}
