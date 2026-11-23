import { Injectable, Logger } from '@nestjs/common';
import { withTimeout } from '@common/async/with-timeout';
import { DATABASE_READINESS_TIMEOUT_MS } from '../database/database.constants';
import { PrismaService } from '../database/prisma.service';
import { RedisReadinessCheck } from '../redis/redis-readiness.check';
import type { DependencyStatus } from './dependency-status.type';
import type { ReadinessReport } from './readiness-report.type';
import { ShutdownState } from './shutdown-state';

/**
 * Checks, in parallel, that each dependency the API needs answers. Unavailable from
 * the start of shutdown, whatever the dependencies answer (ShutdownState).
 */
@Injectable()
export class ReadinessService {
  private readonly logger = new Logger(ReadinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisReadinessCheck,
    private readonly shutdown: ShutdownState,
  ) {}

  async check(): Promise<ReadinessReport> {
    const [database, redis] = await Promise.all([
      this.probe('Database', () =>
        withTimeout(
          this.prisma.$queryRaw`SELECT 1`,
          DATABASE_READINESS_TIMEOUT_MS,
        ),
      ),
      this.probe('Redis', () => this.redis.check()),
    ]);
    if (this.shutdown.draining) {
      return {
        status: 'unavailable',
        checks: { database, redis },
        draining: true,
      };
    }
    return {
      status: database === 'up' && redis === 'up' ? 'ok' : 'unavailable',
      checks: { database, redis },
    };
  }

  private async probe(
    name: string,
    attempt: () => Promise<unknown>,
  ): Promise<DependencyStatus> {
    try {
      await attempt();
      return 'up';
    } catch (error) {
      // Logged for operators with the request id; the response only says "down".
      this.logger.warn({ err: error }, `${name} readiness check failed`);
      return 'down';
    }
  }
}
