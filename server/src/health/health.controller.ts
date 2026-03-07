import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'error';
    }

    try {
      await this.redis.set('health_check', 'ok', 5);
      const val = await this.redis.get('health_check');
      if (val !== 'ok') redisStatus = 'error';
    } catch (e) {
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
}
