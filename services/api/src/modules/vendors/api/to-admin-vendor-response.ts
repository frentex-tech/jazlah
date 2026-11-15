import type { VendorWithLogo } from '../application/vendor-with-logo.type';
import type { AdminVendorResponseDto } from './dto/admin-vendor-response.dto';
import { toVendorProfileResponse } from './to-vendor-profile-response';

/** A vendor as an admin sees it; the IBAN only masked. */
export function toAdminVendorResponse(
  found: VendorWithLogo,
): AdminVendorResponseDto {
  const { vendor } = found;
  return {
    ...toVendorProfileResponse(found),
    isPlatform: vendor.isPlatform,
    status: vendor.status,
    suspendedAt: vendor.suspendedAt,
    suspensionReason: vendor.suspensionReason,
    applicationId: vendor.applicationId,
  };
}
