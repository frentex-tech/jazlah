/**
 * The id `key` resolved to in an earlier step of the seed (a user, a vendor). A missing
 * key is a mistake in the seed's data sets, which `seed-data.spec.ts` should catch
 * first: it stops the run.
 */
export function pickId(
  ids: ReadonlyMap<string, string>,
  key: string,
  what: string,
): string {
  const id = ids.get(key);
  if (id === undefined) {
    throw new Error(`The seed data names an unknown ${what}: ${key}`);
  }
  return id;
}
