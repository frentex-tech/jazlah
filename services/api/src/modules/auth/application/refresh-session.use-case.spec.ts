import { Logger } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildAuthUseCases } from './auth-use-cases.fake';

/** Obviously fictitious numbers. */
const PHONE = '+966512345678';
const ORGANISATION = '11111111-1111-4111-8111-111111111111';
const OTHER_ORGANISATION = '22222222-2222-4222-8222-222222222222';
const CODE = '482913';

type Kit = ReturnType<typeof buildAuthUseCases>;

/** Signs in and returns the first refresh token (`refresh-token-1`). */
async function signIn(
  kit: Kit,
  audience: Audience = 'customer',
): Promise<string> {
  kit.codes.nextCodes = [CODE];
  await kit.requestOtp.execute({ phone: PHONE, audience, language: 'ar' });
  await kit.detached.settle();
  const { tokens } = await kit.verifyOtp.execute({
    phone: PHONE,
    audience,
    code: CODE,
    devicePlatform: 'web',
    deviceName: null,
  });
  return tokens.refreshToken;
}

async function codeOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => 'no error',
    (error: unknown) =>
      typeof error === 'object' && error !== null && 'code' in error
        ? error.code
        : error,
  );
}

describe('RefreshSessionUseCase', () => {
  let logWarn: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    logWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rotation', () => {
    it('returns a new pair, marks the old token used and stores the hash of the new one', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.clock.advanceSeconds(900);

      const tokens = await kit.refreshSession.execute(first);

      expect(tokens).toEqual({
        accessToken: 'access-token-2',
        accessTokenExpiresInSeconds: 900,
        refreshToken: 'refresh-token-2',
        refreshTokenExpiresInSeconds: 2_592_000,
      });
      expect(kit.refreshTokens.rows).toEqual([
        expect.objectContaining({
          tokenHash: 'hash(refresh-token-1)',
          usedAt: kit.clock.now(),
        }),
        expect.objectContaining({
          sessionId: 'session-1',
          tokenHash: 'hash(refresh-token-2)',
          usedAt: null,
          expiresAt: new Date(kit.clock.now().getTime() + 2_592_000_000),
        }),
      ]);
    });

    it('keeps the session, its audience and its organisation, and records the use', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'vendor', ORGANISATION);
      const first = await signIn(kit, 'vendor');
      kit.clock.advanceSeconds(900);

      await kit.refreshSession.execute(first);

      expect(kit.accessTokens.signed[1]?.user).toEqual({
        userId: 'user-1',
        sessionId: 'session-1',
        audience: 'vendor',
        organisationId: ORGANISATION,
      });
      expect(kit.sessions.rows[0]).toMatchObject({
        lastUsedAt: kit.clock.now(),
        revokedAt: null,
      });
    });

    it('lets the new token be exchanged in turn', async () => {
      const kit = buildAuthUseCases();
      const second = await kit.refreshSession.execute(await signIn(kit));

      const third = await kit.refreshSession.execute(second.refreshToken);

      expect(third.refreshToken).toBe('refresh-token-3');
    });
  });

  describe('reuse detection', () => {
    it('revokes the session when a token that was already exchanged comes back', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      await kit.refreshSession.execute(first);

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );

      expect(kit.sessions.rows[0]).toMatchObject({
        revokedAt: kit.clock.now(),
        revocationReason: 'reuse_detected',
      });
      expect(logWarn).toHaveBeenCalledWith(
        { sessionId: 'session-1', userId: 'user-1' },
        'Refresh token reuse detected: session revoked',
      );
    });

    it('takes the newest token down with it: whoever holds it is signed out too', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      const second = await kit.refreshSession.execute(first);
      await codeOf(kit.refreshSession.execute(first));

      expect(
        await codeOf(kit.refreshSession.execute(second.refreshToken)),
      ).toBe(ErrorCode.REFRESH_TOKEN_INVALID);
      expect(kit.refreshTokens.rows).toHaveLength(2);
    });

    it('treats losing a race for the same token as reuse', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.refreshTokens.loseNextRace = true;

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );

      expect(kit.sessions.rows[0]?.revocationReason).toBe('reuse_detected');
      expect(kit.refreshTokens.rows).toHaveLength(1);
    });

    it('issues no access token when it detects reuse', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      await kit.refreshSession.execute(first);
      const signedBefore = kit.accessTokens.signed.length;

      await codeOf(kit.refreshSession.execute(first));

      expect(kit.accessTokens.signed).toHaveLength(signedBefore);
    });
  });

  describe('a token that cannot be exchanged', () => {
    it('is REFRESH_TOKEN_INVALID when unknown, and nothing is written', async () => {
      const kit = buildAuthUseCases();
      await signIn(kit);

      expect(await codeOf(kit.refreshSession.execute('not-a-token'))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.sessions.rows[0]?.revokedAt).toBeNull();
    });

    it('is REFRESH_TOKEN_INVALID at the moment it expires, without revoking the session', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.clock.advanceSeconds(2_592_000);

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.sessions.rows[0]?.revokedAt).toBeNull();
      expect(kit.refreshTokens.rows[0]?.usedAt).toBeNull();
    });

    it('still works one second before it expires', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.clock.advanceSeconds(2_591_999);

      await expect(kit.refreshSession.execute(first)).resolves.toBeDefined();
    });

    it('is REFRESH_TOKEN_INVALID after logout, and stays unused', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      await kit.logout.execute(first);

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.refreshTokens.rows[0]?.usedAt).toBeNull();
      expect(kit.sessions.rows[0]?.revocationReason).toBe('logout');
    });
  });

  describe('access lost after sign-in', () => {
    it('refuses a disabled user with ACCOUNT_DISABLED and revokes the session', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.users.disable('user-1', kit.clock.now());

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.ACCOUNT_DISABLED,
      );

      expect(kit.sessions.rows[0]?.revocationReason).toBe('access_lost');
      expect(kit.refreshTokens.rows).toHaveLength(1);
      expect(kit.accessTokens.signed).toHaveLength(1);
    });

    it('refuses staff whose access was deactivated, and revokes the session', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'vendor', ORGANISATION);
      const first = await signIn(kit, 'vendor');
      kit.users.deactivate('user-1', 'vendor');

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.sessions.rows[0]?.revocationReason).toBe('access_lost');
    });

    it('refuses staff whose access now belongs to another organisation', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'vendor', ORGANISATION);
      const first = await signIn(kit, 'vendor');
      kit.users.grant(PHONE, 'vendor', OTHER_ORGANISATION);

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.sessions.rows[0]?.revocationReason).toBe('access_lost');
    });

    it('keeps an admin session alive while admin access is active', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'admin', null);
      const first = await signIn(kit, 'admin');

      const tokens = await kit.refreshSession.execute(first);

      expect(tokens.refreshToken).toBe('refresh-token-2');
      expect(kit.accessTokens.signed[1]?.user.audience).toBe('admin');
    });

    it('does not let losing staff access end the same person as a customer', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'vendor', ORGANISATION);
      const first = await signIn(kit, 'customer');
      kit.users.deactivate('user-1', 'vendor');

      await expect(kit.refreshSession.execute(first)).resolves.toBeDefined();
    });

    it('refuses when the user no longer exists', async () => {
      const kit = buildAuthUseCases();
      const first = await signIn(kit);
      kit.users.remove('user-1');

      expect(await codeOf(kit.refreshSession.execute(first))).toBe(
        ErrorCode.REFRESH_TOKEN_INVALID,
      );
      expect(kit.sessions.rows[0]?.revocationReason).toBe('access_lost');
    });
  });
});
