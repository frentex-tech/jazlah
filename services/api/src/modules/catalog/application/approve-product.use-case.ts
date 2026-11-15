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
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * An admin approves a product under review: it is published. NOT_FOUND for an unknown
 * product; PRODUCT_NOT_EDITABLE unless it is under review (also when another review won
 * meanwhile: a conditional update). One transaction: the move and its audit entry.
 */
@Injectable()
export class ApproveProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{ reviewerId: string; productId: string }>,
  ): Promise<ProductView> {
    const product = await this.transactions.run(async () => {
      const live = await this.products.findDetails(input.productId, null);
      if (live === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      if (live.status !== 'pending_review') {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE, {
          details: { status: live.status },
        });
      }
      ProductStatusMachine.assertCanMove(live.status, 'published');
      const moved = await this.products.transition(live.id, 'pending_review', {
        to: 'published',
        reviewerId: input.reviewerId,
        rejectionReason: null,
      });
      if (!moved) {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE);
      }
      await this.audit.write({
        actorId: input.reviewerId,
        ...CATALOG_AUDIT.productApproved,
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
