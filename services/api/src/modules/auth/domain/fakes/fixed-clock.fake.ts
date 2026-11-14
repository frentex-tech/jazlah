import type { Clock } from '../ports/clock.port';

/** A clock that stands still until a test moves it. */
export class FixedClock implements Clock {
  private current: Date;

  constructor(start: string) {
    this.current = new Date(start);
  }

  now(): Date {
    return new Date(this.current.getTime());
  }

  advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}
