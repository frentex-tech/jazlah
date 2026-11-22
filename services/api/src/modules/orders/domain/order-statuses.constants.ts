/** Where an order is. `pending_payment` until paid (15 minutes, then `cancelled`); `new` a cash-on-delivery order waiting for review; `collected` a pickup order handed over; `delivered`, `collected`, `cancelled` and `returned` are final. */
export const ORDER_STATUSES = [
  'pending_payment',
  'new',
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'collected',
  'cancelled',
  'delivery_failed',
  'returned',
] as const;
