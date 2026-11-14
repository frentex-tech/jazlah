/** How long the readiness check waits for the database to answer. */
export const DATABASE_READINESS_TIMEOUT_MS = 1_000;

/**
 * How many times `runInTransaction` runs a transaction that fails with a serialization
 * failure or a deadlock (P2034) before giving up with TRANSACTION_CONFLICT.
 */
export const TRANSACTION_MAX_ATTEMPTS = 3;

/**
 * The retry delay is random between 0 and this many milliseconds, doubled for each
 * further attempt (full jitter), so the colliding transactions do not collide again.
 */
export const TRANSACTION_RETRY_BASE_DELAY_MS = 25;
