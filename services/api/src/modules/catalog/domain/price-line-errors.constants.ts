/**
 * Why a product line cannot be bought (`priceLine`'s `errors`): a public contract shared
 * with the apps, whose own price function returns the same names
 * (docs/frontend/fixtures/pricing-cases.json). Never rename one.
 *
 * - `PRODUCT_UNAVAILABLE`: the product is switched off, or no longer for sale.
 * - `SIZE_UNAVAILABLE`: the chosen size is switched off.
 * - `OPTION_NOT_IN_PRODUCT`: a size, cutting style, packaging or "without" item the
 *   product does not offer.
 * - `INCOMPATIBLE_CUTTING_PACKAGING`: the chosen cutting style and packaging may not be
 *   chosen together (an admin rule).
 * - `OPTION_REQUIRED`: the product offers cutting styles and none is chosen. Unlike the
 *   others the line keeps the price of what is chosen, so the total still shows.
 */
export const PRICE_LINE_ERRORS = [
  'PRODUCT_UNAVAILABLE',
  'SIZE_UNAVAILABLE',
  'OPTION_NOT_IN_PRODUCT',
  'INCOMPATIBLE_CUTTING_PACKAGING',
  'OPTION_REQUIRED',
] as const;
