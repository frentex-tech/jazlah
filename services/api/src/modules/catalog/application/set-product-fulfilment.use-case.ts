import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
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
import type { ProductFulfilment } from '../domain/product-fulfilment.type';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { lockWritableProduct } from './lock-writable-product';
import type { ProductView } from './product-view.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { toProductView } from './to-product-view';

/**
 * Sets how a product reaches the customer (FR-PRD-07), at once even when published.
 * Under review: PRODUCT_NOT_EDITABLE.
 */
@Injectable()
export class SetProductFulfilmentUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{
      scope: ProductWriteScope;
      productId: string;
      fulfilment: ProductFulfilment;
    }>,
  ): Promise<ProductView> {
    const updated = await this.transactions.run(async () => {
      const live = await lockWritableProduct(
        input.scope,
        input.productId,
        this.products,
        this.vendors,
      );
      ProductStatusMachine.assertEditable(live.status);
      await this.products.setFulfilment(live.id, input.fulfilment);
      return this.products.findDetails(live.id, live.vendorId);
    });
    if (updated === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(updated, null, this.media);
  }
}
