import type { NamedReference } from './named-reference.type';
import type { ProductPackaging } from './product-packaging.type';

/** A cutting and packaging rule with its cutting style's name, for a vendor's form. */
export type NamedIncompatibility = Readonly<{
  cuttingStyle: NamedReference;
  packaging: ProductPackaging;
}>;
