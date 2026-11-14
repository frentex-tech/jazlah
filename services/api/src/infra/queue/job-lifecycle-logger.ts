import type { LoggerService } from '@nestjs/common';
import { UnrecoverableError, type Worker } from 'bullmq';
import type { JobLogContext } from './job-log-context.type';
import type { LoggableJob } from './loggable-job.type';

/**
 * Writes the log line for each step of a job's life: started, completed, failed with a
 * retry to come (warn), failed for the last time (error, with the error), and stalled
 * (warn: the worker running it stopped renewing its lock). Every line carries the
 * queue, the job name, the job id and the attempt number; never the job's data, which
 * can hold personal data.
 *
 * `attach(worker)` listens to the worker's own events, which BullMQ emits after it has
 * recorded the outcome in Redis: "completed" is logged once the completion is stored,
 * a job failed by BullMQ itself (stalled too often) is logged like any other final
 * failure, and BullMQ's control-flow errors (DelayedError, WaitingChildrenError,
 * WaitingError, RateLimitError), which move a job without failing it, emit no
 * "failed" event and so are never logged as failures. Attached by `JobProcessor` when
 * its worker is created, outside any method a processor could override.
 */
export class JobLifecycleLogger {
  constructor(
    private readonly logger: Pick<LoggerService, 'log' | 'warn' | 'error'>,
  ) {}

  attach(worker: Worker): void {
    worker.on('active', (job) => this.started(job));
    worker.on('completed', (job) => this.completed(job));
    worker.on('failed', (job, error) => this.failed(job, error));
    worker.on('stalled', (jobId) => this.stalled(worker.name, jobId));
  }

  started(job: LoggableJob): void {
    this.logger.log(contextOf(job, job.attemptsMade + 1), 'Job started');
  }

  completed(job: LoggableJob): void {
    this.logger.log(
      { ...contextOf(job, job.attemptsMade), durationMs: durationOf(job) },
      'Job completed',
    );
  }

  /** `job` is undefined only when BullMQ could not load the job it failed. */
  failed(job: LoggableJob | undefined, error: unknown): void {
    if (job === undefined) {
      this.logger.error(
        { err: error },
        'Job failed; the job could not be read',
      );
      return;
    }
    if (willRetry(job, error)) {
      this.logger.warn(
        { ...contextOf(job, job.attemptsMade), err: error },
        'Job failed; it will be retried',
      );
    } else {
      this.logger.error(
        { ...contextOf(job, job.attemptsMade), err: error },
        'Job failed on its last attempt; it is kept as failed',
      );
    }
  }

  stalled(queue: string, jobId: string): void {
    this.logger.warn(
      { queue, jobId },
      'Job stalled: its worker stopped renewing the lock; it is run again or failed',
    );
  }
}

/**
 * `attempt` is this run's number, from 1. While a job is active `attemptsMade` counts
 * the earlier runs; once BullMQ has recorded the outcome (the "completed" and "failed"
 * events) it includes this run.
 */
function contextOf(job: LoggableJob, attempt: number): JobLogContext {
  return {
    queue: job.queueName,
    jobName: job.name,
    jobId: job.id,
    attempt,
    maxAttempts: maxAttemptsOf(job),
  };
}

/** A job added without `attempts` (or with 0) runs once, as BullMQ treats it. */
function maxAttemptsOf(job: LoggableJob): number {
  return Math.max(job.opts.attempts ?? 1, 1);
}

function durationOf(job: LoggableJob): number | undefined {
  return job.finishedOn !== undefined && job.processedOn !== undefined
    ? job.finishedOn - job.processedOn
    : undefined;
}

/**
 * Whether BullMQ will retry the job after this recorded failure: attempts are left and
 * the error is not an UnrecoverableError (the same test as BullMQ's `Job.shouldRetryJob`).
 */
function willRetry(job: LoggableJob, error: unknown): boolean {
  const unrecoverable =
    error instanceof UnrecoverableError ||
    (error instanceof Error && error.name === 'UnrecoverableError');
  return !unrecoverable && job.attemptsMade < maxAttemptsOf(job);
}
