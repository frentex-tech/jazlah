import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_RATE_LIMITER,
  RATE_LIMIT_POLICY,
} from '@common/decorators/rate-limit.constants';
import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';
import { routeRateLimitKey } from '@common/decorators/route-rate-limit-key';
import { toRateLimitPolicy } from '@common/decorators/to-rate-limit-policy';

/**
 * Gives an endpoint (or every endpoint of a controller) a stricter limit than the
 * default, for example an OTP request, on a counter named `name`, per client address.
 * The default counter neither uses up nor is used up by it. Over the limit the client
 * gets 429 RATE_LIMITED with Retry-After.
 *
 * - Settings are validated when the file loads (toRateLimitPolicy): a bad value stops
 *   the application from starting.
 * - Endpoints share a counter only by declaring the same name with the same settings;
 *   the same name with other settings fails at startup, naming both endpoints.
 * - `failClosed: true` refuses requests with 503 while Redis is unavailable.
 * - Not allowed under a class-level `@SkipRateLimit` (fails at startup).
 *
 * @example @RateLimit({ name: 'otp-request', limit: 5, windowMs: 10 * 60_000, failClosed: true })
 */
export function RateLimit(
  options: RateLimitOptions,
): MethodDecorator & ClassDecorator {
  const policy = toRateLimitPolicy(options);
  return applyDecorators(
    SetMetadata(RATE_LIMIT_POLICY, policy),
    Throttle({
      [DEFAULT_RATE_LIMITER]: {
        limit: policy.limit,
        ttl: policy.windowMs,
        blockDuration: policy.blockMs,
        generateKey: routeRateLimitKey(policy.name),
      },
    }),
  );
}
