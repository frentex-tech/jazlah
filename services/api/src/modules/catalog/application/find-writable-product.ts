import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CatalogVendors } from '../domain/ports/catalog-vendors.port';
import type { ProductRepository } from '../domain/ports/product.repository.port';
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { resolveVendorId } from './resolve-vendor-id';

/**
 * The product a write targets, within its scope: another vendor's product is NOT_FOUND,
 * exactly like a missing one.
 */
export async function findWritableProduct(
  scope: ProductWriteScope,
  productId: string,
  products: ProductRepository,
  vendors: CatalogVendors,
): Promise<ProductDetails> {
  const vendorId = await resolveVendorId(scope, vendors);
  const product = await products.findDetails(productId, vendorId);
  if (product === null) {
    throw new AppError(ErrorCode.NOT_FOUND);
  }
  return product;
}
