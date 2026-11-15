import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { TransactionRunner } from '@infra/database/transaction-runner';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import { VENDOR_AUDIT } from '../domain/vendor-audit-actions.constants';
import { VendorStatusMachine } from '../domain/vendor-status.state-machine';
import type { VendorActionInput } from './vendor-action-input.type';
import type { VendorWithLogo } from './vendor-with-logo.type';
import { withLogoUrls } from './with-logo-urls';

/**
 * An admin suspends an active vendor with a reason. One transaction: the conditional
 * update from active (NOT_FOUND; CONFLICT, `VENDOR_ALREADY_SUSPENDED`, when it was
 * suspended already or another suspension won) and the audit entry. From the commit on,
 * the vendor's routes, sign-ins and refreshes are refused with VENDOR_SUSPENDED.
 */
@Injectable()
export class SuspendVendorUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: VendorActionInput & { reason: string },
  ): Promise<VendorWithLogo> {
    const vendor = await this.transactions.run(async () => {
      const found = await this.vendors.findById(input.vendorId);
      if (found === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      VendorStatusMachine.assertCanMove(found.status, 'suspended');
      const updated = await this.vendors.suspend(input.vendorId, input.reason);
      if (updated === null) {
        // Another suspension won after the read: refused as for a suspended vendor.
        VendorStatusMachine.assertCanMove('suspended', 'suspended');
        throw new AppError(ErrorCode.CONFLICT);
      }
      await this.audit.write({
        actorId: input.actorId,
        ...VENDOR_AUDIT.vendorSuspended,
        entityId: updated.id,
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
