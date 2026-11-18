import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { redisConfig } from '@config/redis.config';
import type { RedisConfig } from '@config/redis-config.type';
import { withTimeout } from '@common/async/with-timeout';
import type { ActiveCoverageZone } from './active-coverage-zone.type';
import { ACTIVE_COVERAGE_ZONES_SCHEMA } from './active-coverage-zones.schema';
import type { CachedActiveZones } from './cached-active-zones.type';
import { COVERAGE_CACHE } from './coverage-cache.constants';
import { COVERAGE_REDIS } from './coverage-redis.constants';

/**
 * The active coverage zones list in Redis, so the coverage check (every address list,
 * every public check) does not read every polygon from the database.
 *
 * Versioned rather than deleted: a change increments the version (`invalidate`, after
 * its commit), and a list is written under the version read before it was loaded. A
 * reader that loaded the old list while a change committed writes it under a version
 * nobody reads any more, so it can never hide the change. Old lists expire after
 * COVERAGE_CACHE.ttlMs.
 *
 * A cache, not the truth: while the client is not connected, or Redis errors or takes
 * longer than COVERAGE_CACHE.timeoutMs, `read` answers null and the caller asks the
 * database instead; a failed write or invalidation leaves at most COVERAGE_CACHE.ttlMs
 * of staleness. A warning is logged once per outage.
 */
@Injectable()
export class ActiveCoverageZonesCache {
  private readonly logger = new Logger(ActiveCoverageZonesCache.name);
  private failing = false;

  constructor(
    @Inject(COVERAGE_REDIS) private readonly redis: Redis,
    @Inject(redisConfig.KEY)
    private readonly config: Pick<RedisConfig, 'keyPrefix'>,
  ) {}

  /**
   * The current version and its cached list (null on a miss, or when what is cached
   * does not parse); null altogether when Redis cannot answer.
   */
  read(): Promise<CachedActiveZones | null> {
    return this.attempt(async () => {
      const version = (await this.redis.get(this.versionKey())) ?? '0';
      const text = await this.redis.get(this.listKey(version));
      const parsed =
        text === null
          ? null
          : ACTIVE_COVERAGE_ZONES_SCHEMA.safeParse(JSON.parse(text));
      return { version, zones: parsed?.success === true ? parsed.data : null };
    });
  }

  /** Caches the list loaded for `version` (as `read` returned it). */
  async write(
    version: string,
    zones: readonly ActiveCoverageZone[],
  ): Promise<void> {
    await this.attempt(() =>
      this.redis.set(
        this.listKey(version),
        JSON.stringify(zones),
        'PX',
        COVERAGE_CACHE.ttlMs,
      ),
    );
  }

  /** After a zone change has committed: the next read loads the list again. */
  async invalidate(): Promise<void> {
    await this.attempt(() => this.redis.incr(this.versionKey()));
  }

  /**
   * Runs one cache operation, or answers null when Redis cannot: the failure is
   * handled by the callers falling back to the database (the cache only saves reads).
   */
  private async attempt<T>(work: () => Promise<T>): Promise<T | null> {
    if (this.redis.status !== 'ready') {
      return null;
    }
    try {
      const result = await withTimeout(work(), COVERAGE_CACHE.timeoutMs);
      if (this.failing) {
        this.failing = false;
        this.logger.log('Coverage zones cache available again');
      }
      return result;
    } catch (error) {
      if (!this.failing) {
        this.failing = true;
        this.logger.warn(
          { err: error },
          'Coverage zones cache unavailable: the coverage check reads the database until Redis answers again',
        );
      }
      return null;
    }
  }

  private versionKey(): string {
    return `${this.config.keyPrefix}:${COVERAGE_CACHE.keySegment}:version`;
  }

  private listKey(version: string): string {
    return `${this.config.keyPrefix}:${COVERAGE_CACHE.keySegment}:${version}`;
  }
}
