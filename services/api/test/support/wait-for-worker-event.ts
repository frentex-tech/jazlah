import type { Job, Worker } from 'bullmq';

/**
 * Resolves with the first job for which the worker emits `event` and `matches` holds.
 * Event-driven, so tests wait exactly as long as the work takes, with no sleeping.
 */
export function waitForWorkerEvent(
  worker: Worker,
  event: 'active' | 'completed' | 'failed',
  matches: (job: Job) => boolean,
): Promise<Job> {
  return new Promise((resolve) => {
    const listener = (job: Job | undefined): void => {
      if (job !== undefined && matches(job)) {
        worker.off(event, listener);
        resolve(job);
      }
    };
    worker.on(event, listener);
  });
}
