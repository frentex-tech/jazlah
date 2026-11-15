/** Injection token of the Clock. */
export const CLOCK = Symbol('CLOCK');

/** The current time, as a port so the rules that depend on it can be tested. */
export interface Clock {
  now(): Date;
}
