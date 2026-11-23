import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import {
  VENDOR_APPLICATION_REPOSITORY,
  type VendorApplicationRepository,
} from '../domain/ports/vendor-application.repository.port';
import type { VendorApplication } from '../domain/vendor-application.entity';

/**
 * A customer's own newest application, so the app can show its review; NOT_FOUND when
 * they never applied. Only the token's user's applications are read.
 */
@Injectable()
export class GetLatestVendorApplicationUseCase {
  constructor(
    @Inject(VENDOR_APPLICATION_REPOSITORY)
    private readonly applications: VendorApplicationRepository,
  ) {}

  async execute(applicantId: string): Promise<VendorApplication> {
    const application =
      await this.applications.findLatestOfApplicant(applicantId);
    if (application === null) {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
    return application;
  }
}
