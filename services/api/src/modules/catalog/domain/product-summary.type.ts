import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Money } from '@common/money/money';
import type { ProductStatus } from './product-status.type';

/** A product in a list: enough for a card. */
export type ProductSummary = Readonly<{
  id: string;
  vendorId: string;
  categoryId: string;
  meatTypeId: string | null;
  status: ProductStatus;
  isAvailable: boolean;
  name: LocalizedText;
  /** The lowest size price; null while there is no size. */
  minPrice: Money | null;
  /** The first image; null while there is none. */
  coverMediaId: string | null;
  createdAt: Date;
}>;
