import type { ProductPackaging } from './product-packaging.type';

/** What a customer chose of one product: the options of a cart line and its quantity. */
export type LineSelection = Readonly<{
  sizeId: string;
  /** Null when no cutting style is chosen. */
  cuttingStyleId: string | null;
  /** Null when no packaging is chosen. */
  packaging: ProductPackaging | null;
  exclusionItemIds: readonly string[];
  /** A whole number, at least 1 (checked by the caller's DTO). */
  quantity: number;
}>;
