/** Where a payment is: `initiated` waiting for the customer on the provider’s page; `authorized` and `captured` paid; `failed` and `cancelled` not paid; then refunds. */
export const PAYMENT_STATUS_NAMES = [
  'initiated',
  'authorized',
  'captured',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
] as const;
