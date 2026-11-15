import { InvalidRateLimitOptionsError } from './invalid-rate-limit-options.error';
import { RATE_LIMIT_NAME_PATTERN } from './rate-limit.constants';
import type { RateLimitDeclaration } from './rate-limit-declaration.type';
import type { RateLimitOptions } from './rate-limit-options.type';
import { toRateLimitPolicy } from './to-rate-limit-policy';

/**
 * What `@RateLimit(options)` stores, checked as far as it can be when the file loads:
 * the name always; the numbers too when they are written in the decorator
 * (toRateLimitPolicy). Numbers picked from configuration (`from`) are validated when
 * the application starts (resolveRateLimitPolicy).
 */
export function toRateLimitDeclaration(
  options: RateLimitOptions,
): RateLimitDeclaration {
  if (options.from === undefined) {
    return toRateLimitPolicy(options);
  }
  const { name, from } = options;
  if (typeof name !== 'string' || !RATE_LIMIT_NAME_PATTERN.test(name)) {
    throw new InvalidRateLimitOptionsError(
      String(name),
      'name must be lowercase words joined by dashes or dots, such as otp-request',
    );
  }
  return { name, failClosed: options.failClosed ?? false, from };
}
