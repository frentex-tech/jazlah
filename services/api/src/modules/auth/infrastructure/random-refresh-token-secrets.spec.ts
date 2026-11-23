import { RandomRefreshTokenSecrets } from './random-refresh-token-secrets';

describe('RandomRefreshTokenSecrets', () => {
  const secrets = new RandomRefreshTokenSecrets();

  it('generates 256 bits in base64url, with the hash to store', () => {
    const { token, hash } = secrets.generate();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(secrets.hash(token));
    expect(hash).not.toContain(token);
  });

  it('never generates the same token twice', () => {
    const tokens = new Set(
      Array.from({ length: 100 }, () => secrets.generate().token),
    );

    expect(tokens.size).toBe(100);
  });

  it('hashes a token the same way every time, and another token differently', () => {
    expect(secrets.hash('a-token')).toBe(secrets.hash('a-token'));
    expect(secrets.hash('a-token')).not.toBe(secrets.hash('b-token'));
  });
});
