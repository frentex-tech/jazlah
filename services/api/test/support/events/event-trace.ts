import { Injectable } from '@nestjs/common';

/**
 * One ordered record of what happened, written by the test publisher, the subscribers
 * and the test itself, so a test can prove the order of publish, commit and delivery.
 * `waitFor` resolves when a matching entry is written: event-driven, no sleeping.
 */
@Injectable()
export class EventTrace {
  readonly entries: string[] = [];
  private readonly waiters: {
    matches: (entry: string) => boolean;
    resolve: () => void;
  }[] = [];

  add(entry: string): void {
    this.entries.push(entry);
    for (const waiter of [...this.waiters]) {
      if (waiter.matches(entry)) {
        this.waiters.splice(this.waiters.indexOf(waiter), 1);
        waiter.resolve();
      }
    }
  }

  /** Resolves once `count` entries starting with `prefix` exist. */
  waitFor(prefix: string, count = 1): Promise<void> {
    return new Promise((resolve) => {
      const check = (): boolean =>
        this.entries.filter((entry) => entry.startsWith(prefix)).length >=
        count;
      if (check()) {
        resolve();
        return;
      }
      this.waiters.push({ matches: () => check(), resolve });
    });
  }
}
