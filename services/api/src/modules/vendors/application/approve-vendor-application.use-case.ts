import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  VENDOR_ACCESS,
  type VendorAccess,
} from '../domain/ports/vendor-access.port';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import {
  VENDOR_COMMISSION_HISTORY,
  type VendorCommissionHistory,
} from '../domain/ports/vendor-commission-history.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import { Vendor } from '../domain/vendor.entity';
import { VendorApplicationReviewMachine } from '../domain/vendor-application-review.state-machine';
import { VENDOR_AUDIT } from '../domain/vendor-audit-actions.constants';
import type { ReviewVendorApplicationInput } from './review-vendor-application-input.type';

/**
 * An admin approves a pending application with a commission (FR-ADM-04). One
 * transaction, nothing outside the database inside it:
 *
 * 1. The application must exist (NOT_FOUND) and be pending; the change is a conditional
 *    update from pending, so of two approvals at once only one updates the row and the
 *    other gets VENDOR_APPLICATION_NOT_PENDING: one vendor is ever created.
 * 2. The vendor is created from the application, with the commission and its first
 *    history entry.
 * 3. The applicant is granted vendor access for it (CONFLICT if they already work for
 *    another vendor).
 * 4. The audit entry is written.
 *
 * Any failure rolls all of it back: the application stays pending.
 */
@Injectable()
export class ApproveVendorApplicationUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_COMMISSION_HISTORY)
    private readonly history: VendorCommissionHistory,
    @Inject(VENDOR_ACCESS) private readonly access: VendorAccess,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: ReviewVendorApplicationInput & { commissionBasisPoints: number },
  ): Promise<Vendor> {
    Vendor.assertCommission(input.commissionBasisPoints);
    return this.transactions.run(async () => {
      const found = await this.applications.findById(input.applicationId);
      if (found === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      VendorApplicationReviewMachine.assertCanMove(found.status, 'approved');
      const application = await this.applications.markApproved(
        input.applicationId,
        input.reviewerId,
      );
      if (application === null) {
        throw new AppError(ErrorCode.VENDOR_APPLICATION_NOT_PENDING);
      }
      const vendor = await this.vendors.createFromApplication(
        application,
        input.commissionBasisPoints,
      );
      await this.history.record({
        vendorId: vendor.id,
        commissionBasisPoints: input.commissionBasisPoints,
        previousCommissionBasisPoints: null,
        changedById: input.reviewerId,
      });
      await this.access.grant(application.applicantId, vendor.id);
      await this.audit.write({
        actorId: input.reviewerId,
        ...VENDOR_AUDIT.applicationApproved,
        entityId: application.id,
        metadata: {
          vendorId: vendor.id,
          commissionBasisPoints: input.commissionBasisPoints,
        },
      });
      return vendor;
    });
  }
}
