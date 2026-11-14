import { rateLimitKeys } from './rate-limit-keys';

/** The part of a key Redis Cluster hashes: the first `{...}` with something inside. */
function hashTag(key: string): string {
  const open = key.indexOf('{');
  const close = key.indexOf('}', open + 1);
  return open >= 0 && close > open + 1 ? key.slice(open + 1, close) : key;
}

describe('rateLimitKeys', () => {
  it('gives both keys of a counter the same hash tag, so they share a cluster slot', () => {
    const { hits, blocked } = rateLimitKeys('default:client:203.0.113.7');
    expect(hits).toMatch(/^jazla:rate-limit:\{[0-9a-f]{64}\}:hits$/);
    expect(blocked).toMatch(/^jazla:rate-limit:\{[0-9a-f]{64}\}:blocked$/);
    expect(hashTag(hits)).toBe(hashTag(blocked));
    expect(hashTag(hits)).toHaveLength(64);
  });

  it('keeps the client address out of Redis', () => {
    const keys = rateLimitKeys('default:client:203.0.113.7');
    expect(`${keys.hits}${keys.blocked}`).not.toContain('203.0.113.7');
  });

  it('gives different counters different tags', () => {
    expect(hashTag(rateLimitKeys('a').hits)).not.toBe(
      hashTag(rateLimitKeys('b').hits),
    );
  });
});
