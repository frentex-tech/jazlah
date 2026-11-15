import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';
import type { Money } from '@common/money/money';
import type { NamedReference } from './named-reference.type';
import type { ProductCuttingOption } from './product-cutting-option.type';
import type { ProductFulfilment } from './product-fulfilment.type';
import type { ProductPackaging } from './product-packaging.type';
import type { ProductSize } from './product-size.type';
import type { ProductStatus } from './product-status.type';

/** A product as it is live, with the names of what it refers to. */
export type ProductDetails = Readonly<{
  id: string;
  vendorId: string;
  status: ProductStatus;
  isAvailable: boolean;
  fulfilment: ProductFulfilment;
  name: LocalizedText;
  description: OptionalLocalizedText;
  category: NamedReference;
  meatType: NamedReference | null;
  imageMediaIds: readonly string[];
  sizes: readonly ProductSize[];
  cuttings: readonly ProductCuttingOption[];
  packagings: readonly ProductPackaging[];
  exclusions: readonly NamedReference[];
  /** The lowest size price; null while there is no size. */
  minPrice: Money | null;
  /** The admin's reason; null unless rejected. */
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;
