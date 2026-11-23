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
 * One active vendor's page, for anyone (FR-CAT-02). A suspended vendor is answered
 * exactly like an unknown id: NOT_FOUND.
 */
@Injectable()
export class GetPublicVendorUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(vendorId: string): Promise<VendorWithImages> {
    const vendor = await this.vendors.findActiveById(vendorId);
    const [found] =
      vendor === null ? [] : await withImageUrls(this.media, [vendor]);
    if (found === undefined) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return found;
  }
}
