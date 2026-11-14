/**
 * The shared Redis connection is not on the logical database REDIS_URL names (SELECT
 * failed). Readiness reports Redis as down. Internal.
 */
export class RedisWrongDatabaseError extends Error {
  constructor(expected: number, actual: number | undefined) {
    super(
      `Redis connection is on database ${actual ?? 'unknown'}, not the configured ${expected}`,
    );
    this.name = 'RedisWrongDatabaseError';
  }
}
