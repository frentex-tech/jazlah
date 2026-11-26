import type { OrderPaymentMethod } from './order-payment-method.type';
import type { OrderStatus } from './order-status.type';

/**
 * The status an order starts in (ORD-API-1): cash on delivery and the wallet alone need
 * no payment first, so `new` (waiting for review); an online method is
 * `pending_payment` until paid. Moving on belongs to the state machine (ORD-API-2).
 */
export function initialStatusFor(method: OrderPaymentMethod): OrderStatus {
  return method === 'cod' || method === 'wallet' ? 'new' : 'pending_payment';
}
