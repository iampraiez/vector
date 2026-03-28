import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { PrismaService } from '../prisma/prisma.service';
import { MapService } from '../map/map.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

interface MockPrisma {
  route: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  stop: {
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  driver: {
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
}

interface MockNotificationsService {
  sendToDriver: jest.Mock;
  create: jest.Mock;
}

describe('RoutesService', () => {
  let service: RoutesService;

  const prisma: MockPrisma = {
    route: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    stop: {
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    driver: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: (p: MockPrisma) => Promise<unknown>) =>
      fn(prisma),
    ),
  };

  const notificationsService: MockNotificationsService = {
    sendToDriver: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: prisma },
        { provide: MapService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(RoutesService);
    jest.clearAllMocks();
  });

  describe('assignRoute', () => {
    it('successfully assigns a driver to a route and sends notification', async () => {
      const companyId = 'comp-1';
      const routeId = 'route-1';
      const dto = { driver_id: 'driver-1' };

      prisma.route.findUnique.mockResolvedValue({
        id: routeId,
        company_id: companyId,
      });
      prisma.driver.findUnique.mockResolvedValue({
        id: 'driver-1',
        fcm_token: 'token-123',
      });
      prisma.route.update.mockResolvedValue({
        id: routeId,
        company_id: companyId,
        driver_id: 'driver-1',
        driver: { user_id: 'user-1' },
      });

      await service.assignRoute(companyId, routeId, dto);

      expect(prisma.route.update).toHaveBeenCalledWith({
        where: { id: routeId, company_id: companyId },
        data: {
          driver_id: 'driver-1',
          status: 'scheduled',
          assigned_at: expect.any(Date) as unknown as Date,
        },
        include: {
          driver: { include: { user: true } },
          stops: true,
        },
      });
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'new_assignment',
          title: expect.stringMatching(/assigned/i) as unknown as string,
        }),
      );
    });

    it('throws error if route not found during update', async () => {
      prisma.route.update.mockRejectedValue(new Error('Record not found'));
      await expect(
        service.assignRoute('comp-1', 'invalid', { driver_id: 'd1' }),
      ).rejects.toThrow('Record not found');
    });
  });
});
