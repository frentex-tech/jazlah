import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import type { VendorApplication } from '../domain/vendor-application.entity';
import { VendorApplicationReviewMachine } from '../domain/vendor-application-review.state-machine';
import { VENDOR_AUDIT } from '../domain/vendor-audit-actions.constants';
import type { ReviewVendorApplicationInput } from './review-vendor-application-input.type';

/**
 * An admin rejects a pending application with a reason the applicant sees. One
 * transaction: the conditional update from pending (NOT_FOUND, or
 * VENDOR_APPLICATION_NOT_PENDING when it was already reviewed) and the audit entry. The
 * applicant may then apply again.
 */
@Injectable()
export class RejectVendorApplicationUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: ReviewVendorApplicationInput & { reason: string },
  ): Promise<VendorApplication> {
    return this.transactions.run(async () => {
      const found = await this.applications.findById(input.applicationId);
      if (found === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      VendorApplicationReviewMachine.assertCanMove(found.status, 'rejected');
      const application = await this.applications.markRejected(
        input.applicationId,
        input.reviewerId,
        input.reason,
      );
      if (application === null) {
        throw new AppError(ErrorCode.VENDOR_APPLICATION_NOT_PENDING);
      }
      await this.audit.write({
        actorId: input.reviewerId,
        ...VENDOR_AUDIT.applicationRejected,
        entityId: application.id,
      });
      return application;
    });
  }
}
