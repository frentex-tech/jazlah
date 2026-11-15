import type { DetachedWork } from '../ports/detached-work.port';

/**
 * Detached work that a test can wait for. `start` returns at once without running
 * anything, as the real one returns before the work is done; `settle` then runs
 * everything started so far.
 */
export class InMemoryDetachedWork implements DetachedWork {
  readonly started: string[] = [];
  private pending: (() => Promise<void>)[] = [];

  start(name: string, work: () => Promise<void>): void {
    this.started.push(name);
    this.pending.push(work);
  }

  async settle(): Promise<void> {
    const work = this.pending;
    this.pending = [];
    for (const each of work) {
      await each();
    }
  }
}
