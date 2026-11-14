import type { ExecutionContext } from '@nestjs/common';

/**
 * The counter key of the default limit: one counter per client address across every
 * endpoint, so the limit is per client, not per client per endpoint. Endpoints with
 * `@RateLimit` use their own key (routeRateLimitKey).
 */
export function clientRateLimitKey(
  _context: ExecutionContext,
  tracker: string,
  limiter: string,
): string {
  return `${limiter}:client:${tracker}`;
}
