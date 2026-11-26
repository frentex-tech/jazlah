import type { CartOrderType } from '../cart-order-type.type';
import type { FulfilmentMethod } from '../fulfilment-method.type';
import type { PickupPoint } from '../pickup-point.type';

export const CART_SCHEDULING = Symbol('CART_SCHEDULING');

/** The scheduling engine as the cart needs it. */
export interface CartScheduling {
  /** Nothing when the day can be chosen; DAY_FULL or DAY_NOT_AVAILABLE (`details.reason`) otherwise. */
  assertDayAvailable(
    request: Readonly<{
      vendorId: string;
      method: FulfilmentMethod;
      orderTypes: readonly CartOrderType[];
      date: string;
    }>,
  ): Promise<void>;

  /** Where the store's pickup orders are collected. */
  pickupPoint(vendorId: string): Promise<PickupPoint>;
}
