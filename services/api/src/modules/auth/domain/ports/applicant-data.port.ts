/** Injection token of the ApplicantData port. */
export const APPLICANT_DATA = Symbol('APPLICANT_DATA');

/** What a customer gave when applying to become a vendor (the vendors module). */
export interface ApplicantData {
  /**
   * Erases it for an account deletion: pending and rejected applications and their
   * documents; an approved one is kept as its vendor's business record. Database only,
   * inside the deletion's transaction (files leave storage after the commit).
   */
  eraseOf(userId: string): Promise<void>;
}
