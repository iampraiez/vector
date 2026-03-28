import {
  Global,
  Logger,
  Module,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
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
          enableReadyCheck: true,
          connectTimeout: 10000,
          retryStrategy: (times: number) => {
            if (times > 3) {
              redisLogger.error('Redis reconnection attempts exhausted.');
              return null; // Stop retrying after 3 attempts
            }
            return Math.min(times * 1000, 3000);
          },
          reconnectOnError: (err: Error) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              return true;
            }
            return false;
          },
        });

        client.on('error', (err: Error) => {
          redisLogger.error(`Redis connection error: ${err.message}`);
        });

        client.on('connect', () => {
          redisLogger.log('Redis client connected');
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy() {
    redisLogger.log('Closing Redis connection...');
    try {
      await this.redis.quit();
      redisLogger.log('Redis connection closed successfully.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      redisLogger.warn(`Error during Redis shutdown: ${errorMessage}`);
    }
  }
}
