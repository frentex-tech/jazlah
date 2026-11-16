import type { CatalogVendors } from '../domain/ports/catalog-vendors.port';
import type { ProductRepository } from '../domain/ports/product.repository.port';
import type { ProductDetails } from '../domain/product-details.type';
import { lockProduct } from './lock-product';
import type { ProductWriteScope } from './product-write-scope.type';
import { resolveVendorId } from './resolve-vendor-id';

/**
 * Locks and reads the product a write targets, within its scope: another vendor's
 * product is NOT_FOUND, exactly like a missing one. Called first inside the write's
 * transaction (lockProduct).
 */
export async function lockWritableProduct(
  scope: ProductWriteScope,
  productId: string,
  products: ProductRepository,
  vendors: CatalogVendors,
): Promise<ProductDetails> {
  return lockProduct(
    productId,
    await resolveVendorId(scope, vendors),
    products,
  );
}
