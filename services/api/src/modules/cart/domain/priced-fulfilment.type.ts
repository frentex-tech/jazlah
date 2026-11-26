import type { CartFulfilment } from './cart-fulfilment.type';
import type { PickupPoint } from './pickup-point.type';

/** The chosen fulfilment as the cart shows it: the delivery window, or where to collect. */
export type PricedFulfilment = CartFulfilment &
  Readonly<{
    /** The delivery window, Riyadh time; null for pickup. */
    window: Readonly<{ start: string; end: string }> | null;
    /** Null for delivery. */
    pickupPoint: PickupPoint | null;
  }>;
