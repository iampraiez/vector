import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redis: RedisService,
    private readonly health: HealthIndicatorService,
  ) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const session = this.health.check(key);
    try {
      await this.redis.set('terminus_redis_ping', '1', 5);
      const val = await this.redis.get('terminus_redis_ping');
      if (val !== '1') {
        return session.down({ message: 'Redis read-back mismatch' });
      }
      return session.up();
    } catch (err) {
      return session.down({ message: String(err) });
    }
  }
}
