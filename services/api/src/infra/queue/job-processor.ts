import { WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job, Worker } from 'bullmq';
import { JobCancelledError } from './job-cancelled.error';
import { JobLifecycleLogger } from './job-lifecycle-logger';
import { logQueueErrors } from './log-queue-errors';
import { QUEUE_SHUTDOWN_TIMEOUT_MS } from './queue.constants';
import { closingResources } from '@infra/shutdown/closing-resources.storage';

const SHUTDOWN_CANCEL_REASON = 'the worker is shutting down';

/**
 * The base of every job processor (R17: nothing else extends WorkerHost). A module's
 * processor extends it, is decorated with `@Processor(QUEUE_NAMES.<key>)`, and
 * implements `handle`:
 *
 * - **Logging.** Each job's start, completion, retry (warn), final failure (error, with
 *   the error) and stall is logged with the queue, job name, job id and attempt number,
 *   from the worker's events (`JobLifecycleLogger`). A job BullMQ fails by itself (stalled
 *   too often) is logged too; DelayedError, WaitingChildrenError and RateLimitError are
 *   not failures and are not logged as such.
 * - **Shutdown.** When the application shuts down, BullMQ stops taking new jobs and
 *   waits for the active ones. If they are still running after `shutdownTimeoutMs`, their
 *   abort signal fires and they end with JobCancelledError: the job is retried later, on
 *   this or another instance. Pass `signal` to anything long-running so it stops promptly.
 *
 * The listeners are attached the moment @nestjs/bullmq hands the processor its worker
 * (it assigns `_worker`, intercepted below), so they are in place before the first job
 * and no method a subclass could override attaches them. R18 forbids a processor from
 * overriding `process`.
 *
 * A processor is an entry point: it reads the ids in `job.data`, calls a use case or a
 * service method, and holds no business rule. It must be idempotent, and safe to run
 * while a retry of the same job runs: a cancelled job's work can still be running when
 * its retry starts (`.claude/rules/modules.md`, "Jobs").
 */
export abstract class JobProcessor<
  Data = unknown,
  Result = unknown,
> extends WorkerHost {
  protected readonly logger = new Logger(this.constructor.name);
  /** How long a closing worker waits for active jobs before cancelling them. */
  protected readonly shutdownTimeoutMs: number = QUEUE_SHUTDOWN_TIMEOUT_MS;
  private shutdownTimer: NodeJS.Timeout | undefined;

  constructor() {
    super();
    let worker: Worker | undefined;
    // @nestjs/bullmq creates the worker in onModuleInit and assigns it to `_worker`
    // (read back by WorkerHost's `worker` getter). Intercepting the assignment attaches
    // the listeners before the worker can take a job.
    Object.defineProperty(this, '_worker', {
      configurable: false,
      enumerable: false,
      get: () => worker,
      set: (created: Worker) => {
        worker = created;
        this.listenTo(created);
      },
    });
  }

  /** Does the work of one job. Throw to fail the attempt; BullMQ retries it. */
  protected abstract handle(
    job: Job<Data, Result>,
    signal: AbortSignal,
  ): Promise<Result>;

  /**
   * Called by BullMQ for each job. It declares all three parameters on purpose: BullMQ
   * passes the abort signal only to a processor function that takes three arguments.
   */
  process(
    job: Job<Data, Result>,
    _token?: string,
    signal?: AbortSignal,
  ): Promise<Result> {
    return this.runUntilCancelled(job, signal ?? new AbortController().signal);
  }

  private listenTo(worker: Worker): void {
    new JobLifecycleLogger(this.logger).attach(worker);
    // A worker without an `error` listener would report connection errors only on the console.
    logQueueErrors(worker, this.logger);
    // @nestjs/bullmq closes the worker in onModuleDestroy and waits without limit; bound it.
    // The shutdown deadline names a worker that never finishes closing.
    let closed: (() => void) | undefined;
    worker.on('closing', () => {
      closed ??= closingResources.begin(`worker ${worker.name}`);
      this.startShutdownTimer(worker);
    });
    worker.on('closed', () => {
      clearTimeout(this.shutdownTimer);
      closed?.();
      closed = undefined;
    });
  }

  /** Settles with `handle`, or rejects with JobCancelledError as soon as `signal` fires. */
  private runUntilCancelled(
    job: Job<Data, Result>,
    signal: AbortSignal,
  ): Promise<Result> {
    const work = this.handle(job, signal);
    if (signal.aborted) {
      return Promise.reject(new JobCancelledError(signal.reason));
    }
    return new Promise<Result>((resolve, reject) => {
      const onAbort = (): void => {
        reject(new JobCancelledError(signal.reason));
        // The work was abandoned; if it fails later, say so instead of losing the error.
        work.catch((error: unknown) => {
          this.logger.warn(
            { err: error, queue: job.queueName, jobId: job.id },
            'Cancelled job failed after it was abandoned',
          );
        });
      };
      signal.addEventListener('abort', onAbort, { once: true });
      void work.then(resolve, reject).finally(() => {
        signal.removeEventListener('abort', onAbort);
      });
    });
  }

  private startShutdownTimer(worker: Worker): void {
    clearTimeout(this.shutdownTimer);
    this.shutdownTimer = setTimeout(() => {
      this.logger.warn(
        { queue: worker.name, timeoutMs: this.shutdownTimeoutMs },
        'Active jobs did not finish before the shutdown timeout; cancelling them',
      );
      worker.cancelAllJobs(SHUTDOWN_CANCEL_REASON);
    }, this.shutdownTimeoutMs);
    // The timer alone must not keep the process alive.
    this.shutdownTimer.unref();
  }
}
