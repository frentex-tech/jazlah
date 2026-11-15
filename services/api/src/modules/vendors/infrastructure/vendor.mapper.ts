import type { Vendor as VendorRow } from '@infra/database/generated/prisma/client';
import { Vendor } from '../domain/vendor.entity';

/** A row of `vendors` as the domain's entity; the encrypted IBAN stays behind. */
export function toVendor(row: VendorRow): Vendor {
  return new Vendor(
    row.id,
    { ar: row.nameAr, en: row.nameEn },
    { ar: row.descriptionAr, en: row.descriptionEn },
    row.logoMediaId,
    row.isPlatform,
    row.status,
    row.suspendedAt,
    row.suspensionReason,
    row.commissionBasisPoints,
    row.commercialRegistrationNumber,
    row.ibanLast4,
    row.accountHolderName,
    row.latitude === null || row.longitude === null
      ? null
      : { latitude: row.latitude, longitude: row.longitude },
    row.applicationId,
    row.createdAt,
  );
}
