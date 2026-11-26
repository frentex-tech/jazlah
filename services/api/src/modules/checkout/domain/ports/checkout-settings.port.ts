import type { CodRules } from '../cod-rules.type';
import type { OrderingPause } from '../ordering-pause.type';

export const CHECKOUT_SETTINGS = Symbol('CHECKOUT_SETTINGS');

/** The operations settings checkout obeys, read on every call. */
export interface CheckoutSettings {
  pause(): Promise<OrderingPause>;
  cod(): Promise<CodRules>;
}
