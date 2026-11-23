import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_RATE_LIMITER,
  RATE_LIMIT_POLICY,
} from '@common/decorators/rate-limit.constants';
import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';
import { routeRateLimitKey } from '@common/decorators/route-rate-limit-key';
import { toRateLimitDeclaration } from '@common/decorators/to-rate-limit-declaration';

/**
 * Gives an endpoint (or every endpoint of a controller) a stricter limit than the
 * default, for example an OTP request, on a counter named `name`, per client address.
 * The default counter neither uses up nor is used up by it. Over the limit the client
 * gets 429 RATE_LIMITED with Retry-After.
 *
 * - The numbers are written here, or picked from configuration with `from` (the
 *   `rateLimit.configured` limits, which come from the environment). Written numbers
 *   are validated when the file loads; configured ones when the application starts
 *   (RateLimitPolicyCheck). Either way a bad value stops the application from starting.
 *   Nothing is read from configuration when the file loads, so the OpenAPI document
 *   can still be generated without a running application.
 * - Endpoints share a counter only by declaring the same name with the same settings;
 *   the same name with other settings fails at startup, naming both endpoints.
 * - `failClosed: true` refuses requests with 503 while Redis is unavailable.
 * - Not allowed under a class-level `@SkipRateLimit` (fails at startup).
 *
 * The guard (RateLimitGuard) takes the limit, window and block from the stored
 * declaration, resolved the same way as the startup check resolves it; the throttler's
 * own metadata only carries the counter's key.
 *
 * @example @RateLimit({ name: 'otp-request', limit: 5, windowMs: 10 * 60_000, failClosed: true })
 * @example @RateLimit({ name: 'otp-request', failClosed: true, from: (limits) => limits.otpRequestAddress })
 */
export function RateLimit(
  options: RateLimitOptions,
): MethodDecorator & ClassDecorator {
  const declaration = toRateLimitDeclaration(options);
  return applyDecorators(
    SetMetadata(RATE_LIMIT_POLICY, declaration),
    Throttle({
      [DEFAULT_RATE_LIMITER]: {
        generateKey: routeRateLimitKey(declaration.name),
      },
    }),
  );
}
