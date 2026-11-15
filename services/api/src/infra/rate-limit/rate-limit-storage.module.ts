import { Module } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RATE_LIMIT_REDIS } from './rate-limit.constants';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * Provides the Redis rate limit storage to ThrottlerModule's factory. The storage uses
 * the shared Redis client (RedisService, from the global RedisModule) through the
 * RATE_LIMIT_REDIS token.
 */
@Module({
  providers: [
    { provide: RATE_LIMIT_REDIS, useExisting: RedisService },
    RedisThrottlerStorage,
  ],
  exports: [RedisThrottlerStorage],
})
export class RateLimitStorageModule {}
