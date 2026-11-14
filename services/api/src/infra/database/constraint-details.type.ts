/**
 * `details` of a CONFLICT raised for a database constraint: the constraint's name and,
 * when known, the fields it covers. Names only, never the values involved.
 */
export type ConstraintDetails = Readonly<{
  constraint?: string;
  fields?: readonly string[];
}>;
