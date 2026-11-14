/**
 * The one rate limiter the API configures (the throttler's name). The default limit
 * and `@RateLimit` both apply to it, and `@SkipRateLimit` turns it off.
 */
export const DEFAULT_RATE_LIMITER = 'default';

/** Metadata key of an endpoint's `@RateLimit` settings (a RateLimitPolicy). */
export const RATE_LIMIT_POLICY = 'jazla:rate-limit-policy';

/** Metadata key set by `@SkipRateLimit`. */
export const SKIP_RATE_LIMIT = 'jazla:skip-rate-limit';

/** A `@RateLimit` counter name: lowercase words joined by dashes or dots. */
export const RATE_LIMIT_NAME_PATTERN = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
