/**
 * Whether a value is a PostgreSQL connection URL: `postgresql://` or `postgres://`, with a
 * host and a database name. It never echoes the value, which carries the password.
 */
export function isPostgresUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    // Not a URL at all: the schema reports it, without the value.
    return false;
  }
  return (
    (url.protocol === 'postgresql:' || url.protocol === 'postgres:') &&
    url.hostname.length > 0 &&
    url.pathname.length > 1
  );
}
