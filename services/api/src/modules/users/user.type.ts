/** A user, as other modules see one. */
export type User = Readonly<{
  id: string;
  /** E.164 (`+9665XXXXXXXX`). */
  phone: string;
  /** Null while the user is enabled. */
  disabledAt: Date | null;
}>;
