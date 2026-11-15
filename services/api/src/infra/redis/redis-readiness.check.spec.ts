import { TimeoutError } from '@common/async/timeout.error';
import { RedisReadinessCheck } from './redis-readiness.check';
import type { RedisService } from './redis.service';

const CLIENT_INFO =
  'id=7 addr=127.0.0.1:50000 laddr=127.0.0.1:6379 fd=8 name= age=1 idle=0 flags=N db=3 sub=0 psub=0 cmd=client|info';

/** A client configured for database 3, answering CLIENT INFO with `info`. */
function checkWith(
  info: () => Promise<string>,
  options: { db?: number } = { db: 3 },
): RedisReadinessCheck {
  return new RedisReadinessCheck({
    client: () => info(),
    options,
  } as unknown as RedisService);
}

describe('RedisReadinessCheck', () => {
  afterEach(() => jest.useRealTimers());

  it('resolves when Redis answers on the configured database', async () => {
    await expect(
      checkWith(() => Promise.resolve(CLIENT_INFO)).check(),
    ).resolves.toBeUndefined();
  });

  it('rejects when the connection is on another database (SELECT failed)', async () => {
    await expect(
      checkWith(() =>
        Promise.resolve(CLIENT_INFO.replace('db=3', 'db=0')),
      ).check(),
    ).rejects.toThrow(
      'Redis connection is on database 0, not the configured 3',
    );
  });

  it('treats an unset database as 0', async () => {
    await expect(
      checkWith(
        () => Promise.resolve(CLIENT_INFO.replace('db=3', 'db=0')),
        {},
      ).check(),
    ).resolves.toBeUndefined();
  });

  it('rejects when the command fails', async () => {
    await expect(
      checkWith(() =>
        Promise.reject(new Error('Connection is closed.')),
      ).check(),
    ).rejects.toThrow('Connection is closed.');
  });

  it('rejects with TimeoutError when Redis does not answer within 1 s', async () => {
    jest.useFakeTimers();
    const result = checkWith(() => new Promise(() => undefined)).check();
    const settled = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await jest.advanceTimersByTimeAsync(1_000);
    await settled;
  });
});
