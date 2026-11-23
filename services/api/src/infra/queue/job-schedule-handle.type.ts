/** What `keepJobScheduled` returns. */
export type JobScheduleHandle = Readonly<{
  /**
   * Resolves once the schedule is registered (after any retries). Never rejects; stays
   * pending if `stop` is called first.
   */
  registered: Promise<void>;
  /** Stops retrying. A schedule already registered stays registered in Redis. */
  stop: () => void;
}>;
