import { DEFAULT_JOB_OPTIONS } from '@infra/queue/default-job-options.constants';

/** Queues that exist only in the queue e2e tests. */
export const PROBE_QUEUES = {
  /** Processed by QueueProbeProcessor, with fast retries. */
  probe: 'e2e-probe',
  /** Processed by StuckProbeProcessor, whose jobs ignore their abort signal. */
  stuck: 'e2e-stuck',
  /** Processed by StalledProbeProcessor, which fails a job at its first stall. */
  stalled: 'e2e-stalled',
  /** No processor: shows the default job options a queue gets without overriding them. */
  defaults: 'e2e-defaults',
} as const;

/**
 * The probe queues override the defaults the way a module would: spread them and change
 * only what the test needs. Three attempts with a 50 ms fixed backoff keep the retry test short.
 */
export const PROBE_JOB_OPTIONS = {
  ...DEFAULT_JOB_OPTIONS,
  attempts: 3,
  backoff: { type: 'fixed', delay: 50 },
} as const;

/**
 * Worker options of StalledProbeProcessor: look for stalled jobs every 200 ms and fail a
 * job the first time it stalls, so the stalled test takes well under a second.
 */
export const STALLED_PROBE_WORKER_OPTIONS = {
  stalledInterval: 200,
  maxStalledCount: 0,
} as const;
