import { seedId } from './seed-id';

/** The id of the size at `position` of the seeded product `productKey`. */
export function productSizeId(productKey: string, position: number): string {
  return seedId(`product-size:${productKey}:${position}`);
}
