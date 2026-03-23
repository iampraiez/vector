import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { DriverService } from './driver.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';
import { MapService } from '../map/map.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';

describe('DriverService', () => {
  let service: DriverService;

  const prisma = {
    route: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: MapService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getQueueToken('account'), useValue: { add: jest.fn() } },
        { provide: getQueueToken('email'), useValue: { add: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get(DriverService);
    jest.clearAllMocks();
  });

  describe('calculateDistance (Haversine)', () => {
    function haversineMeters(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ): number {
      return (
        service as unknown as {
          calculateDistance: (
            a: number,
            b: number,
            c: number,
            d: number,
          ) => number;
        }
      ).calculateDistance(lat1, lon1, lat2, lon2);
    }

    it('returns 0 for identical coordinates', () => {
      expect(haversineMeters(6.5244, 3.3792, 6.5244, 3.3792)).toBe(0);
    });

    it('returns a small distance in metres for nearby points', () => {
      const metres = haversineMeters(6.5244, 3.3792, 6.5245, 3.3792);
      expect(metres).toBeGreaterThan(0);
      expect(metres).toBeLessThan(500);
    });
  });

  describe('checkAndUpdateRouteStatus', () => {
    it('marks route completed when all stops are terminal', async () => {
      const routeUpdate = jest.fn().mockResolvedValue({});
      const stopFindFirst = jest.fn().mockResolvedValue(null);
      const routeFindFirst = jest.fn().mockResolvedValue(null);
      const driverUpdate = jest.fn().mockResolvedValue({});

      prisma.$transaction.mockImplementation(
        async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
          return fn({
            route: {
              update: routeUpdate,
              findFirst: routeFindFirst,
            },
            stop: { findFirst: stopFindFirst },
            driver: { update: driverUpdate },
          });
        },
      );

      prisma.route.findUnique.mockResolvedValue({
        id: 'route-1',
        status: 'active',
        driver_id: 'driver-1',
        stops: [{ status: 'completed' }, { status: 'failed' }],
      });

      await (
        service as unknown as {
          checkAndUpdateRouteStatus: (id: string) => Promise<void>;
        }
      ).checkAndUpdateRouteStatus('route-1');

      expect(routeUpdate).toHaveBeenCalledWith({
        where: { id: 'route-1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ status: 'completed' }),
      });
    });
  });
});
