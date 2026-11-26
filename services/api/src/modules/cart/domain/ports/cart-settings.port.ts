import type { CartSettings } from '../cart-settings.type';

export const CART_SETTINGS = Symbol('CART_SETTINGS');

/** The operations settings the cart obeys, read on every call. */
export interface CartSettingsSource {
  current(): Promise<CartSettings>;
}
