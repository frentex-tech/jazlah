/**
 * Prefix of every rate limit key in Redis. The rest of the key is a SHA-256 hash in
 * braces (a cluster hash tag) and `:hits` or `:blocked` (rateLimitKeys).
 */
export const RATE_LIMIT_KEY_PREFIX = 'jazla:rate-limit:';

/**
 * How long a request waits for a connected Redis to answer before the storage gives up
 * (fail open, or 503 on a fail-closed endpoint). While the client is not connected the
 * storage does not wait at all.
 */
export const RATE_LIMIT_STORAGE_TIMEOUT_MS = 500;

/**
 * Injection token of the Redis client the rate limit storage uses: the shared
 * RedisService by default. Tests replace it to simulate an unreachable Redis.
 */
export const RATE_LIMIT_REDIS = Symbol('RATE_LIMIT_REDIS');

/** The throttler name and key prefix of the pre-routing limit (PreRoutingRateLimiter). */
export const PRE_ROUTING_RATE_LIMITER = 'pre-routing';

/**
 * Paths the pre-routing limit does not count: the health checks, which load balancers
 * probe constantly (they are also exempt from the per-route limits).
 */
export const PRE_ROUTING_EXEMPT_PATHS: ReadonlySet<string> = new Set([
  '/v1/health',
  '/v1/health/ready',
]);
