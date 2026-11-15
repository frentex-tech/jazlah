import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CatalogVendors } from '../domain/ports/catalog-vendors.port';
import type { ProductWriteScope } from './product-write-scope.type';

/**
 * The vendor a write acts for: the token's vendor, or the platform vendor. NOT_FOUND
 * (`PLATFORM_VENDOR_MISSING`) before `pnpm vendor:create-platform` has run.
 */
export async function resolveVendorId(
  scope: ProductWriteScope,
  vendors: CatalogVendors,
): Promise<string> {
  if (scope.kind === 'vendor') {
    return scope.vendorId;
  }
  const platformId = await vendors.platformVendorId();
  if (platformId === null) {
    throw new AppError(ErrorCode.NOT_FOUND, {
      details: { reason: 'PLATFORM_VENDOR_MISSING' },
    });
  }
  return platformId;
}
