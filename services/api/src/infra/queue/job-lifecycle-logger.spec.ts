import { UnrecoverableError } from 'bullmq';
import { JobLifecycleLogger } from './job-lifecycle-logger';
import type { LoggableJob } from './loggable-job.type';

function recordingLogger() {
  const lines: {
    level: 'log' | 'warn' | 'error';
    fields: unknown;
    message: unknown;
  }[] = [];
  const logger = new JobLifecycleLogger({
    log: (fields: unknown, message: unknown) =>
      lines.push({ level: 'log', fields, message }),
    warn: (fields: unknown, message: unknown) =>
      lines.push({ level: 'warn', fields, message }),
    error: (fields: unknown, message: unknown) =>
      lines.push({ level: 'error', fields, message }),
  });
  return { lines, logger };
}

/**
 * A job as BullMQ hands it to a worker event. `attemptsMade` counts the runs BullMQ has
 * recorded: the earlier ones while the job is active, this one too once it completed or
 * failed.
 */
function job(
  attemptsMade: number,
  attempts?: number,
  times: Partial<Pick<LoggableJob, 'processedOn' | 'finishedOn'>> = {},
): LoggableJob {
  return {
    queueName: 'example-queue',
    name: 'example-job',
    id: 'job-1',
    attemptsMade,
    opts: attempts === undefined ? {} : { attempts },
    ...times,
  };
}

const CONTEXT = {
  queue: 'example-queue',
  jobName: 'example-job',
  jobId: 'job-1',
};

describe('JobLifecycleLogger', () => {
  it('logs the start with the queue, job name, id and attempt', () => {
    const { lines, logger } = recordingLogger();
    logger.started(job(0, 5));
    expect(lines).toEqual([
      {
        level: 'log',
        fields: { ...CONTEXT, attempt: 1, maxAttempts: 5 },
        message: 'Job started',
      },
    ]);
  });

  it('logs completion with the duration BullMQ recorded', () => {
    const { lines, logger } = recordingLogger();
    logger.completed(job(3, 5, { processedOn: 1_000, finishedOn: 1_037 }));
    expect(lines).toEqual([
      {
        level: 'log',
        fields: { ...CONTEXT, attempt: 3, maxAttempts: 5, durationMs: 37 },
        message: 'Job completed',
      },
    ]);
  });

  it('logs a failure with attempts left at warn, as a retry', () => {
    const { lines, logger } = recordingLogger();
    const error = new Error('provider timed out');
    logger.failed(job(4, 5), error);
    expect(lines).toEqual([
      {
        level: 'warn',
        fields: { ...CONTEXT, attempt: 4, maxAttempts: 5, err: error },
        message: 'Job failed; it will be retried',
      },
    ]);
  });

  it('logs the failure of the last attempt at error, with the error', () => {
    const { lines, logger } = recordingLogger();
    const error = new Error('provider timed out');
    logger.failed(job(5, 5), error);
    expect(lines).toEqual([
      {
        level: 'error',
        fields: { ...CONTEXT, attempt: 5, maxAttempts: 5, err: error },
        message: 'Job failed on its last attempt; it is kept as failed',
      },
    ]);
  });

  it('treats an UnrecoverableError as final even with attempts left', () => {
    const { lines, logger } = recordingLogger();
    logger.failed(job(1, 5), new UnrecoverableError('bad input'));
    expect(lines[0]?.level).toBe('error');
  });

  it('treats a job without an attempts option as a single attempt', () => {
    const { lines, logger } = recordingLogger();
    logger.failed(job(1), new Error('x'));
    expect(lines[0]).toMatchObject({
      level: 'error',
      fields: { attempt: 1, maxAttempts: 1 },
    });
  });

  it('logs a failure BullMQ could not attach to a job at error', () => {
    const { lines, logger } = recordingLogger();
    const error = new Error('missing job');
    logger.failed(undefined, error);
    expect(lines).toEqual([
      {
        level: 'error',
        fields: { err: error },
        message: 'Job failed; the job could not be read',
      },
    ]);
  });

  it('logs a stalled job at warn, with its queue and id', () => {
    const { lines, logger } = recordingLogger();
    logger.stalled('example-queue', 'job-1');
    expect(lines).toMatchObject([
      { level: 'warn', fields: { queue: 'example-queue', jobId: 'job-1' } },
    ]);
  });

  it('never logs the job data', () => {
    const { lines, logger } = recordingLogger();
    const withData = { ...job(0, 1), data: { phone: '+966500000000' } };
    logger.started(withData);
    logger.failed(withData, new Error('x'));
    expect(JSON.stringify(lines)).not.toContain('+966500000000');
  });
});
