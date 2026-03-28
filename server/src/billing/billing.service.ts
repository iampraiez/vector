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
  metadata?: {
    company_id: string;
    plan_id: string;
    plan_name: string;
    billing_cycle: string;
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

    this.logger.log(
      `Processing successful charge ${reference} with metadata: ${JSON.stringify(data.metadata)}`,
    );

    // Use metadata if available, fallback to email lookup
    let billingRecord;
    if (data.metadata?.company_id) {
      billingRecord = await this.prisma.billingRecord.findFirst({
        where: { company_id: data.metadata.company_id },
        include: { company: true },
      });
    }

    if (!billingRecord) {
      billingRecord = await this.prisma.billingRecord.findFirst({
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
    }

    if (!billingRecord) {
      this.logger.warn(
        `No billing record found for charge ${reference} with email ${data.customer.email}`,
      );
      return;
    }

    // Determine plan details from metadata or current record
    const planId = data.metadata?.plan_id || billingRecord.plan_id;
    const billingCycle = data.metadata?.billing_cycle || 'monthly';
    const isPaid = planId !== 'free';

    // Calculate period end
    const periodEnd = new Date();
    if (isPaid) {
      if (billingCycle === 'annual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 10); // 10 years for free
    }

    const seats = planId === 'free' ? 2 : planId === 'starter' ? 5 : 20;

    // Update the billing record
    await this.prisma.billingRecord.update({
      where: { id: billingRecord.id },
      data: {
        status: 'active',
        plan_id: planId,
        current_period_end: periodEnd,
        seats_included: seats,
        paystack_reference: reference,
      },
    });

    await this.prisma.company.update({
      where: { id: billingRecord.company_id },
      data: {
        subscription_tier: planId,
        subscription_locked: false,
      },
    });

    // Save invoice record
    await this.prisma.invoice.create({
      data: {
        company_id: billingRecord.company_id,
        amount_cents: data.amount,
        status: 'paid',
        description: `Plan: ${planId} (${billingCycle})`,
        invoice_pdf_url: data.receipt_url || '',
        paid_at: new Date(data.paid_at || Date.now()),
        period_start: new Date(),
        period_end: periodEnd,
        paystack_invoice_id: reference,
      },
    });

    this.logger.log(
      `Activated/Renewed billing for company ${billingRecord.company_id} (Plan: ${planId})`,
    );
  }

  private async handleSubscriptionDisable(data: PaystackEventData) {
    const customerCode = data.customer?.customer_code;
    if (!customerCode) return;

    // 1. Try to lookup by paystack_customer_id first (more reliable)
    const company = await this.prisma.company.findFirst({
      where: { paystack_customer_id: customerCode },
    });

    const companyIds = company ? [company.id] : [];

    // 2. Fallback to email matching if No company found by customer ID
    if (companyIds.length === 0 && data.customer?.email) {
      const users = await this.prisma.user.findMany({
        where: { email: data.customer.email, role: 'admin' },
        select: { company_id: true },
      });
      companyIds.push(...users.map((u) => u.company_id));
      if (companyIds.length > 0) {
        this.logger.warn(
          `Found ${companyIds.length} companies by email fallback for customer ${customerCode}`,
        );
      }
    }

    for (const companyId of companyIds) {
      const billingRecord = await this.prisma.billingRecord.findFirst({
        where: { company_id: companyId },
      });

      if (billingRecord) {
        await this.prisma.billingRecord.update({
          where: { id: billingRecord.id },
          data: { status: 'past_due' }, // Suspend gracefully
        });
        this.logger.log(`Marked billing past_due for company ${companyId}`);
        // Optionally notify fleet manager here
      }
    }
  }

  private async handleInvoiceFailed(data: PaystackEventData) {
    // invoice.payment_failed has similar structure
    await this.handleSubscriptionDisable(data);
  }
}
