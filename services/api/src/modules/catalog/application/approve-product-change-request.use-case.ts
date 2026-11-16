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
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../domain/ports/product.repository.port';
import { ProductChangeRequestReviewMachine } from '../domain/product-change-request-review.state-machine';
import { lockProduct } from './lock-product';
import type { ProductView } from './product-view.type';
import { toProductView } from './to-product-view';

/**
 * An admin approves a pending change request: its content becomes the live product in
 * one transaction (the product's tables, the lowest price, the request's decision and
 * the audit entry), after locking the product row (lockProduct): a writer to the product
 * waits, and the request is read again under the lock. A request never changes, so the
 * content applied is the one the admin saw. Existing sizes and cutting styles keep their
 * stored prices (ProductRepository.saveContent: a price changed after the request
 * stays). NOT_FOUND for an unknown or decided request; PRODUCT_CHANGE_REQUEST_SUPERSEDED
 * when the vendor has edited again since (ProductChangeRequestReviewMachine);
 * PRODUCT_NOT_EDITABLE if the product is no longer published.
 */
@Injectable()
export class ApproveProductChangeRequestUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{ reviewerId: string; requestId: string }>,
  ): Promise<ProductView> {
    const product = await this.transactions.run(async () => {
      const found = await this.changeRequests.findById(input.requestId);
      if (found === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      const live = await lockProduct(found.productId, null, this.products);
      // Its status again under the lock: an edit just before it may have superseded it.
      const request = await this.changeRequests.findById(found.id);
      if (request === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      ProductChangeRequestReviewMachine.assertCanMove(
        request.status,
        'approved',
      );
      if (live.status !== 'published') {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE, {
          details: { status: live.status },
        });
      }
      const decided = await this.changeRequests.decide(request.id, {
        status: 'approved',
        reviewerId: input.reviewerId,
        rejectionReason: null,
      });
      if (!decided) {
        throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE);
      }
      const saved = await this.products.saveContent(live.id, request.content);
      await this.audit.write({
        actorId: input.reviewerId,
        ...CATALOG_AUDIT.changeRequestApproved,
        entityId: request.id,
        metadata: { productId: live.id },
      });
      return saved;
    });
    return toProductView(product, null, this.media);
  }
}
