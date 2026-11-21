/**
 * The active zones cache (ActiveCoverageZonesCache). Its keys, under REDIS_KEY_PREFIX:
 * `<prefix>:coverage:active-zones:version` (a counter every zone change increments) and
 * `<prefix>:coverage:active-zones:<version>` (the list read for that version).
 */
export const COVERAGE_CACHE = {
  keySegment: 'coverage:active-zones',
  /** How long a cached list lives: the bound on staleness if an invalidation is lost (Redis down during a change). */
  ttlMs: 5 * 60_000,
  /** How long one Redis call may take before the database answers instead. */
  timeoutMs: 500,
} as const;
