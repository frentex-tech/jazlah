import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ProductRepository } from '../domain/ports/product.repository.port';
import type { ProductDetails } from '../domain/product-details.type';

/**
 * Locks the product row (ProductRepository.lockForWrite), then reads the product: of
 * this vendor only, or of any vendor when `vendorId` is null; NOT_FOUND otherwise.
 *
 * Every use case that writes to a product or its children (sizes, cuttings, images,
 * options, change requests) calls it first inside its transaction, and decides from
 * what it returns. Writers to one product then run one after another, each reading what
 * the previous one committed: two price edits cannot each work out the lowest price
 * without the other's change, and an approval cannot write back a price read before
 * a price edit committed.
 */
export async function lockProduct(
  productId: string,
  vendorId: string | null,
  products: ProductRepository,
): Promise<ProductDetails> {
  const locked = await products.lockForWrite(productId, vendorId);
  const product = locked
    ? await products.findDetails(productId, vendorId)
    : null;
  if (product === null) {
    throw new AppError(ErrorCode.NOT_FOUND);
  }
  return product;
}
