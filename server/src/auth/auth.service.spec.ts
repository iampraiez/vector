import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PaystackService } from '../billing/paystack.service';
import { NotificationsService } from '../notifications/notifications.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prisma: any = {
    company: { findUnique: jest.fn() },
    billingRecord: { findFirst: jest.fn() },
    driver: { count: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn((fn) => fn(prisma)),
  };

  const redis: any = { set: jest.fn(), get: jest.fn() };
  const emailQueue = { add: jest.fn() };
  const notificationsService = { create: jest.fn() };

  const driverDto = {
    company_code: 'FLEET-TEST',
    full_name: 'Test Driver',
    email: 'driver@test.com',
    phone: '+12345678901',
    password: 'securepass1',
    vehicle_type: 'van',
    vehicle_plate: 'XY123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-1' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
              if (key === 'JWT_SECRET') return 'secret';
              return 'test-value';
            }),
          },
        },
        { provide: getQueueToken('email'), useValue: emailQueue },
        { provide: PaystackService, useValue: {} },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('signUpDriver', () => {
    it('creates user and queues verification email on happy path', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      prisma.billingRecord.findFirst.mockResolvedValue({
        seats_included: 10,
      });
      prisma.driver.count.mockResolvedValue(0);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: driverDto.email,
      });
      prisma.user.findFirst.mockResolvedValue({ id: 'manager-1' });
      notificationsService.create.mockResolvedValue({});

      const result = await service.signUpDriver(driverDto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(emailQueue.add).toHaveBeenCalled();
      expect(result.message).toContain('verify');
    });

    it('throws NotFoundException for invalid company code', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.signUpDriver(driverDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when seat limit reached', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      prisma.billingRecord.findFirst.mockResolvedValue({
        seats_included: 2,
      });
      prisma.driver.count.mockResolvedValue(2);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.signUpDriver(driverDto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('refresh', () => {
    it('successfully rotates tokens when valid RT and session exist', async () => {
      const dto = { refresh_token: 'valid-rt' };
      const payload = { sub: 'user-1', device_id: 'dev-1' };

      const jwtService = service['jwtService'];
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(redis, 'get').mockResolvedValue('hashed-rt');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'driver',
        company_id: 'comp-1',
        email_verified: true,
        is_onboarded: true,
        full_name: 'Test',
      });

      const result = await service.refresh(dto);

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('throws UnauthorizedException if session missing in Redis', async () => {
      const dto = { refresh_token: 'valid-rt' };
      const jwtService = service['jwtService'];

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'user-1' });
      jest.spyOn(redis, 'get').mockResolvedValue(null);

      await expect(service.refresh(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
