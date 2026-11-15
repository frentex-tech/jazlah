import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';

/** `GET /v1/customer/auth-probe/limited`: 2 requests a minute. */
export const AUTH_PROBE_LIMIT = {
  name: 'auth-probe-limited',
  limit: 2,
  windowMs: 60_000,
} satisfies RateLimitOptions;
