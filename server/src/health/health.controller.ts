import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RedisHealthIndicator } from './redis-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    try {
      await this.redis.set('health_check', 'ok', 5);
      const val = await this.redis.get('health_check');
      if (val !== 'ok') redisStatus = 'error';
    } catch {
      redisStatus = 'error';
    }

    const status = dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      version: '1.0.0',
    };
  }

  @Get('detailed')
  @HealthCheck()
  detailed() {
    const apiKey = this.config.getOrThrow<string>('GEOAPIFY_API_KEY');
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?${new URLSearchParams(
      {
        apiKey,
        text: 'health',
        limit: '1',
      },
    ).toString()}`;

    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.redisHealth.pingCheck('redis'),
      () =>
        this.http.pingCheck('geoapify', geoUrl, {
          timeout: 8000,
        }),
    ]);
  }
}
