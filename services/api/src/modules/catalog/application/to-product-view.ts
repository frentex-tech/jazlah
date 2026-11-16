import type { CatalogMedia } from '../domain/ports/catalog-media.port';
import type { ProductChangeRequest } from '../domain/product-change-request.type';
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductView } from './product-view.type';

/** The product with one read of its (and its change request's) image URLs. */
export async function toProductView(
  product: ProductDetails,
  changeRequest: ProductChangeRequest | null,
  media: CatalogMedia,
): Promise<ProductView> {
  const ids = [
    ...product.imageMediaIds,
    ...(changeRequest?.content.imageMediaIds ?? []),
  ];
  return {
    product,
    imageUrls: await media.publicUrls([...new Set(ids)]),
    changeRequest,
  };
}
