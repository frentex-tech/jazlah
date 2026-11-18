/**
 * The Redis client of the active zones cache: the shared RedisService, behind its own
 * token so the e2e tests can give the cache a Redis that never answers and prove the
 * database fallback (as RATE_LIMIT_REDIS does for the rate limits).
 */
export const COVERAGE_REDIS = Symbol('COVERAGE_REDIS');
