/** Injection token of the ApplicantAccounts port. */
export const APPLICANT_ACCOUNTS = Symbol('APPLICANT_ACCOUNTS');

/** The applicant's account, as applying needs it (the users module owns accounts). */
export interface ApplicantAccounts {
  /**
   * Holds the user's account until the caller's transaction ends (a shared lock), so it
   * cannot be deleted meanwhile. False when the account does not exist or was deleted:
   * an access token outlives a deletion by up to its lifetime, and an application must
   * never name a deleted account.
   */
  holdLive(userId: string): Promise<boolean>;
}
