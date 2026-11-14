import type { RateLimitConfig } from '@config/rate-limit-config.type';
import type { RateLimitOptions } from '@common/decorators/rate-limit-options.type';

/**
 * The limits the rate limit tests run with: 5 requests a minute per endpoint (default
 * counter), 10 a minute before routing.
 */
export const PROBE_DEFAULT_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 5,
  preRoutingMaxRequests: 10,
};

/** The stricter limit of `GET /v1/rate-limit-probe/strict`: 2 requests a minute. */
export const STRICT_PROBE_LIMIT: RateLimitOptions = {
  name: 'probe-strict',
  limit: 2,
  windowMs: 60_000,
};

/** One counter declared on two endpoints (`shared-a`, `shared-b`): 3 a minute. */
export const SHARED_PROBE_LIMIT: RateLimitOptions = {
  name: 'probe-shared',
  limit: 3,
  windowMs: 60_000,
};

/** `GET /v1/rate-limit-probe/fail-closed`: refused while Redis is unavailable. */
export const FAIL_CLOSED_PROBE_LIMIT: RateLimitOptions = {
  name: 'probe-fail-closed',
  limit: 100,
  windowMs: 60_000,
  failClosed: true,
};
