import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  VENDOR_MEDIA,
  type VendorMedia,
} from '../domain/ports/vendor-media.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import type { VendorStatus } from '../domain/vendor-status.type';
import type { VendorWithLogo } from './vendor-with-logo.type';
import { withLogoUrls } from './with-logo-urls';

/** Every vendor, newest first, optionally of one status, for admins. */
@Injectable()
export class ListVendorsUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(
    filter: Readonly<{ status?: VendorStatus }>,
    page: PageRequest,
  ): Promise<Page<VendorWithLogo>> {
    const found = await this.vendors.list(filter, page);
    return {
      items: await withLogoUrls(this.media, found.items),
      nextCursor: found.nextCursor,
    };
  }
}
