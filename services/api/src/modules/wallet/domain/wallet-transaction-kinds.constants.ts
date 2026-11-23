/** Why the balance moved: an admin credit or debit, paying an order, money given back after a failed or cancelled payment, or a refund. */
export const WALLET_TRANSACTION_KINDS = [
  'admin_credit',
  'admin_debit',
  'order_payment',
  'payment_restored',
  'order_refund',
] as const;
