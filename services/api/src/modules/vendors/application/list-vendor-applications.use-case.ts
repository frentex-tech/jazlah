import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import type { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorApplicationListFilter } from '../domain/vendor-application-list-filter.type';

/** The applications, newest first, optionally narrowed by status and search, for admins. */
@Injectable()
export class ListVendorApplicationsUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
  ) {}

  async execute(
    filter: VendorApplicationListFilter,
    page: PageRequest,
  ): Promise<Page<VendorApplication>> {
    return this.applications.list(filter, page);
  }
}
