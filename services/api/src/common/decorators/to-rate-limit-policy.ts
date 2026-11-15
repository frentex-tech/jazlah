import { InvalidRateLimitOptionsError } from './invalid-rate-limit-options.error';
import { RATE_LIMIT_NAME_PATTERN } from './rate-limit.constants';
import type { RateLimitOptions } from './rate-limit-options.type';
import type { RateLimitPolicy } from './rate-limit-policy.type';

/**
 * Validates `@RateLimit` settings and applies the defaults. Throws
 * InvalidRateLimitOptionsError for a name that is not lowercase words joined by dashes
 * or dots, for a limit, window or block that is not a positive whole number, and for a
 * block shorter than the window.
 *
 * Why the block may not be shorter than the window: the counter is kept while a client
 * is blocked (INCREMENT_HITS_SCRIPT), so a client back from a short block, still inside
 * the window, is blocked again by its first request. A shorter block would only read as
 * more lenient than it is.
 */
export function toRateLimitPolicy(options: RateLimitOptions): RateLimitPolicy {
  const { name } = options;
  if (typeof name !== 'string' || !RATE_LIMIT_NAME_PATTERN.test(name)) {
    throw new InvalidRateLimitOptionsError(
      String(name),
      'name must be lowercase words joined by dashes or dots, such as otp-request',
    );
  }
  const blockMs = options.blockMs ?? options.windowMs;
  const numbers = [
    ['limit', options.limit],
    ['windowMs', options.windowMs],
    ['blockMs', blockMs],
  ] as const;
  for (const [field, value] of numbers) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new InvalidRateLimitOptionsError(
        name,
        `${field} must be a positive whole number`,
      );
    }
  }
  if (blockMs < options.windowMs) {
    throw new InvalidRateLimitOptionsError(
      name,
      'blockMs must not be shorter than windowMs',
    );
  }
  return {
    name,
    limit: options.limit,
    windowMs: options.windowMs,
    blockMs,
    failClosed: options.failClosed ?? false,
  };
}
