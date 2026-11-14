import { createHash } from 'node:crypto';
import { RATE_LIMIT_KEY_PREFIX } from './rate-limit.constants';
import type { RateLimitKeys } from './rate-limit-keys.type';

/**
 * The two Redis keys of one counter: its hits and its block marker. The counter key
 * (which holds the client address) is SHA-256-hashed, so no address reaches Redis.
 *
 * The hash is in braces, a Redis Cluster hash tag: only the part inside `{}` decides the
 * slot, so both keys land on the same slot and the script that touches both runs on
 * cluster-mode Redis instead of failing with CROSSSLOT.
 */
export function rateLimitKeys(key: string): RateLimitKeys {
  const hash = createHash('sha256').update(key).digest('hex');
  const base = `${RATE_LIMIT_KEY_PREFIX}{${hash}}`;
  return { hits: `${base}:hits`, blocked: `${base}:blocked` };
}
