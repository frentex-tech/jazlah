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
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductPriceChanges } from '../domain/product-price-changes.type';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { lockWritableProduct } from './lock-writable-product';
import type { ProductView } from './product-view.type';
import type { ProductWriteScope } from './product-write-scope.type';
import { toProductView } from './to-product-view';

/**
 * Changes the prices of existing sizes, cutting styles and packagings, at once even when
 * published (no review). Each must be one of the product's (VALIDATION_FAILED on
 * `sizes.<i>.sizeId`, `cuttings.<i>.cuttingStyleId` or `packagings.<i>.packaging`); under review:
 * PRODUCT_NOT_EDITABLE. One transaction, which first locks the product row
 * (lockProduct): the checks, the prices, the lowest price, and one audit entry per price
 * that actually changed (previous and new halalas, as read under the lock).
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
    const updated = await this.transactions.run(async () => {
      const live = await lockWritableProduct(
        input.scope,
        input.productId,
        this.products,
        this.vendors,
      );
      return this.applyPrices(input, live);
    });
    return toProductView(updated, null, this.media);
  }

  /** The checks and writes under the lock, on the product as locked. */
  private async applyPrices(
    input: Readonly<{ actorId: string; changes: ProductPriceChanges }>,
    live: ProductDetails,
  ): Promise<ProductDetails> {
    ProductStatusMachine.assertEditable(live.status);
    const sizes = new Map(live.sizes.map((size) => [size.id, size]));
    const cuttings = new Map(
      live.cuttings.map((cutting) => [cutting.cuttingStyleId, cutting]),
    );
    const packagings = new Map(
      live.packagings.map((option) => [option.packaging, option]),
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
      ...input.changes.packagings.flatMap((change, index) =>
        packagings.has(change.packaging)
          ? []
          : [
              {
                field: `packagings.${index}.packaging`,
                constraints: ['isPackagingOfProduct'],
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
      ...input.changes.packagings.flatMap((change) => {
        const previous = packagings.get(change.packaging)?.extraPrice;
        return previous === undefined || previous.equals(change.extraPrice)
          ? []
          : [
              {
                packaging: change.packaging,
                previousHalalas: previous.halalas,
                newHalalas: change.extraPrice.halalas,
              },
            ];
      }),
    ];
    const saved = await this.products.setPrices(live.id, input.changes);
    for (const metadata of audited) {
      await this.audit.write({
        actorId: input.actorId,
        ...CATALOG_AUDIT.priceChanged,
        entityId: live.id,
        metadata,
      });
    }
    return saved;
  }
}
