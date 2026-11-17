/**
 * Text made literal inside a SQL LIKE or ILIKE pattern with the default escape character
 * (backslash, PostgreSQL's default and what Prisma's `contains`, `startsWith` and
 * `endsWith` produce): each `\`, `%` and `_` is prefixed with a backslash, so a search for
 * `50%` matches the text "50%" and not everything starting with "50". Prisma does not
 * escape them itself; pass every user-typed search term through this first.
 */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}
