/** The highest logical database a default Redis server has (`databases 16`). */
const MAX_REDIS_DATABASE = 15;

/**
 * Whether a value is a Redis connection URL: `redis://` or `rediss://` (TLS), written
 * in lowercase, with a host, and a logical database from 0 to 15 when a path is given
 * (`/0`, `/15`). It never echoes the value, which can carry the password.
 *
 * Why lowercase only: `URL` lowercases the scheme, but ioredis reads it as written, so
 * `REDISS://` would pass a case-insensitive check and connect without TLS. Why 0 to 15:
 * Redis refuses to select a database past its `databases` setting (16 by default), and
 * the client then stays on database 0, another environment's data.
 */
export function isRedisUrl(value: string): boolean {
  if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    // Not a URL at all: the schema reports it, without the value.
    return false;
  }
  const database = url.pathname.replace(/^\//, '');
  return (
    url.hostname.length > 0 &&
    (database === '' ||
      (/^\d{1,2}$/.test(database) && Number(database) <= MAX_REDIS_DATABASE))
  );
}
