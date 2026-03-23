import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

interface ChargeData {
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
}

@Injectable()
export class PaystackWebhookService {
  private readonly logger = new Logger(PaystackWebhookService.name);
  private readonly secretKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      throw new Error('Paystack secret key not configured in environment');
    }
    this.secretKey = secret;
  }

  /**
   * Verify webhook signature from Paystack
   */
  verifySignature(body: string, signature: string): boolean {
    const hash = createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Handle successful charge event
   */
  async handleChargeSuccess(data: ChargeData): Promise<void> {
    this.logger.log(
      `Processing charge.success for reference: ${data.reference}`,
    );

    try {
      const { reference, metadata } = data;

      // Find existing billing record by reference
      const existingRecord = await this.prisma.billingRecord.findFirst({
        where: { paystack_reference: reference },
      });

      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      if (existingRecord) {
        // Update existing record
        await this.prisma.billingRecord.update({
          where: { id: existingRecord.id },
          data: {
            status: 'active',
            current_period_start: now,
            current_period_end: periodEnd,
          },
        });
        this.logger.log(
          `Updated billing record ${existingRecord.id} to active`,
        );
      } else {
        // Create new billing record
        await this.prisma.billingRecord.create({
          data: {
            company_id: metadata.company_id,
            plan_id: metadata.plan_id,
            paystack_reference: reference,
            status: 'active',
            current_period_start: now,
            current_period_end: periodEnd,
          },
        });
        this.logger.log('Created new billing record for payment');
      }

      // Update company subscription tier
      await this.prisma.company.update({
        where: { id: metadata.company_id },
        data: {
          subscription_tier: metadata.plan_id.toLowerCase(),
        },
      });

      this.logger.log(
        `Updated company ${metadata.company_id} to plan ${metadata.plan_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing charge.success: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Handle failed charge event
   */
  async handleChargeFailed(data: ChargeData): Promise<void> {
    this.logger.log(
      `Processing charge.failed for reference: ${data.reference}`,
    );

    try {
      const existingRecord = await this.prisma.billingRecord.findFirst({
        where: { paystack_reference: data.reference },
      });

      if (existingRecord) {
        await this.prisma.billingRecord.update({
          where: { id: existingRecord.id },
          data: { status: 'failed' },
        });
        this.logger.log(`Marked billing record ${existingRecord.id} as failed`);
      }

      this.logger.warn(
        `Payment failed for company ${data.metadata.company_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing charge.failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Handle charge dispute event
   */
  async handleChargeDispute(data: ChargeData): Promise<void> {
    this.logger.warn(`Charge dispute for reference: ${data.reference}`);

    try {
      const existingRecord = await this.prisma.billingRecord.findFirst({
        where: { paystack_reference: data.reference },
      });

      if (existingRecord) {
        await this.prisma.billingRecord.update({
          where: { id: existingRecord.id },
          data: { status: 'disputed' },
        });
        this.logger.warn(
          `Marked billing record ${existingRecord.id} as disputed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing charge.dispute: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
