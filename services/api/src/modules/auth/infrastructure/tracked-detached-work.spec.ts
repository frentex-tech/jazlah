import { Logger } from '@nestjs/common';
import { closingResources } from '@infra/shutdown/closing-resources.storage';
import { TrackedDetachedWork } from './tracked-detached-work';

/** A promise a test settles by hand. */
function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

/** Lets pending promise callbacks run. */
async function tick(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('TrackedDetachedWork', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts the work and returns before it is done', async () => {
    const work = new TrackedDetachedWork();
    const gate = deferred();
    let finished = false;

    work.start('otp-sms', async () => {
      await gate.promise;
      finished = true;
    });
    await tick();

    expect(finished).toBe(false);
    gate.resolve();
    await tick();
    expect(finished).toBe(true);
  });

  it('makes shutdown wait for work still running, and names it as closing', async () => {
    const work = new TrackedDetachedWork();
    const gate = deferred();
    work.start('otp-sms', () => gate.promise);
    await tick();

    let closed = false;
    const closing = work.onModuleDestroy().then(() => {
      closed = true;
    });
    await tick();

    expect(closed).toBe(false);
    expect(closingResources.list()).toContain('detached work (otp-sms)');

    gate.resolve();
    await closing;
    expect(closed).toBe(true);
    expect(closingResources.list()).not.toContain('detached work (otp-sms)');
  });

  it('shuts down at once when nothing is running', async () => {
    const work = new TrackedDetachedWork();
    work.start('otp-sms', () => Promise.resolve());
    await tick();

    await expect(work.onModuleDestroy()).resolves.toBeUndefined();
  });

  it('logs work that rejects, and shutdown still completes', async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const work = new TrackedDetachedWork();
    const failure = new Error('send failed');

    work.start('otp-sms', () => Promise.reject(failure));
    await work.onModuleDestroy();

    expect(error).toHaveBeenCalledWith(
      { err: failure, work: 'otp-sms' },
      'Detached work failed',
    );
  });
});
