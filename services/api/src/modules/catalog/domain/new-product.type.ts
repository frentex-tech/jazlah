import type { Money } from '@common/money/money';
import type { ProductContent } from './product-content.type';
import type { ProductFulfilment } from './product-fulfilment.type';

/** A new draft product, with its lowest size price worked out. */
export type NewProduct = Readonly<{
  vendorId: string;
  fulfilment: ProductFulfilment;
  content: ProductContent;
  minPrice: Money | null;
}>;
