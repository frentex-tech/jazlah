/** The kinds of order, from what the cart holds: each has its own cut-off and lead time; `mixed` is a cart of several kinds (the strictest rule applies). */
export const ORDER_TYPES = [
  'ready_meat',
  'carcass',
  'cooked',
  'occasion',
  'adha',
  'mixed',
] as const;
