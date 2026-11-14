/**
 * The prefix of every BullMQ key in Redis (`jazla:<queue>:...`), so the API's queues
 * are recognisable when Redis is shared or inspected.
 */
export const QUEUE_KEY_PREFIX = 'jazla';

/**
 * How long a closing worker waits for its active jobs before it cancels them. Below the
 * usual 30 s an orchestrator allows between SIGTERM and SIGKILL, so the API still
 * closes its connections cleanly.
 */
export const QUEUE_SHUTDOWN_TIMEOUT_MS = 25_000;

/**
 * How long adding a job may take before the producer gets SERVICE_UNAVAILABLE
 * (`BoundedQueue`): covers waiting for the first connection and a connected but slow
 * Redis. A Redis that is down is refused at once, without waiting.
 */
export const QUEUE_ADD_TIMEOUT_MS = 500;

/**
 * How long one attempt to register a job schedule may take (`keepJobScheduled`). Longer
 * than an add: it runs once, at startup, possibly before the first connection.
 */
export const QUEUE_SCHEDULE_TIMEOUT_MS = 5_000;

/** The wait before the first retry of a failed schedule registration; doubles each time. */
export const QUEUE_SCHEDULE_RETRY_MS = 1_000;

/** The longest wait between two retries of a schedule registration. */
export const QUEUE_SCHEDULE_MAX_RETRY_MS = 60_000;
