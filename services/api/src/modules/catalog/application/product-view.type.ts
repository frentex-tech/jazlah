import type { ProductChangeRequest } from '../domain/product-change-request.type';
import type { ProductDetails } from '../domain/product-details.type';

/**
 * A product as a vendor or an admin reads it: live, with the public URL of every image
 * it or its latest change request shows, and that change request (null for none).
 */
export type ProductView = Readonly<{
  product: ProductDetails;
  imageUrls: ReadonlyMap<string, string>;
  changeRequest: ProductChangeRequest | null;
}>;
