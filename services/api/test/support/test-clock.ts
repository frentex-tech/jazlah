import type { Clock } from '@modules/auth/domain/ports/clock.port';

/**
 * The auth module's clock for e2e tests: the real time plus an offset a test moves
 * forward, to make codes and tokens expire and resend waits pass without sleeping.
 */
export class TestClock implements Clock {
  private offsetMs = 0;

  now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  advanceSeconds(seconds: number): void {
    this.offsetMs += seconds * 1000;
  }
}
