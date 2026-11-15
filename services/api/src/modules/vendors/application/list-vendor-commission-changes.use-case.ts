import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  VENDOR_COMMISSION_HISTORY,
  type VendorCommissionHistory,
} from '../domain/ports/vendor-commission-history.port';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';
import type { VendorCommissionChange } from '../domain/vendor-commission-change.type';

/** A vendor's commission history, newest first, for admins; NOT_FOUND for an unknown vendor. */
@Injectable()
export class ListVendorCommissionChangesUseCase {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
    @Inject(VENDOR_COMMISSION_HISTORY)
    private readonly history: VendorCommissionHistory,
  ) {}

  async execute(
    vendorId: string,
    page: PageRequest,
  ): Promise<Page<VendorCommissionChange>> {
    if ((await this.vendors.findById(vendorId)) === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return this.history.listOf(vendorId, page);
  }
}
