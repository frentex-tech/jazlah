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
