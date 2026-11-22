/** How a customer pays: online (`mada`, `card`, `applepay`, through the provider’s page), `cod` cash on delivery, or `wallet` the whole total from the wallet. */
export const PAYMENT_METHOD_NAMES = [
  'mada',
  'card',
  'applepay',
  'cod',
  'wallet',
] as const;
