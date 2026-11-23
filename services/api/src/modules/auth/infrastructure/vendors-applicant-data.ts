import { Injectable } from '@nestjs/common';
import { EraseApplicantDataUseCase } from '@modules/vendors';
import type { ApplicantData } from '../domain/ports/applicant-data.port';

/** Applicants' data erased through the vendors module's exported use case. */
@Injectable()
export class VendorsApplicantData implements ApplicantData {
  constructor(private readonly eraseApplicant: EraseApplicantDataUseCase) {}

  eraseOf(userId: string): Promise<void> {
    return this.eraseApplicant.execute(userId);
  }
}
