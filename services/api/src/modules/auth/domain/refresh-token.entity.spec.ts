import { RefreshToken } from './refresh-token.entity';

const EXPIRES = new Date('2026-12-14T09:00:00.000Z');

function token(usedAt: Date | null = null): RefreshToken {
  return new RefreshToken('refresh-1', 'session-1', 'hash', EXPIRES, usedAt);
}

describe('RefreshToken', () => {
  it('is usable until it expires', () => {
    expect(token().state(new Date('2026-12-14T08:59:59.999Z'))).toBe('usable');
  });

  it('is expired from the exact instant of its expiry', () => {
    expect(token().state(EXPIRES)).toBe('expired');
  });

  it('is used once exchanged, also after its expiry: reuse outranks expiry', () => {
    const used = token(new Date('2026-11-20T09:00:00.000Z'));

    expect(used.state(new Date('2026-11-21T09:00:00.000Z'))).toBe('used');
    expect(used.state(new Date('2027-01-01T00:00:00.000Z'))).toBe('used');
  });
});
