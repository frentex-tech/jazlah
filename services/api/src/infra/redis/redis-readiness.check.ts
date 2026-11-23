import { Injectable } from '@nestjs/common';
import { withTimeout } from '@common/async/with-timeout';
import { RedisWrongDatabaseError } from './redis-wrong-database.error';
import { REDIS_READINESS_TIMEOUT_MS } from './redis.constants';
import { RedisService } from './redis.service';

/**
 * Whether the shared Redis client answers in time, on the logical database it was
 * configured with. Used by the readiness endpoint (`src/infra/health/`).
 *
 * Why the database is checked: when Redis refuses the database of REDIS_URL (SELECT
 * fails, for example on a server with fewer databases or in cluster mode), ioredis logs
 * the error and stays connected on database 0, where PING still answers. The client
 * would then read and write another environment's data while looking healthy.
 */
@Injectable()
export class RedisReadinessCheck {
  constructor(private readonly redis: RedisService) {}

  /** Resolves when Redis answers on the configured database within the timeout; rejects otherwise. */
  async check(): Promise<void> {
    const info = await withTimeout(
      this.redis.client('INFO'),
      REDIS_READINESS_TIMEOUT_MS,
    );
    const match = /(?:^|\s)db=(\d+)(?:\s|$)/.exec(String(info));
    const actual = match === null ? undefined : Number(match[1]);
    const expected = this.redis.options.db ?? 0;
    if (actual !== expected) {
      throw new RedisWrongDatabaseError(expected, actual);
    }
  }
}
