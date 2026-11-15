import type { Vendor } from '../domain/vendor.entity';
import type { VendorMedia } from '../domain/ports/vendor-media.port';
import type { VendorWithLogo } from './vendor-with-logo.type';

/** Each vendor with its logo's public URL, in one read for all of them. */
export async function withLogoUrls(
  media: Pick<VendorMedia, 'publicUrls'>,
  vendors: readonly Vendor[],
): Promise<VendorWithLogo[]> {
  const urls = await media.publicUrls(
    vendors.flatMap((vendor) =>
      vendor.logoMediaId === null ? [] : [vendor.logoMediaId],
    ),
  );
  return vendors.map((vendor) => ({
    vendor,
    logoUrl:
      vendor.logoMediaId === null
        ? null
        : (urls.get(vendor.logoMediaId) ?? null),
  }));
}
