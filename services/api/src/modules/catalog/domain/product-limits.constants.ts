/**
 * Bounds on what one product holds (*session* numbers, DECISIONS.md, Catalog): well
 * above a real product, low enough to keep a product one reasonable read. The price
 * bound keeps an amount inside the integer column (1,000,000 SAR per size).
 */
export const PRODUCT_LIMITS = {
  images: 10,
  sizes: 20,
  cuttings: 30,
  exclusions: 30,
  maxPriceHalalas: 100_000_000,
  maxWeightGrams: 10_000_000,
} as const;
