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
import { assertUsableLogo } from './assert-usable-logo';
import type { UpdateOwnVendorProfileInput } from './update-own-vendor-profile-input.type';
import type { VendorWithLogo } from './vendor-with-logo.type';
import { withLogoUrls } from './with-logo-urls';

/**
 * A vendor changes its own profile: the logo and the descriptions (FR-VND-02). The
 * vendor is the token's organisation, never one named in the request. A new logo must be
 * a ready `vendor.logo` file the signed-in user uploaded (assertUsableLogo).
 */
@Injectable()
export class UpdateOwnVendorProfileUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(input: UpdateOwnVendorProfileInput): Promise<VendorWithLogo> {
    const logoId = input.changes.logoMediaId;
    if (logoId !== undefined && logoId !== null) {
      await assertUsableLogo(this.media, logoId, input.userId);
    }
    const vendor = await this.vendors.updateProfile(
      input.vendorId,
      input.changes,
    );
    if (vendor === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    const [withLogo] = await withLogoUrls(this.media, [vendor]);
    if (withLogo === undefined) {
      throw new Error('withLogoUrls returned no vendor');
    }
    return withLogo;
  }
}
