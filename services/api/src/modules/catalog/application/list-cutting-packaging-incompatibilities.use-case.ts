import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { CuttingPackagingIncompatibility } from '../domain/cutting-packaging-incompatibility.type';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';

/** The global cutting and packaging rules, newest first. */
@Injectable()
export class ListCuttingPackagingIncompatibilitiesUseCase {
  constructor(
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
  ) {}

  execute(page: PageRequest): Promise<Page<CuttingPackagingIncompatibility>> {
    return this.rules.list(page);
  }
}
