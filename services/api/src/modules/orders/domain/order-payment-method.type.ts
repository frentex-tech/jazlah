/**
 * The payment methods an order can name: the names of payments' `PAYMENT_METHOD_NAMES`
 * (the domain imports no other module; the response mapper's assignment to the DTO's type
 * fails to compile if the two lists drift apart).
 */
export type OrderPaymentMethod =
  'mada' | 'card' | 'applepay' | 'cod' | 'wallet';
