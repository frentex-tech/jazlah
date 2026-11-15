import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import { CATALOG_AUDIT } from '../domain/catalog-audit-actions.constants';
import {
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';

/**
 * An admin rejects a pending change request with a reason the vendor sees; the live
 * product is unchanged and the proposed content is discarded. NOT_FOUND unless the
 * request is pending. One transaction: the decision and its audit entry.
 */
@Injectable()
export class RejectProductChangeRequestUseCase {
  constructor(
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: Readonly<{ reviewerId: string; requestId: string; reason: string }>,
  ): Promise<void> {
    await this.transactions.run(async () => {
      const request = await this.changeRequests.findPending(input.requestId);
      if (request === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      const decided = await this.changeRequests.decide(request.id, {
        status: 'rejected',
        reviewerId: input.reviewerId,
        rejectionReason: input.reason,
      });
      if (!decided) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      await this.audit.write({
        actorId: input.reviewerId,
        ...CATALOG_AUDIT.changeRequestRejected,
        entityId: request.id,
        metadata: { productId: request.productId },
      });
    });
  }
}
