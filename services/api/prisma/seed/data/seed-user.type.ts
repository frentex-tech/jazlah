/**
 * A person the seed creates, by a phone in the fake block +9665000000NN. `key` names
 * them in the other data sets; the row is found by phone first, so a phone that
 * already signed in keeps its user.
 */
export type SeedUser = Readonly<{
  key: string;
  /** A Saudi mobile number as typed (`05…`); stored normalised (E.164). */
  phone: string;
  /** Who this person is in the data, for the printed summary. */
  role: string;
}>;
