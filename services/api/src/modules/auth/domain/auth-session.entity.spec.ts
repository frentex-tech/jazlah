import { AuthSession } from './auth-session.entity';

const SIGNED_IN = new Date('2026-11-17T09:00:00.000Z');

function session(revokedAt: Date | null = null): AuthSession {
  return new AuthSession(
    'session-1',
    'user-1',
    'customer',
    null,
    null,
    'ios',
    // A refresh moves the last use, never the sign-in.
    new Date('2026-11-17T09:09:00.000Z'),
    revokedAt,
    revokedAt === null ? null : 'logout',
    SIGNED_IN,
  );
}

const after = (seconds: number) =>
  new Date(SIGNED_IN.getTime() + seconds * 1000);

describe('AuthSession.isRecentSignIn', () => {
  it.each([0, 599, 600])('is true %i seconds after the sign-in', (seconds) => {
    expect(session().isRecentSignIn(after(seconds))).toBe(true);
  });

  it('is false 601 seconds after the sign-in, however recent the last refresh', () => {
    expect(session().isRecentSignIn(after(601))).toBe(false);
  });

  it('is false for a revoked session', () => {
    expect(session(after(10)).isRecentSignIn(after(20))).toBe(false);
  });
});
