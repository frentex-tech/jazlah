import type { ExecutionContext } from '@nestjs/common';

/**
 * The key generator of a `@RateLimit` counter named `name`: one counter per client
 * address per name, separate from the client's default counter. Every endpoint
 * declaring the same name shares it. The rate limit storage hashes the key before it
 * reaches Redis.
 */
export function routeRateLimitKey(
  name: string,
): (context: ExecutionContext, tracker: string, limiter: string) => string {
  return (_context, tracker, limiter) => `${limiter}:route:${name}:${tracker}`;
}
