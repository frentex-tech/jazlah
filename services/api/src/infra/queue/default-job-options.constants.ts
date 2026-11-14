import type { DefaultJobOptions } from 'bullmq';

const HOUR_IN_SECONDS = 60 * 60;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;

/**
 * The job options every queue starts from (set on the BullMQ root config in
 * `queue.module.ts`). A queue that needs other values passes its own
 * `defaultJobOptions` to `BullModule.registerQueue`, spread from this object so
 * the values it does not change stay the same.
 */
export const DEFAULT_JOB_OPTIONS = {
  /** Five tries in all: the first run and four retries. */
  attempts: 5,
  /** Waits 1 s, 2 s, 4 s and 8 s before the retries: a short outage is ridden out. */
  backoff: { type: 'exponential', delay: 1_000 },
  /** A completed job is kept one day, and at most the 1,000 latest, then removed. */
  removeOnComplete: { age: DAY_IN_SECONDS, count: 1_000 },
  /**
   * A job that used up its attempts stays failed for 14 days so it can be inspected and
   * retried by hand, then is removed. Never removed on failure.
   */
  removeOnFail: { age: 14 * DAY_IN_SECONDS },
} as const satisfies DefaultJobOptions;
