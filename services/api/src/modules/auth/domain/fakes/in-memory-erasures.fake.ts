import type { ApplicantData } from '../ports/applicant-data.port';
import type { CustomerData } from '../ports/customer-data.port';

/**
 * CustomerData and ApplicantData in memory: records each erasure, in order, as
 * `<customer|applicant> <userId>`; `rows` is replaced on every write so a fake
 * transaction can put it back.
 */
export class InMemoryErasures {
  rows: readonly string[] = [];

  readonly customers: CustomerData = {
    eraseOf: (userId) => this.record(`customer ${userId}`),
  };

  readonly applicants: ApplicantData = {
    eraseOf: (userId) => this.record(`applicant ${userId}`),
  };

  private record(entry: string): Promise<void> {
    this.rows = [...this.rows, entry];
    return Promise.resolve();
  }
}
