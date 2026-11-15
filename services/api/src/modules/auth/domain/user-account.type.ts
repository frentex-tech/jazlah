/** A user, as far as signing in is concerned. */
export type UserAccount = Readonly<{
  id: string;
  /** E.164. */
  phone: string;
  /** Null while the user is enabled. */
  disabledAt: Date | null;
}>;
