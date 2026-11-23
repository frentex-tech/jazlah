import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import type { ProductReadScope } from './product-read-scope.type';
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * One product with its latest change request (pending, or the last decided one with its
 * reason): a vendor's own (another vendor's is NOT_FOUND, like a missing one) or any
 * (admins).
 */
@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(
    scope: ProductReadScope,
    productId: string,
  ): Promise<ProductView> {
    const product = await this.products.findDetails(
      productId,
      scope.kind === 'vendor' ? scope.vendorId : null,
    );
    if (product === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(
      product,
      await this.changeRequests.findLatestOf(product.id),
      this.media,
    );
  }
}
