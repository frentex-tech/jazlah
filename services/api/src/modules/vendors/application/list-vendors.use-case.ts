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
import type { VendorListFilter } from '../domain/vendor-list-filter.type';
import type { VendorWithImages } from './vendor-with-images.type';
import { withImageUrls } from './with-image-urls';

/** Every vendor, newest first, optionally narrowed by status, search and city, for admins. */
@Injectable()
export class ListVendorsUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_MEDIA) private readonly media: VendorMedia,
  ) {}

  async execute(
    filter: VendorListFilter,
    page: PageRequest,
  ): Promise<Page<VendorWithImages>> {
    const found = await this.vendors.list(filter, page);
    return {
      items: await withImageUrls(this.media, found.items),
      nextCursor: found.nextCursor,
    };
  }
}
