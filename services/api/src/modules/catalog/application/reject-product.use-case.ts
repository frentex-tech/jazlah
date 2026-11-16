import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CATALOG_AUDIT } from '../domain/catalog-audit-actions.constants';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import { ProductStatusMachine } from '../domain/product-status.state-machine';
import { lockProduct } from './lock-product';
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * An admin rejects a product under review with a reason the vendor sees; the vendor
 * edits it and submits again. NOT_FOUND for an unknown product; PRODUCT_NOT_EDITABLE
 * unless it is under review. One transaction: the move and its audit entry.
 */
@Injectable()
export class RejectProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{ reviewerId: string; productId: string; reason: string }>,
  ): Promise<ProductView> {
    const product = await this.transactions.run(async () => {
      const live = await lockProduct(input.productId, null, this.products);
      ProductStatusMachine.assertCanMove(live.status, 'rejected');
      const moved = await this.products.transition(live.id, live.status, {
        to: 'rejected',
        reviewerId: input.reviewerId,
        rejectionReason: input.reason,
      });
      if (!moved) {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE);
      }
      await this.audit.write({
        actorId: input.reviewerId,
        ...CATALOG_AUDIT.productRejected,
        entityId: live.id,
      });
      return this.products.findDetails(live.id, null);
    });
    if (product === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return toProductView(product, null, this.media);
  }
}
