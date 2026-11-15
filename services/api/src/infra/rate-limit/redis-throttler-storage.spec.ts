import { Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { RATE_LIMIT_STORAGE_TIMEOUT_MS } from './rate-limit.constants';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';
import { RedisThrottlerStorage } from './redis-throttler-storage';

function storageAnswering(
  evalReply: () => Promise<unknown>,
  status: () => string = () => 'ready',
) {
  const evalCalls: unknown[][] = [];
  const redis = {
    get status() {
      return status();
    },
    eval: (...args: unknown[]) => {
      evalCalls.push(args);
      return evalReply();
    },
  } as unknown as Redis;
  return { storage: new RedisThrottlerStorage(redis), evalCalls };
}

describe('RedisThrottlerStorage', () => {
  let warn: jest.SpyInstance;
  let log: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('converts the script reply, with times in whole seconds', async () => {
    const { storage } = storageAnswering(() =>
      Promise.resolve([3, 59_001, 0, 0]),
    );
    await expect(storage.increment('k', 60_000, 5, 60_000)).resolves.toEqual({
      totalHits: 3,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
  });

  it('reports a block with the seconds until it ends', async () => {
    const { storage } = storageAnswering(() =>
      Promise.resolve([6, 30_000, 1, 30_000]),
    );
    await expect(
      storage.increment('k', 60_000, 5, 60_000),
    ).resolves.toMatchObject({ isBlocked: true, timeToBlockExpire: 30 });
  });

  it('sends hashed, hash-tagged keys, so no client address reaches Redis', async () => {
    const { storage, evalCalls } = storageAnswering(() =>
      Promise.resolve([1, 60_000, 0, 0]),
    );
    await storage.increment('default:client:203.0.113.7', 60_000, 5, 60_000);
    const keys = evalCalls[0].slice(2, 4) as string[];
    expect(keys[0]).toMatch(/^jazla:rate-limit:\{[0-9a-f]{64}\}:hits$/);
    expect(keys[1]).toMatch(/^jazla:rate-limit:\{[0-9a-f]{64}\}:blocked$/);
    expect(keys.join()).not.toContain('203.0.113.7');
  });

  it.each(['connecting', 'reconnecting', 'close', 'end', 'wait'])(
    'does not send anything while the client is %s',
    async (status) => {
      const { storage, evalCalls } = storageAnswering(
        () => Promise.resolve([1, 60_000, 0, 0]),
        () => status,
      );
      await expect(
        storage.increment('k', 60_000, 1, 60_000),
      ).rejects.toBeInstanceOf(RateLimitStorageUnavailableError);
      expect(evalCalls).toHaveLength(0);
    },
  );

  it('reports unavailable when Redis errors, warning once per outage', async () => {
    const { storage } = storageAnswering(() =>
      Promise.reject(new Error('connect ECONNREFUSED')),
    );
    await expect(
      storage.increment('k', 60_000, 1, 60_000),
    ).rejects.toBeInstanceOf(RateLimitStorageUnavailableError);
    await expect(
      storage.increment('k', 60_000, 1, 60_000),
    ).rejects.toBeInstanceOf(RateLimitStorageUnavailableError);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('reports unavailable when a connected Redis does not answer in time', async () => {
    jest.useFakeTimers();
    const { storage } = storageAnswering(() => new Promise(() => undefined));
    const result = storage.increment('k', 60_000, 1, 60_000);
    const settled = expect(result).rejects.toBeInstanceOf(
      RateLimitStorageUnavailableError,
    );
    await jest.advanceTimersByTimeAsync(RATE_LIMIT_STORAGE_TIMEOUT_MS);
    await settled;
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('reports unavailable on a reply that is not four numbers', async () => {
    const { storage } = storageAnswering(() => Promise.resolve(['x']));
    await expect(
      storage.increment('k', 60_000, 1, 60_000),
    ).rejects.toBeInstanceOf(RateLimitStorageUnavailableError);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('logs the recovery and warns again at the next outage', async () => {
    let up = false;
    const { storage } = storageAnswering(() =>
      up
        ? Promise.resolve([1, 60_000, 0, 0])
        : Promise.reject(new Error('down')),
    );
    await storage.increment('k', 60_000, 5, 60_000).catch(() => undefined);
    up = true;
    await storage.increment('k', 60_000, 5, 60_000);
    expect(log).toHaveBeenCalledWith('Rate limit storage available again');
    up = false;
    await storage.increment('k', 60_000, 5, 60_000).catch(() => undefined);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
