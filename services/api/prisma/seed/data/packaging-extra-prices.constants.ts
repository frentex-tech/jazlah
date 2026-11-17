import type { SeedPackaging } from './seed-packaging.type';

/**
 * The extra price of each packaging on every seeded product that offers it, in halalas
 * (VAT included): vacuum packing costs 5 SAR, trays 2 SAR, bags and none nothing.
 */
export const PACKAGING_EXTRA_PRICES: Readonly<Record<SeedPackaging, number>> = {
  trays: 200,
  bags: 0,
  vacuum: 500,
  none: 0,
};
