import { Inject, Injectable } from '@nestjs/common';
import { TransactionRunner } from '@infra/database/transaction-runner';
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
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import { Product } from '../domain/product.entity';
import type { ProductContent } from '../domain/product-content.type';
import type { ProductFulfilment } from '../domain/product-fulfilment.type';
import { assertProductContent } from './assert-product-content';
import type { ProductView } from './product-view.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { resolveVendorId } from './resolve-vendor-id';
import { toProductView } from './to-product-view';

/**
 * A vendor (or an admin, for JAZLA) creates a draft product (FR-VND-03, FR-ADM-02). A
 * draft may be incomplete: the submission rules apply when it is submitted or published.
 * What it refers to is checked (assertProductContent); sizes are new (no ids). One
 * transaction: the product, its options and its lowest price.
 */
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{
      scope: ProductWriteScope;
      actorId: string;
      fulfilment: ProductFulfilment;
      content: ProductContent;
    }>,
  ): Promise<ProductView> {
    Product.assertNoRepeats(input.content);
    const vendorId = await resolveVendorId(input.scope, this.vendors);
    Product.assertOwnSizes(input.content, null);
    await assertProductContent(
      input.content,
      this.lists,
      this.media,
      input.actorId,
      [],
    );
    const product = await this.transactions.run(() =>
      this.products.create({
        vendorId,
        fulfilment: input.fulfilment,
        content: input.content,
        minPrice: Product.minPriceOf(input.content.sizes),
      }),
    );
    return toProductView(product, null, this.media);
  }
}
