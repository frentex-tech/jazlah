import type { ApplicantAccounts } from '../ports/applicant-accounts.port';

/** ApplicantAccounts in memory: every account is live until a test deletes it. */
export class InMemoryApplicantAccounts implements ApplicantAccounts {
  private readonly deleted = new Set<string>();
  /** Each account held, in order. */
  readonly held: string[] = [];

  delete(userId: string): void {
    this.deleted.add(userId);
  }

  holdLive(userId: string): Promise<boolean> {
    this.held.push(userId);
    return Promise.resolve(!this.deleted.has(userId));
  }
}
