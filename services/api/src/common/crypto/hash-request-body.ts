import { createHash } from 'node:crypto';

/**
 * A hash of a request body, to tell whether a retry carries the same request: SHA-256
 * (hex) of its canonical JSON. Canonical means the same hash for the same content
 * however it was written: keys in sorted order at every depth, keys whose value is
 * `undefined` left out (a field not sent is a field left out), arrays in order.
 * Use it to compare, never to protect a secret.
 */
export function hashRequestBody(body: unknown): string {
  return createHash('sha256').update(canonicalJson(body)).digest('hex');
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item === undefined ? null : item)).join(',')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}
