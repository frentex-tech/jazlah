/**
 * Text made safe to put inside a SQL `LIKE` pattern: each backslash, `%` and `_` is
 * prefixed with a backslash (PostgreSQL's default escape character), so it matches
 * itself instead of acting as a wildcard. Prisma's `contains`, `startsWith` and
 * `endsWith` do not escape them.
 */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
