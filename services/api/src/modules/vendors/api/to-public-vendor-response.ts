import type { VendorWithLogo } from '../application/vendor-with-logo.type';
import type { PublicVendorResponseDto } from './dto/public-vendor-response.dto';

/** A vendor as anyone sees it. */
export function toPublicVendorResponse({
  vendor,
  logoUrl,
}: VendorWithLogo): PublicVendorResponseDto {
  return {
    id: vendor.id,
    name: { ...vendor.name },
    description: { ...vendor.description },
    logoUrl,
  };
}
