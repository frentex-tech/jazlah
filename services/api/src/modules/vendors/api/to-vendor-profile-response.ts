import type { VendorWithLogo } from '../application/vendor-with-logo.type';
import { maskIban } from '../domain/mask-iban';
import type { VendorProfileResponseDto } from './dto/vendor-profile-response.dto';
import { toPublicVendorResponse } from './to-public-vendor-response';

/** A vendor's own profile; the IBAN only masked. */
export function toVendorProfileResponse(
  found: VendorWithLogo,
): VendorProfileResponseDto {
  const { vendor } = found;
  return {
    ...toPublicVendorResponse(found),
    commissionBasisPoints: vendor.commissionBasisPoints,
    commercialRegistrationNumber: vendor.commercialRegistrationNumber,
    ibanMasked: vendor.ibanLast4 === null ? null : maskIban(vendor.ibanLast4),
    accountHolderName: vendor.accountHolderName,
    location: vendor.location === null ? null : { ...vendor.location },
    createdAt: vendor.createdAt,
  };
}
