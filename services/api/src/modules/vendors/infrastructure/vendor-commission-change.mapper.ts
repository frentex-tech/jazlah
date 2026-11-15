import type { VendorCommissionChange as VendorCommissionChangeRow } from '@infra/database/generated/prisma/client';
import type { VendorCommissionChange } from '../domain/vendor-commission-change.type';

/** A row of `vendor_commission_changes` as the domain's history entry. */
export function toVendorCommissionChange(
  row: VendorCommissionChangeRow,
): VendorCommissionChange {
  return {
    id: row.id,
    vendorId: row.vendorId,
    commissionBasisPoints: row.commissionBasisPoints,
    previousCommissionBasisPoints: row.previousCommissionBasisPoints,
    changedById: row.changedById,
    createdAt: row.createdAt,
  };
}
