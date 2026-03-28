import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../prisma/prisma.service';
import { MapService } from '../map/map.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

interface MockPrisma {
  stop: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  driver: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  deliveryRating: {
    create: jest.Mock;
  };
  $transaction: jest.Mock;
}

interface MockNotificationsService {
  create: jest.Mock;
}

describe('TrackingService', () => {
  let service: TrackingService;

  const prisma: MockPrisma = {
    stop: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    driver: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    deliveryRating: {
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: (p: MockPrisma) => Promise<unknown>) =>
      fn(prisma),
    ),
  };

  const notificationsService: MockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: PrismaService,
          useValue: prisma as unknown as PrismaService,
        },
        { provide: MapService, useValue: {} },
        {
          provide: NotificationsService,
          useValue: notificationsService as unknown as NotificationsService,
        },
      ],
    }).compile();

    service = module.get(TrackingService);
    jest.clearAllMocks();
  });

  describe('rateDelivery', () => {
    it('successfully updates rating and recalculates driver average', async () => {
      const token = 'valid-token';
      const dto = { rating: 5, comment: 'Excellent' };
      const stop = {
        id: 'stop-1',
        driver_id: 'driver-1',
        company_id: 'comp-1',
        status: 'completed',
        customer_rating: null,
      };
      const driver = {
        id: 'driver-1',
        avg_rating: 4.0,
        rating_count: 10,
      };

      prisma.stop.findUnique.mockResolvedValue(stop);
      prisma.driver.findUnique.mockResolvedValue(driver);

      await service.rateDelivery(token, dto);

      expect(prisma.stop.update).toHaveBeenCalledWith({
        where: { id: 'stop-1' },
        data: {
          customer_rating: 5,
          customer_rating_comment: 'Excellent',
          customer_rated_at: expect.any(Date) as unknown as Date,
        },
      });

      expect(prisma.deliveryRating.create).toHaveBeenCalled();

      // (4.0 * 10 + 5) / 11 = 4.0909...
      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'driver-1' },
        data: {
          avg_rating: expect.closeTo(4.09, 2) as unknown as number,
          rating_count: 11,
        },
      });
    });

    it('throws NotFoundException for invalid token or status', async () => {
      prisma.stop.findUnique.mockResolvedValue(null);
      await expect(
        service.rateDelivery('invalid', { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
