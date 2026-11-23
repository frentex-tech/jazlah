import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import type { VendorWithImages } from './vendor-with-images.type';
import { withImageUrls } from './with-image-urls';

/**
 * One vendor by id, in any status: for an admin, by any id; for a vendor, only the
 * token's organisation is ever passed (its own profile). NOT_FOUND otherwise.
 */
@Injectable()
export class GetVendorUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(vendorId: string): Promise<VendorWithImages> {
    const vendor = await this.vendors.findById(vendorId);
    const [found] =
      vendor === null ? [] : await withImageUrls(this.media, [vendor]);
    if (found === undefined) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return found;
  }
}
