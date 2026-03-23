import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { RedisHealthIndicator } from './redis-health.indicator';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({ timeout: 8000, maxRedirects: 0 }),
    PrismaModule,
    RedisModule,
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
