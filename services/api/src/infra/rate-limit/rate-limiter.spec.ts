import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ConfiguredRateLimits } from '@config/configured-rate-limits.type';
import { InvalidRateLimitSetupError } from './invalid-rate-limit-setup.error';
import { RateLimitStorageUnavailableError } from './rate-limit-storage-unavailable.error';
import { RateLimiter } from './rate-limiter';
import type { RedisThrottlerStorage } from './redis-throttler-storage';
import type { ThrottlerStorageRecord } from './throttler-storage-record.type';

const CONFIGURED: ConfiguredRateLimits = {
  otpRequestAddress: { limit: 30, windowMs: 600_000 },
  otpVerifyAddress: { limit: 30, windowMs: 600_000 },
  otpRequestPhone: { limit: 2, windowMs: 600_000 },
  otpRequestPhoneDaily: { limit: 10, windowMs: 86_400_000 },
};

/** A storage that counts in memory as the Redis script does: block once over the limit. */
class CountingStorage {
  readonly hits = new Map<string, number>();
  readonly calls: unknown[][] = [];
  failing = false;

  increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<ThrottlerStorageRecord> {
    this.calls.push([key, ttl, limit, blockDuration]);
    if (this.failing) {
      return Promise.reject(new RateLimitStorageUnavailableError());
    }
    const hits = (this.hits.get(key) ?? 0) + 1;
    this.hits.set(key, hits);
    return Promise.resolve({
      totalHits: hits,
      timeToExpire: ttl / 1000,
      isBlocked: hits > limit,
      timeToBlockExpire: hits > limit ? blockDuration / 1000 : 0,
    });
  }
}

function build(): { limiter: RateLimiter; storage: CountingStorage } {
  const storage = new CountingStorage();
  const limiter = new RateLimiter(storage as unknown as RedisThrottlerStorage, {
    configured: CONFIGURED,
  });
  return { limiter, storage };
}

const PHONE = {
  name: 'otp-request-phone',
  failClosed: true,
  from: (limits: ConfiguredRateLimits) => limits.otpRequestPhone,
} as const;

async function errorOf(work: Promise<void>): Promise<unknown> {
  try {
    await work;
  } catch (error) {
    return error;
  }
  throw new Error('expected a rejection');
}

describe('RateLimiter', () => {
  it('allows up to the limit, then refuses with RATE_LIMITED and the time to wait', async () => {
    const { limiter } = build();

    await limiter.consume(PHONE, 'a');
    await limiter.consume(PHONE, 'a');
    const error = await errorOf(limiter.consume(PHONE, 'a'));

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      code: ErrorCode.RATE_LIMITED,
      retryAfterSeconds: 600,
    });
  });

  it('counts each key apart', async () => {
    const { limiter } = build();

    await limiter.consume(PHONE, 'a');
    await limiter.consume(PHONE, 'a');

    await expect(limiter.consume(PHONE, 'b')).resolves.toBeUndefined();
  });

  it('counts with the configured numbers under a key of its own kind', async () => {
    const { limiter, storage } = build();

    await limiter.consume(PHONE, 'a');

    expect(storage.calls).toEqual([
      ['default:keyed:otp-request-phone:a', 600_000, 2, 600_000],
    ]);
  });

  it('refuses with SERVICE_UNAVAILABLE when the storage fails and the limit fails closed', async () => {
    const { limiter, storage } = build();
    storage.failing = true;

    const error = await errorOf(limiter.consume(PHONE, 'a'));

    expect(error).toMatchObject({ code: ErrorCode.SERVICE_UNAVAILABLE });
  });

  it('lets the request through when the storage fails and the limit fails open', async () => {
    const { limiter, storage } = build();
    storage.failing = true;

    await expect(
      limiter.consume({ name: 'open', limit: 1, windowMs: 1_000 }, 'a'),
    ).resolves.toBeUndefined();
  });

  it('refuses a name used again with other settings', async () => {
    const { limiter } = build();
    await limiter.consume({ name: 'twice', limit: 1, windowMs: 1_000 }, 'a');

    const error = await errorOf(
      limiter.consume({ name: 'twice', limit: 2, windowMs: 1_000 }, 'a'),
    );

    expect(error).toBeInstanceOf(InvalidRateLimitSetupError);
  });
});
