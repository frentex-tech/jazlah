import type { Money } from '@common/money/money';
import type { LineDisplay } from './line-display.type';
import type { LineRefusal } from './line-refusal.type';

/** A choice priced now by the catalog (`CartCatalog`). */
export type LineQuote = Readonly<{
  /** Today's unit price, VAT included; zero when refused. */
  unitPrice: Money;
  /** Empty when it can be bought as chosen. */
  refusals: readonly LineRefusal[];
  /** The product's store; null when the public cannot see the product. */
  vendorId: string | null;
  /** What it shows now; null when the public cannot see the product or its size is gone. */
  display: LineDisplay | null;
  /** Its first image now; null for none or when the public cannot see it. */
  imageUrl: string | null;
}>;
