import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

const redisLogger = new Logger('RedisClient');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) =>
            // Retry up to 3 times with backoff, then give up
            times <= 3 ? Math.min(times * 500, 2000) : null,
        });
        client.on('error', (err: Error) => {
          // Log but don't crash the application if Redis is unavailable
          redisLogger.warn(`Redis connection failed: ${err.message}`);
        });
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
