import type { Clock } from './clock.port';

/** A clock that answers the instant it was given until moved (`set`); unit tests only. */
export class FixedClock implements Clock {
  constructor(private instant: Date) {}

  now(): Date {
    return new Date(this.instant.getTime());
  }

  set(instant: Date): void {
    this.instant = instant;
  }
}
