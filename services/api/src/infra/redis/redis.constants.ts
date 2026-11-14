/** How long opening a Redis connection may take before it fails and is retried. */
export const REDIS_CONNECT_TIMEOUT_MS = 5_000;

/**
 * How many times the shared client retries one command while Redis is unreachable
 * before rejecting it. Low, so a caller gets a fast error instead of waiting.
 * (BullMQ's workers use their own connections, which retry without limit.)
 */
export const REDIS_MAX_RETRIES_PER_REQUEST = 1;

/** How long the readiness check waits for Redis to answer PING. */
export const REDIS_READINESS_TIMEOUT_MS = 1_000;
