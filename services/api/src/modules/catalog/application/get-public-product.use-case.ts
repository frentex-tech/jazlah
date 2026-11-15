import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  CATALOG_VENDORS,
  type CatalogVendors,
} from '../domain/ports/catalog-vendors.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import type { PublicProductView } from './public-product-view.type';

/**
 * One product for anyone (FR-PRD-01 to 05, 07), with its options. NOT_FOUND unless it
 * is published, available, of an active vendor and in an active category: a hidden
 * product is answered exactly like a missing one.
 */
@Injectable()
export class GetPublicProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
  ) {}

  async execute(productId: string): Promise<PublicProductView> {
    const product = await this.products.findPublic(productId);
    if (product === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const [imageUrls, names] = await Promise.all([
      this.media.publicUrls(product.imageMediaIds),
      this.vendors.namesOf([product.vendorId]),
    ]);
    return {
      product,
      imageUrls,
      vendorName: names.get(product.vendorId) ?? null,
    };
  }
}
