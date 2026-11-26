/** What a customer chose of one product, apart from how many: the identity of a cart line. */
export type LineChoice = Readonly<{
  productId: string;
  sizeId: string;
  /** Null when no cutting style is chosen. */
  cuttingStyleId: string | null;
  /** Null when no packaging is chosen. */
  packaging: string | null;
  /** Sorted, each once. */
  exclusionItemIds: readonly string[];
  /** Null when the line has no note. */
  notes: string | null;
}>;
