/** The current instant, injected so tests choose the time (`FixedClock`). */
export interface Clock {
  now(): Date;
}

/** The injection token of `Clock`; `SystemClock` in production. */
export const CLOCK = Symbol('CLOCK');
