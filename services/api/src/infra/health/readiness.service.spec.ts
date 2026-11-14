import type { PrismaService } from '../database/prisma.service';
import type { RedisReadinessCheck } from '../redis/redis-readiness.check';
import { ReadinessService } from './readiness.service';
import { ShutdownState } from './shutdown-state';

const answers = (): Promise<unknown> => Promise.resolve([{ '?column?': 1 }]);

function serviceWith(
  query: () => Promise<unknown>,
  redisCheck: () => Promise<void> = () => Promise.resolve(),
  shutdown: ShutdownState = new ShutdownState(),
): ReadinessService {
  const prisma = { $queryRaw: query } as unknown as PrismaService;
  const redis = { check: redisCheck } as unknown as RedisReadinessCheck;
  return new ReadinessService(prisma, redis, shutdown);
}

describe('ReadinessService', () => {
  afterEach(() => jest.useRealTimers());

  it('is ok when the database and Redis answer', async () => {
    await expect(serviceWith(answers).check()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('is unavailable, without the driver error, when the database fails', async () => {
    const service = serviceWith(() =>
      Promise.reject(
        new Error('connect ECONNREFUSED postgresql://user:secret@db:5432/app'),
      ),
    );
    const report = await service.check();
    expect(report).toEqual({
      status: 'unavailable',
      checks: { database: 'down', redis: 'up' },
    });
    expect(JSON.stringify(report)).not.toContain('secret');
  });

  it('is unavailable when the database does not answer in time', async () => {
    jest.useFakeTimers();
    const service = serviceWith(() => new Promise(() => undefined));
    const result = service.check();
    await jest.advanceTimersByTimeAsync(1_000);
    await expect(result).resolves.toEqual({
      status: 'unavailable',
      checks: { database: 'down', redis: 'up' },
    });
  });

  it('is unavailable, naming Redis and without its error, when Redis fails', async () => {
    const service = serviceWith(answers, () =>
      Promise.reject(
        new Error('connect ECONNREFUSED redis://:secret@cache:6379'),
      ),
    );
    const report = await service.check();
    expect(report).toEqual({
      status: 'unavailable',
      checks: { database: 'up', redis: 'down' },
    });
    expect(JSON.stringify(report)).not.toContain('secret');
  });

  it('is unavailable, marked draining, from the start of shutdown', async () => {
    const shutdown = new ShutdownState();
    const service = serviceWith(answers, undefined, shutdown);
    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
    shutdown.onModuleDestroy();
    await expect(service.check()).resolves.toEqual({
      status: 'unavailable',
      checks: { database: 'up', redis: 'up' },
      draining: true,
    });
  });
});
