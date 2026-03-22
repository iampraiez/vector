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
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');
        const client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          retryStrategy: (times: number) => Math.min(times * 100, 3000),
          reconnectOnError: (err: Error) => err.message.includes('READONLY'),
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
