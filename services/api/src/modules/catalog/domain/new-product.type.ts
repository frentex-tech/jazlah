import type { ProductContent } from './product-content.type';
import type { ProductFulfilment } from './product-fulfilment.type';

/** A new draft product; its lowest size price is worked out from the stored sizes. */
export type NewProduct = Readonly<{
  vendorId: string;
  fulfilment: ProductFulfilment;
  content: ProductContent;
}>;
