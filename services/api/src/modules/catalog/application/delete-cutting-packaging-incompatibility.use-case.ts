import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY,
  type CuttingPackagingIncompatibilityRepository,
} from '../domain/ports/cutting-packaging-incompatibility.repository.port';

/** An admin removes a rule; NOT_FOUND for an unknown id. */
@Injectable()
export class DeleteCuttingPackagingIncompatibilityUseCase {
  constructor(
    @Inject(CUTTING_PACKAGING_INCOMPATIBILITY_REPOSITORY)
    private readonly rules: CuttingPackagingIncompatibilityRepository,
  ) {}

  async execute(id: string): Promise<void> {
    if (!(await this.rules.delete(id))) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
  }
}
