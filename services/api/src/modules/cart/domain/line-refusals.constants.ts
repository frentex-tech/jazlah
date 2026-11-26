/**
 * Why a choice cannot be bought, in the order the cart reports the first of them when a
 * line is added (the contract of POST /v1/customer/cart/items). Each is an error code.
 */
export const LINE_REFUSALS = [
  'PRODUCT_UNAVAILABLE',
  'OPTION_NOT_IN_PRODUCT',
  'SIZE_UNAVAILABLE',
  'INCOMPATIBLE_CUTTING_PACKAGING',
  'OPTION_REQUIRED',
] as const;
