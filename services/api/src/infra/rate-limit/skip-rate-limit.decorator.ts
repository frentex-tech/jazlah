import { applyDecorators, SetMetadata } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  DEFAULT_RATE_LIMITER,
  SKIP_RATE_LIMIT,
} from '@common/decorators/rate-limit.constants';

/**
 * Exempts an endpoint (or a controller) from the per-route rate limits. Only for
 * endpoints that infrastructure calls, such as the health checks load balancers probe.
 * A controller with it may not have a `@RateLimit` endpoint: startup fails.
 */
export function SkipRateLimit(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(SKIP_RATE_LIMIT, true),
    SkipThrottle({ [DEFAULT_RATE_LIMITER]: true }),
  );
}
