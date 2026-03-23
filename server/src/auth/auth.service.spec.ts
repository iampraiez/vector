jest.mock('uuid', () => ({
  v4: jest.fn(() => '11111111-1111-4111-8111-111111111111'),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    company: { findUnique: jest.fn() },
    billingRecord: { findFirst: jest.fn() },
    driver: { count: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  };

  const redis = { set: jest.fn() };
  const emailQueue = { add: jest.fn() };

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
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getQueueToken('email'), useValue: emailQueue },
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

      const result = await service.signUpDriver(driverDto);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith(
        `verify:${driverDto.email}`,
        expect.any(String),
        3600,
      );
      expect(emailQueue.add).toHaveBeenCalledWith(
        'sendVerification',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { email: driverDto.email, token: expect.any(String) },
        expect.any(Object),
      );
      expect(result.message).toContain('verify');
    });

    it('throws NotFoundException for invalid company code', async () => {
      prisma.company.findUnique.mockResolvedValue(null);

      await expect(service.signUpDriver(driverDto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'company-1' });
      prisma.billingRecord.findFirst.mockResolvedValue(null);
      prisma.driver.count.mockResolvedValue(0);
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing',
        role: 'driver',
        driver_profile: { is_active: true },
      });

      await expect(service.signUpDriver(driverDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('reactivates inactive driver and queues verification', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 'company-new' });
      prisma.billingRecord.findFirst.mockResolvedValue(null);
      prisma.driver.count.mockResolvedValue(0);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-old',
        email: driverDto.email,
        role: 'driver',
        driver_profile: { is_active: false },
      });
      const userUpdate = jest.fn().mockResolvedValue({});
      const driverUpdate = jest.fn().mockResolvedValue({});
      prisma.$transaction.mockImplementation(
        async (fn: (tx: unknown) => Promise<unknown>) =>
          fn({
            user: { update: userUpdate },
            driver: { update: driverUpdate },
          }),
      );

      const result = await service.signUpDriver(driverDto);

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(userUpdate).toHaveBeenCalled();
      expect(driverUpdate).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(emailQueue.add).toHaveBeenCalled();
      expect(result.message).toMatch(/reactivat/i);
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
});
