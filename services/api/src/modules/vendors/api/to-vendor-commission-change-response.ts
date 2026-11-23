import type { VendorCommissionChange } from '../domain/vendor-commission-change.type';
import type { VendorCommissionChangeResponseDto } from './dto/vendor-commission-change-response.dto';

/** A commission history entry as a response. */
export function toVendorCommissionChangeResponse(
  change: VendorCommissionChange,
): VendorCommissionChangeResponseDto {
  return {
    id: change.id,
    commissionBasisPoints: change.commissionBasisPoints,
    previousCommissionBasisPoints: change.previousCommissionBasisPoints,
    changedById: change.changedById,
    createdAt: change.createdAt,
  };
}
