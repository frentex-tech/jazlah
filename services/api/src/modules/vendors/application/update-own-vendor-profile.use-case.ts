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
import { assertUsableVendorImages } from './assert-usable-vendor-images';
import type { UpdateOwnVendorProfileInput } from './update-own-vendor-profile-input.type';
import type { VendorWithImages } from './vendor-with-images.type';
import { withImageUrls } from './with-image-urls';

/**
 * A vendor changes its own profile: the logo, the cover photo, the descriptions, the
 * contact phone and email and the VAT number (FR-VND-02); never the city, which only an
 * admin sets. The vendor is the token's organisation, never one named in the request. A
 * new logo or cover must be a ready file of its purpose the signed-in user uploaded
 * (assertUsableVendorImages).
 */
@Injectable()
export class UpdateOwnVendorProfileUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(input: UpdateOwnVendorProfileInput): Promise<VendorWithImages> {
    await assertUsableVendorImages(this.media, input.changes, input.userId);
    const vendor = await this.vendors.updateProfile(
      input.vendorId,
      input.changes,
    );
    if (vendor === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const [withImages] = await withImageUrls(this.media, [vendor]);
    if (withImages === undefined) {
      throw new Error('withImageUrls returned no vendor');
    }
    return withImages;
  }
}
