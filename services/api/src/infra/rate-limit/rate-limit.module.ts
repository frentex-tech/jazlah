import { Module } from '@nestjs/common';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { DEFAULT_RATE_LIMITER } from '@common/decorators/rate-limit.constants';
import { rateLimitConfig } from '@config/rate-limit.config';
import type { RateLimitConfig } from '@config/rate-limit-config.type';
import { clientRateLimitKey } from './client-rate-limit-key';
import { PreRoutingRateLimiter } from './pre-routing-rate-limiter';
import { RateLimitPolicyCheck } from './rate-limit-policy.check';
import { RateLimitStorageModule } from './rate-limit-storage.module';
import { RateLimitGuard } from './rate-limit.guard';
import { RedisThrottlerStorage } from './redis-throttler-storage';

/**
 * Rate limiting, in two layers, both counted in Redis (RedisThrottlerStorage) and shared
 * by every instance:
 *
 * 1. Before routing (PreRoutingRateLimiter, mounted by `configureHttpApp`): every
 *    request per client address, unknown routes and malformed bodies included.
 * 2. Per route (RateLimitGuard, global): RATE_LIMIT_MAX_REQUESTS per
 *    RATE_LIMIT_WINDOW_MS per client address, one counter across all endpoints;
 *    `@RateLimit(...)` gives an endpoint a stricter limit on a named counter;
 *    `@SkipRateLimit()` exempts it (health checks).
 *
 * The address is `req.ip`, which honours TRUST_PROXY_HOPS. While Redis is unavailable
 * requests go through, except on `@RateLimit({ failClosed: true })` endpoints (503).
 * Over a limit: 429 RATE_LIMITED with Retry-After. RateLimitPolicyCheck refuses to start
 * when the declared limits contradict each other.
 */
@Module({
  imports: [
    DiscoveryModule,
    RateLimitStorageModule,
    ThrottlerModule.forRootAsync({
      imports: [RateLimitStorageModule],
      inject: [rateLimitConfig.KEY, RedisThrottlerStorage],
      useFactory: (
        config: RateLimitConfig,
        storage: RedisThrottlerStorage,
      ) => ({
        throttlers: [
          {
            name: DEFAULT_RATE_LIMITER,
            ttl: config.windowMs,
            limit: config.maxRequests,
          },
        ],
        generateKey: clientRateLimitKey,
        storage,
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    RateLimitPolicyCheck,
    PreRoutingRateLimiter,
  ],
  exports: [PreRoutingRateLimiter],
})
export class RateLimitModule {}
