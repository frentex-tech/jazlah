import { Inject, Injectable } from '@nestjs/common';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  VENDOR_COMMISSION_HISTORY,
  type VendorCommissionHistory,
} from '../domain/ports/vendor-commission-history.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import { PLATFORM_VENDOR } from '../domain/platform-vendor.constants';
import type { Vendor } from '../domain/vendor.entity';
import { VENDOR_AUDIT } from '../domain/vendor-audit-actions.constants';

/**
 * Creates the platform's own vendor, which sells JAZLA's products, unless it exists:
 * idempotent, and safe if run twice at once (at most one platform vendor can exist).
 * When this call creates it, the first commission history entry and the audit entry
 * are written in the same transaction, by the system (no actor).
 */
@Injectable()
export class CreatePlatformVendorUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_COMMISSION_HISTORY)
    private readonly history: VendorCommissionHistory,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(): Promise<Readonly<{ vendor: Vendor; created: boolean }>> {
    return this.transactions.run(async () => {
      const outcome = await this.vendors.ensurePlatform(
        PLATFORM_VENDOR.name,
        PLATFORM_VENDOR.commissionBasisPoints,
      );
      if (outcome.created) {
        await this.history.record({
          vendorId: outcome.vendor.id,
          commissionBasisPoints: PLATFORM_VENDOR.commissionBasisPoints,
          previousCommissionBasisPoints: null,
          changedById: null,
        });
        await this.audit.write({
          actorId: null,
          ...VENDOR_AUDIT.platformVendorCreated,
          entityId: outcome.vendor.id,
        });
      }
      return outcome;
    });
  }
}
