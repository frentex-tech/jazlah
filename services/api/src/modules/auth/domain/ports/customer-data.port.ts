/** Injection token of the CustomerData port. */
export const CUSTOMER_DATA = Symbol('CUSTOMER_DATA');

/** What a customer keeps with us beyond their identity (the customers module). */
export interface CustomerData {
  /**
   * Erases it for an account deletion: the profile and the addresses are deleted, and
   * the consent history, which is kept, ends withdrawn. Database only, inside the
   * deletion's transaction, after the user's row is locked.
   */
  eraseOf(userId: string): Promise<void>;
}
