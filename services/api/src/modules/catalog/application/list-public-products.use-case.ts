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
import type { PublicProductFilter } from '../domain/public-product-filter.type';
import type { ProductCard } from './product-card.type';
import { toProductCards } from './to-product-cards';

/**
 * The public product list (FR-CAT-03), for anyone: published, available products of
 * active vendors in active categories, newest first, filtered by category, vendor, meat
 * type, lowest price and a text in the name, each with its vendor's name and cover
 * image.
 */
@Injectable()
export class ListPublicProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
  ) {}

  async execute(
    filter: PublicProductFilter,
    page: PageRequest,
  ): Promise<Page<ProductCard>> {
    return toProductCards(
      await this.products.listPublic(filter, page),
      this.media,
      this.vendors,
    );
  }
}
