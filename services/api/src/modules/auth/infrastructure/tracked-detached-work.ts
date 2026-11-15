import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { trackClosing } from '@infra/shutdown/track-closing';
import type { DetachedWork } from '../domain/ports/detached-work.port';

/**
 * Work started by a request and not awaited by it, kept track of until it settles.
 *
 * At shutdown `onModuleDestroy` waits for everything still running, so a message being
 * sent is not cut off. That hook runs before the database and Redis close
 * (`onApplicationShutdown`), so the work can still use them. The wait is recorded as a
 * closing resource (`trackClosing`): if it outlasts SHUTDOWN_DEADLINE_MS, the shutdown
 * log names it instead of ending silently. Work started after the shutdown began is
 * still run and waited for.
 */
@Injectable()
export class TrackedDetachedWork implements DetachedWork, OnModuleDestroy {
  private readonly logger = new Logger(TrackedDetachedWork.name);
  private readonly running = new Map<Promise<void>, string>();

  start(name: string, work: () => Promise<void>): void {
    const settled: Promise<void> = Promise.resolve()
      .then(work)
      .catch((error: unknown) => {
        this.logger.error({ err: error, work: name }, 'Detached work failed');
      })
      .finally(() => {
        this.running.delete(settled);
      });
    this.running.set(settled, name);
  }

  async onModuleDestroy(): Promise<void> {
    while (this.running.size > 0) {
      const names = [...new Set(this.running.values())].join(', ');
      await trackClosing(`detached work (${names})`, () =>
        Promise.all(this.running.keys()),
      );
    }
  }
}
