import type { Redis } from 'ioredis';
import { RATE_LIMIT_KEY_PREFIX } from '@infra/rate-limit/rate-limit.constants';

/** Deletes every rate limit counter and block in the (test) Redis database. */
export async function clearRateLimits(redis: Redis): Promise<void> {
  let cursor = '0';
  do {
    const [next, keys] = await redis.scan(
      cursor,
      'MATCH',
      `${RATE_LIMIT_KEY_PREFIX}*`,
      'COUNT',
      1000,
    );
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = next;
  } while (cursor !== '0');
}
