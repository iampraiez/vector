import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

describe('BillingService', () => {
  let service: BillingService;

  const prisma: any = {
    company: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    billingRecord: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    service = module.get(BillingService);
    jest.clearAllMocks();
  });

  describe('handleWebhookEvent', () => {
    it('routes charge.success to handleChargeSuccess', async () => {
      const data = {
        reference: 'REF_123',
        amount: 5000,
      } as any;
      const spy = jest.spyOn(service as any, 'handleChargeSuccess');
      spy.mockResolvedValue(undefined);

      await service.handleWebhookEvent({ event: 'charge.success', data });

      expect(spy).toHaveBeenCalledWith(data);
    });

    it('routes subscription.disable to handleSubscriptionDisable', async () => {
      const data = {
        customer: { customer_code: 'CUST_123' },
        amount: 5000,
      } as any;
      const spy = jest.spyOn(service as any, 'handleSubscriptionDisable');
      spy.mockResolvedValue(undefined);

      await service.handleWebhookEvent({ event: 'subscription.disable', data });

      expect(spy).toHaveBeenCalledWith(data);
    });
  });

  describe('handleSubscriptionDisable', () => {
    it('finds company by paystack_customer_id (primary route)', async () => {
      const data = {
        customer: { customer_code: 'CUST_123', email: 'test@test.com' },
      };
      prisma.company.findFirst.mockResolvedValue({ id: 'comp-1' });
      prisma.billingRecord.findFirst.mockResolvedValue({ id: 'bill-1' });

      await (service as any).handleSubscriptionDisable(data);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({
        where: { paystack_customer_id: 'CUST_123' },
      });
      expect(prisma.billingRecord.update).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        data: { status: 'past_due' },
      });
    });

    it('falls back to email matching if customer_code lookup fails', async () => {
      const data = {
        customer: { customer_code: 'CUST_UNKNOWN', email: 'admin@test.com' },
      };
      prisma.company.findFirst.mockResolvedValue(null);
      prisma.user.findMany.mockResolvedValue([{ company_id: 'comp-2' }]);
      prisma.billingRecord.findFirst.mockResolvedValue({ id: 'bill-2' });

      await (service as any).handleSubscriptionDisable(data);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.billingRecord.update).toHaveBeenCalledWith({
        where: { id: 'bill-2' },
        data: { status: 'past_due' },
      });
    });
  });
});
