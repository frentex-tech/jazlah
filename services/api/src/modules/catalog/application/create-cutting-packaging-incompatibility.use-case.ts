import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CuttingPackagingIncompatibility } from '../domain/cutting-packaging-incompatibility.type';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';
import {
  REFERENCE_LIST_REPOSITORY,
  type ReferenceListRepository,
} from '../domain/ports/reference-list.repository.port';
import type { ProductPackaging } from '../domain/product-packaging.type';

/**
 * An admin adds a global rule (FR-PRD-04): this cutting style cannot be packed this way.
 * The cutting style must be active (VALIDATION_FAILED on `cuttingStyleId`); the same
 * pair twice is CONFLICT. Products already published keep their options; the rule
 * applies to each later submission or change request.
 */
@Injectable()
export class CreateCuttingPackagingIncompatibilityUseCase {
  constructor(
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
    @Inject(REFERENCE_LIST_REPOSITORY)
    private readonly lists: ReferenceListRepository,
  ) {}

  async execute(
    cuttingStyleId: string,
    packaging: ProductPackaging,
  ): Promise<CuttingPackagingIncompatibility> {
    const active = await this.lists.findActiveIds('cutting_styles', [
      cuttingStyleId,
    ]);
    if (!active.has(cuttingStyleId)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [
          { field: 'cuttingStyleId', constraints: ['isActiveCuttingStyle'] },
        ],
      });
    }
    return this.rules.create(cuttingStyleId, packaging);
  }
}
