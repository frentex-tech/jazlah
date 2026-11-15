import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  VENDOR_COMMISSION_HISTORY,
  type VendorCommissionHistory,
} from '../domain/ports/vendor-commission-history.port';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import { Vendor } from '../domain/vendor.entity';
import { VENDOR_AUDIT } from '../domain/vendor-audit-actions.constants';
import type { VendorActionInput } from './vendor-action-input.type';
import type { VendorWithLogo } from './vendor-with-logo.type';
import { withLogoUrls } from './with-logo-urls';

/**
 * An admin sets a vendor's commission for future orders (FR-ADM-04); orders already
 * placed keep the commission they were placed with. One transaction: the update, made
 * only if the commission is still the one read (CONFLICT when another change won
 * meanwhile), the history entry with the previous value, and the audit entry. Setting
 * the commission it already has changes and records nothing.
 */
@Injectable()
export class ChangeVendorCommissionUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
    @Inject(VENDOR_COMMISSION_HISTORY)
    private readonly history: VendorCommissionHistory,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: VendorActionInput & { commissionBasisPoints: number },
  ): Promise<VendorWithLogo> {
    Vendor.assertCommission(input.commissionBasisPoints);
    const vendor = await this.transactions.run(async () => {
      const found = await this.vendors.findById(input.vendorId);
      if (found === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      const previous = found.commissionBasisPoints;
      if (previous === input.commissionBasisPoints) {
        return found;
      }
      const updated = await this.vendors.changeCommission(
        input.vendorId,
        previous,
        input.commissionBasisPoints,
      );
      if (updated === null) {
        throw new AppError(ErrorCode.CONFLICT);
      }
      await this.history.record({
        vendorId: updated.id,
        commissionBasisPoints: input.commissionBasisPoints,
        previousCommissionBasisPoints: previous,
        changedById: input.actorId,
      });
      await this.audit.write({
        actorId: input.actorId,
        ...VENDOR_AUDIT.commissionChanged,
        entityId: updated.id,
        metadata: {
          commissionBasisPoints: input.commissionBasisPoints,
          previousCommissionBasisPoints: previous,
        },
      });
      return updated;
    });
    const [withLogo] = await withLogoUrls(this.media, [vendor]);
    if (withLogo === undefined) {
      throw new Error('withLogoUrls returned no vendor');
    }
    return withLogo;
  }
}
