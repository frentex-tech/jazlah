import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
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
import type { ProductListFilter } from '../domain/product-list-filter.type';
import type { ProductCard } from './product-card.type';
import type { ProductReadScope } from './product-read-scope.type';
import { toProductCards } from './to-product-cards';

/**
 * Products newest first, optionally of one status: a vendor's own (its id from the
 * token replaces any vendor filter) or any vendor's (admins, the review queue with
 * status pending_review).
 */
@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
  ) {}

  async execute(
    scope: ProductReadScope,
    filter: ProductListFilter,
    page: PageRequest,
  ): Promise<Page<ProductCard>> {
    const scoped: ProductListFilter =
      scope.kind === 'vendor'
        ? { ...filter, vendorId: scope.vendorId }
        : filter;
    return toProductCards(
      await this.products.list(scoped, page),
      this.media,
      this.vendors,
    );
  }
}
