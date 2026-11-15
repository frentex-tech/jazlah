import type { Queue } from 'bullmq';
import { keepJobScheduled } from './keep-job-scheduled';
import {
  QUEUE_SCHEDULE_MAX_RETRY_MS,
  QUEUE_SCHEDULE_RETRY_MS,
  QUEUE_SCHEDULE_TIMEOUT_MS,
} from './queue.constants';

const SCHEDULE = { schedulerId: 'cleanup', jobName: 'run', everyMs: 60_000 };

/** A logger whose calls the test reads; each method is a standalone mock. */
function logger(): {
  log: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
} {
  const log = jest.fn();
  const warn = jest.fn();
  const error = jest.fn();
  return { log, warn, error };
}

/** A queue whose upsertJobScheduler settles as each call's entry in `outcomes` says. */
function queue(outcomes: ('ok' | 'fail' | 'hang')[]): {
  queue: Queue;
  upsert: jest.Mock;
} {
  const upsert = jest.fn(() => {
    const outcome = outcomes.shift() ?? 'ok';
    if (outcome === 'ok') return Promise.resolve({});
    if (outcome === 'fail')
      return Promise.reject(new Error('Connection is closed.'));
    return new Promise(() => undefined);
  });
  return {
    queue: {
      name: 'cleanup-queue',
      upsertJobScheduler: upsert,
    } as unknown as Queue,
    upsert,
  };
}

/** Lets the settled promises' callbacks run. */
const flush = async (): Promise<void> => {
  for (let index = 0; index < 5; index += 1) {
    await Promise.resolve();
  }
};

describe('keepJobScheduled', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('registers the schedule once when Redis answers', async () => {
    const { queue: target, upsert } = queue(['ok']);
    const log = logger();

    const handle = keepJobScheduled(target, SCHEDULE, log);
    await handle.registered;

    expect(upsert).toHaveBeenCalledWith(
      'cleanup',
      { every: 60_000 },
      { name: 'run' },
    );
    expect(log.log).toHaveBeenCalledTimes(1);
    expect(log.warn).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('retries with a doubling delay until it succeeds, warning each time', async () => {
    const { queue: target, upsert } = queue(['fail', 'fail', 'ok']);
    const log = logger();

    const handle = keepJobScheduled(target, SCHEDULE, log);
    let registered = false;
    void handle.registered.then(() => {
      registered = true;
    });
    await flush();
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(registered).toBe(false);

    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_RETRY_MS);
    expect(upsert).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_RETRY_MS * 2 - 1);
    expect(upsert).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(upsert).toHaveBeenCalledTimes(3);
    await flush();

    expect(log.warn).toHaveBeenCalledTimes(2);
    expect(log.log).toHaveBeenCalledTimes(1);
    expect(registered).toBe(true);
  });

  it('bounds an attempt that never answers, then retries', async () => {
    const { queue: target, upsert } = queue(['hang', 'ok']);
    const log = logger();

    keepJobScheduled(target, SCHEDULE, log);
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_TIMEOUT_MS);
    expect(log.warn).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_RETRY_MS);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(log.log).toHaveBeenCalledTimes(1);
  });

  it('caps the delay between retries', async () => {
    const { queue: target, upsert } = queue(Array<'fail'>(12).fill('fail'));

    keepJobScheduled(target, SCHEDULE, logger());
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_MAX_RETRY_MS * 4);
    const calls = upsert.mock.calls.length;
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_MAX_RETRY_MS);

    expect(upsert.mock.calls.length).toBe(calls + 1);
  });

  it('stops retrying once stopped', async () => {
    const { queue: target, upsert } = queue(['fail', 'fail']);

    const { stop } = keepJobScheduled(target, SCHEDULE, logger());
    await flush();
    stop();
    await jest.advanceTimersByTimeAsync(QUEUE_SCHEDULE_MAX_RETRY_MS);

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
