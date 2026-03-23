import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { MapService } from '../map/map.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const prisma = {
    user: { findFirst: jest.fn() },
    stop: { findMany: jest.fn(), update: jest.fn() },
  };

  const notificationsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: MapService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getQueueToken('email'), useValue: { add: jest.fn() } },
        { provide: getQueueToken('account'), useValue: { add: jest.fn() } },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  describe('refreshOrderStatuses', () => {
    it('marks overdue delivery_date stops as failed', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-03-22T14:00:00.000Z'));

      prisma.user.findFirst.mockResolvedValue({ id: 'admin-1' });
      prisma.stop.findMany.mockResolvedValue([
        {
          id: 'stop-old',
          delivery_date: '2020-01-01',
          status: 'assigned',
          time_window_end: '17:00',
          time_window_start: '09:00',
          customer_name: 'Past Customer',
          driver: null,
        },
      ]);
      prisma.stop.update.mockResolvedValue({});

      await (
        service as unknown as {
          refreshOrderStatuses: (companyId: string) => Promise<void>;
        }
      ).refreshOrderStatuses('company-1');

      expect(prisma.stop.update).toHaveBeenCalledWith({
        where: { id: 'stop-old' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          status: 'failed',
          failure_reason: 'Time window expired',
        }),
      });
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'delivery_failed',
          userId: 'admin-1',
        }),
      );

      jest.useRealTimers();
    });
  });
});
