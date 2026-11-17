import { createHash } from 'node:crypto';

/**
 * The seed's own namespace for name-based UUIDs (RFC 9562, version 5): a fixed random
 * value, so no other generator derives the same ids from the same names.
 */
const SEED_NAMESPACE = Buffer.from('7c1b4bd2a0f54e0e9a3d55b0a8e3f4c1', 'hex');

/**
 * The id of a seeded row, derived from a stable name (`product:nokhba-naimi-whole`):
 * the same name gives the same UUID on every run and every machine, which is what
 * makes the seed idempotent (a row is created only when its id is free). A version 5
 * UUID: SHA-1 of the namespace and the name, with the version and variant bits set.
 */
export function seedId(name: string): string {
  const hash = createHash('sha1')
    .update(SEED_NAMESPACE)
    .update(name, 'utf8')
    .digest()
    .subarray(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
