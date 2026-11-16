import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CATALOG_AUDIT } from '../domain/catalog-audit-actions.constants';
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
import { Product } from '../domain/product.entity';
import type { ProductPriceChanges } from '../domain/product-price-changes.type';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { findWritableProduct } from './find-writable-product';
import type { ProductView } from './product-view.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { toProductView } from './to-product-view';

/**
 * Changes the prices of existing sizes and cutting styles, at once even when published
 * (no review). Each id must be one of the product's (VALIDATION_FAILED on
 * `sizes.<i>.sizeId` or `cuttings.<i>.cuttingStyleId`); under review:
 * PRODUCT_NOT_EDITABLE. One transaction: the prices, the lowest price, and one audit
 * entry per price that actually changed (previous and new halalas).
 */
@Injectable()
export class ChangeProductPricesUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{
      scope: ProductWriteScope;
      actorId: string;
      productId: string;
      changes: ProductPriceChanges;
    }>,
  ): Promise<ProductView> {
    Product.assertNoRepeatedPriceChanges(input.changes);
    const live = await findWritableProduct(
      input.scope,
      input.productId,
      this.products,
      this.vendors,
    );
    ProductStatusMachine.assertEditable(live.status);
    const sizes = new Map(live.sizes.map((size) => [size.id, size]));
    const cuttings = new Map(
      live.cuttings.map((cutting) => [cutting.cuttingStyleId, cutting]),
    );
    const details: FieldError[] = [
      ...input.changes.sizes.flatMap((change, index) =>
        sizes.has(change.sizeId)
          ? []
          : [
              {
                field: `sizes.${index}.sizeId`,
                constraints: ['isSizeOfProduct'],
              },
            ],
      ),
      ...input.changes.cuttings.flatMap((change, index) =>
        cuttings.has(change.cuttingStyleId)
          ? []
          : [
              {
                field: `cuttings.${index}.cuttingStyleId`,
                constraints: ['isCuttingOfProduct'],
              },
            ],
      ),
    ];
    if (details.length > 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }

    const audited = [
      ...input.changes.sizes.flatMap((change) => {
        const previous = sizes.get(change.sizeId)?.price;
        return previous === undefined || previous.equals(change.price)
          ? []
          : [
              {
                sizeId: change.sizeId,
                previousHalalas: previous.halalas,
                newHalalas: change.price.halalas,
              },
            ];
      }),
      ...input.changes.cuttings.flatMap((change) => {
        const previous = cuttings.get(change.cuttingStyleId)?.extraPrice;
        return previous === undefined || previous.equals(change.extraPrice)
          ? []
          : [
              {
                cuttingStyleId: change.cuttingStyleId,
                previousHalalas: previous.halalas,
                newHalalas: change.extraPrice.halalas,
              },
            ];
      }),
    ];
    const updated = await this.transactions.run(async () => {
      await this.products.setPrices(live.id, input.changes);
      for (const metadata of audited) {
        await this.audit.write({
          actorId: input.actorId,
          ...CATALOG_AUDIT.priceChanged,
          entityId: live.id,
          metadata,
        });
      }
      return this.products.findDetails(live.id, live.vendorId);
    });
    if (updated === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(updated, null, this.media);
  }
}
