import { DEFAULT_RATE_LIMITER } from '@common/decorators/rate-limit.constants';

/**
 * The storage key of a `RateLimiter` counter: one counter per `name` per caller-supplied
 * `key`. The `keyed` segment keeps it apart from every `@RateLimit` counter (`route`)
 * and from the default one (`client`), whatever the name. The storage hashes the whole
 * key before it reaches Redis (rateLimitKeys).
 */
export function keyedRateLimitKey(name: string, key: string): string {
  return `${DEFAULT_RATE_LIMITER}:keyed:${name}:${key}`;
}
