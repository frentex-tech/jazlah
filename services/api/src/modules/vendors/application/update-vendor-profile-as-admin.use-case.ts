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
import { assertUsableVendorImages } from './assert-usable-vendor-images';
import type { UpdateVendorProfileAsAdminInput } from './update-vendor-profile-as-admin-input.type';
import type { VendorWithImages } from './vendor-with-images.type';
import { withImageUrls } from './with-image-urls';

/**
 * An admin changes any vendor's profile: what the vendor may change (logo, cover photo,
 * descriptions, contact phone and email, VAT number), with the same rules, and the city,
 * which only an admin sets. A new logo or cover is a ready file of its purpose the admin
 * uploaded (assertUsableVendorImages). The platform vendor has no owner, so this is how its profile is
 * set. One transaction: the update (NOT_FOUND for an unknown vendor) and the audit
 * entry, which names the fields given; a body that gives none changes and records
 * nothing.
 */
@Injectable()
export class UpdateVendorProfileAsAdminUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
    @Inject(AuditLogWriter)
    private readonly audit: Pick<AuditLogWriter, 'write'>,
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
  ) {}

  async execute(
    input: UpdateVendorProfileAsAdminInput,
  ): Promise<VendorWithImages> {
    await assertUsableVendorImages(this.media, input.changes, input.actorId);
    const fields = Object.keys(input.changes).sort();
    const vendor = await this.transactions.run(async () => {
      const updated =
        fields.length === 0
          ? await this.vendors.findById(input.vendorId)
          : await this.vendors.updateProfile(input.vendorId, input.changes);
      if (updated === null) {
        throw new AppError(ErrorCode.NOT_FOUND);
      }
      if (fields.length > 0) {
        await this.audit.write({
          actorId: input.actorId,
          ...VENDOR_AUDIT.profileUpdated,
          entityId: updated.id,
          metadata: { fields: fields.join(',') },
        });
      }
      return updated;
    });
    const [withImages] = await withImageUrls(this.media, [vendor]);
    if (withImages === undefined) {
      throw new Error('withImageUrls returned no vendor');
    }
    return withImages;
  }
}
