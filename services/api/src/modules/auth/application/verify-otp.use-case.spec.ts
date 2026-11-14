import { Logger } from '@nestjs/common';
import type { Audience } from '@common/auth/audience.type';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildAuthUseCases } from './auth-use-cases.fake';
import type { VerifyOtpInput } from './verify-otp-input.type';

/** Obviously fictitious numbers. */
const PHONE = '+966512345678';
const STAFF_PHONE = '+966511112222';
const ORGANISATION = '11111111-1111-4111-8111-111111111111';
const CODE = '482913';

type Kit = ReturnType<typeof buildAuthUseCases>;

/** Requests a code (the next one generated is CODE) and lets a detached SMS finish. */
async function request(
  kit: Kit,
  phone = PHONE,
  audience: Audience = 'customer',
): Promise<void> {
  kit.codes.nextCodes = [CODE];
  await kit.requestOtp.execute({ phone, audience, language: 'ar' });
  await kit.detached.settle();
}

function input(change: Partial<VerifyOtpInput> = {}): VerifyOtpInput {
  return {
    phone: PHONE,
    audience: 'customer',
    code: CODE,
    devicePlatform: 'ios',
    deviceName: 'Test phone',
    ...change,
  };
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

describe('VerifyOtpUseCase', () => {
  let logWarn: jest.SpyInstance;
  let logInfo: jest.SpyInstance;

  beforeEach(() => {
    logInfo = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    logWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('a correct code', () => {
    it('creates the customer, a session for that one audience and its tokens', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      const result = await kit.verifyOtp.execute(input());

      const [user] = kit.users.users;
      expect(user).toMatchObject({ phone: PHONE, disabledAt: null });
      expect(kit.sessions.rows).toEqual([
        expect.objectContaining({
          id: 'session-1',
          userId: user?.id,
          audience: 'customer',
          organisationId: null,
          deviceName: 'Test phone',
          devicePlatform: 'ios',
          lastUsedAt: kit.clock.now(),
          revokedAt: null,
        }),
      ]);
      expect(result).toEqual({
        tokens: {
          accessToken: 'access-token-1',
          accessTokenExpiresInSeconds: 900,
          refreshToken: 'refresh-token-1',
          refreshTokenExpiresInSeconds: 2_592_000,
        },
        principal: {
          userId: user?.id,
          sessionId: 'session-1',
          audience: 'customer',
          organisationId: null,
          phone: PHONE,
        },
      });
    });

    it('signs the access token for the session, with exactly one audience', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      await kit.verifyOtp.execute(input());

      expect(kit.accessTokens.signed).toEqual([
        {
          token: 'access-token-1',
          user: {
            userId: 'user-1',
            sessionId: 'session-1',
            audience: 'customer',
            organisationId: null,
          },
          at: kit.clock.now(),
        },
      ]);
    });

    it('stores the hash of the refresh token, never the token', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      await kit.verifyOtp.execute(input());

      expect(kit.refreshTokens.rows).toEqual([
        expect.objectContaining({
          sessionId: 'session-1',
          tokenHash: 'hash(refresh-token-1)',
          expiresAt: new Date(kit.clock.now().getTime() + 2_592_000_000),
          usedAt: null,
        }),
      ]);
    });

    it('signs an existing customer in without creating a second user', async () => {
      const kit = buildAuthUseCases();
      const existing = kit.users.add(PHONE);
      await request(kit);

      const result = await kit.verifyOtp.execute(input());

      expect(kit.users.users).toHaveLength(1);
      expect(result.principal.userId).toBe(existing.id);
    });

    it('works once: the same code again is OTP_EXPIRED', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      await kit.verifyOtp.execute(input());

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
      expect(kit.sessions.rows).toHaveLength(1);
    });

    it('keeps the code, the tokens and the phone out of the log', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      await kit.verifyOtp.execute(input());

      const logged = JSON.stringify(logInfo.mock.calls);
      expect(logged).toContain('session-1');
      for (const secret of [CODE, PHONE, 'refresh-token-1', 'access-token-1']) {
        expect(logged).not.toContain(secret);
      }
    });
  });

  describe('a wrong code', () => {
    it('is OTP_INVALID, signs nobody in, and counts the attempt', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      expect(
        await codeOf(kit.verifyOtp.execute(input({ code: '000001' }))),
      ).toBe(ErrorCode.OTP_INVALID);

      expect(kit.challenges.rows[0]?.attempts).toBe(1);
      expect(kit.sessions.rows).toEqual([]);
      expect(kit.users.users).toEqual([]);
    });

    it('leaves the right code usable while attempts remain', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      await codeOf(kit.verifyOtp.execute(input({ code: '000001' })));

      await expect(kit.verifyOtp.execute(input())).resolves.toBeDefined();
    });
  });

  describe('the attempt limit', () => {
    it('refuses the right code once the attempts are used up', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        expect(
          await codeOf(kit.verifyOtp.execute(input({ code: '000001' }))),
        ).toBe(ErrorCode.OTP_INVALID);
      }

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
      expect(kit.challenges.rows[0]?.attempts).toBe(5);
      expect(kit.sessions.rows).toEqual([]);
    });

    it('counts the attempt before it looks at the code, so a correct code spends one too', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      await kit.verifyOtp.execute(input());

      expect(kit.challenges.rows[0]?.attempts).toBe(1);
    });

    it('compares no code when the attempt cannot be claimed', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      const matches = jest.spyOn(kit.codes, 'matches');
      jest.spyOn(kit.challenges, 'claimAttempt').mockResolvedValue(false);

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
      expect(matches).not.toHaveBeenCalled();
    });
  });

  describe('a code that can no longer be verified', () => {
    it('is OTP_EXPIRED when none was requested', async () => {
      const kit = buildAuthUseCases();

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
    });

    it('is OTP_EXPIRED at the moment it expires, and not a second before', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      kit.clock.advanceSeconds(299);
      const early = buildAuthUseCases();
      await request(early);
      early.clock.advanceSeconds(299);
      await expect(early.verifyOtp.execute(input())).resolves.toBeDefined();

      kit.clock.advanceSeconds(1);

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
    });

    it('accepts only the newest code: the previous one is OTP_INVALID', async () => {
      const kit = buildAuthUseCases();
      kit.codes.nextCodes = ['111111'];
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });
      kit.clock.advanceSeconds(60);
      await request(kit);

      expect(
        await codeOf(kit.verifyOtp.execute(input({ code: '111111' }))),
      ).toBe(ErrorCode.OTP_INVALID);
      await expect(kit.verifyOtp.execute(input())).resolves.toBeDefined();
    });

    it('is OTP_EXPIRED for the loser when two requests verify the same code at once', async () => {
      const kit = buildAuthUseCases();
      await request(kit);
      jest.spyOn(kit.challenges, 'consume').mockResolvedValue(false);

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.OTP_EXPIRED,
      );
      expect(kit.sessions.rows).toEqual([]);
    });
  });

  describe('audience scoping', () => {
    it('does not accept a customer code for another audience', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'admin', null);
      await request(kit, PHONE, 'customer');

      expect(
        await codeOf(kit.verifyOtp.execute(input({ audience: 'admin' }))),
      ).toBe(ErrorCode.OTP_EXPIRED);
    });

    it('gives an admin who signs in as a customer a customer session, with no admin power in it', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'admin', null);
      await request(kit, PHONE, 'customer');

      const result = await kit.verifyOtp.execute(input());

      expect(result.principal.audience).toBe('customer');
      expect(kit.sessions.rows[0]?.audience).toBe('customer');
      expect(kit.accessTokens.signed[0]?.user.audience).toBe('customer');
    });

    it('signs staff in with the organisation of their access', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
      await request(kit, STAFF_PHONE, 'vendor');

      const result = await kit.verifyOtp.execute(
        input({ phone: STAFF_PHONE, audience: 'vendor' }),
      );

      expect(result.principal).toMatchObject({
        audience: 'vendor',
        organisationId: ORGANISATION,
      });
      expect(kit.sessions.rows[0]?.organisationId).toBe(ORGANISATION);
    });
  });

  describe('a staff audience without access', () => {
    it('fails every code as a wrong code, exactly as a real request does, and never creates a user', async () => {
      const kit = buildAuthUseCases();
      await request(kit, STAFF_PHONE, 'vendor');
      const real = buildAuthUseCases();
      real.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
      await request(real, STAFF_PHONE, 'vendor');
      const guess = input({
        phone: STAFF_PHONE,
        audience: 'vendor',
        code: '000001',
      });

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const outcome = await codeOf(kit.verifyOtp.execute(guess));
        expect(outcome).toBe(ErrorCode.OTP_INVALID);
        expect(outcome).toBe(await codeOf(real.verifyOtp.execute(guess)));
      }
      const afterLimit = await codeOf(kit.verifyOtp.execute(guess));
      expect(afterLimit).toBe(ErrorCode.OTP_EXPIRED);
      expect(afterLimit).toBe(await codeOf(real.verifyOtp.execute(guess)));

      expect(kit.users.users).toEqual([]);
      expect(kit.sessions.rows).toEqual([]);
    });

    it('does not accept the code that was generated but not stored', async () => {
      const kit = buildAuthUseCases();
      await request(kit, STAFF_PHONE, 'vendor');

      expect(
        await codeOf(
          kit.verifyOtp.execute(
            input({ phone: STAFF_PHONE, audience: 'vendor', code: CODE }),
          ),
        ),
      ).toBe(ErrorCode.OTP_INVALID);
    });

    it('fails a correct code as a wrong code when the access was deactivated after the request, without consuming it', async () => {
      const kit = buildAuthUseCases();
      const user = kit.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
      await request(kit, STAFF_PHONE, 'vendor');
      kit.users.deactivate(user.id, 'vendor');

      expect(
        await codeOf(
          kit.verifyOtp.execute(
            input({ phone: STAFF_PHONE, audience: 'vendor' }),
          ),
        ),
      ).toBe(ErrorCode.OTP_INVALID);

      expect(kit.challenges.rows[0]).toMatchObject({
        attempts: 1,
        consumedAt: null,
      });
      expect(kit.sessions.rows).toEqual([]);
    });
  });

  describe('a disabled user', () => {
    it('is refused with ACCOUNT_DISABLED after a correct code, and gets no session', async () => {
      const kit = buildAuthUseCases();
      const user = kit.users.add(PHONE);
      kit.users.disable(user.id, kit.clock.now());
      await request(kit);

      expect(await codeOf(kit.verifyOtp.execute(input()))).toBe(
        ErrorCode.ACCOUNT_DISABLED,
      );

      expect(kit.sessions.rows).toEqual([]);
      expect(kit.refreshTokens.rows).toEqual([]);
      expect(kit.accessTokens.signed).toEqual([]);
    });

    it('learns nothing from a wrong code: that is OTP_INVALID as for anyone', async () => {
      const kit = buildAuthUseCases();
      const user = kit.users.add(PHONE);
      kit.users.disable(user.id, kit.clock.now());
      await request(kit);

      expect(
        await codeOf(kit.verifyOtp.execute(input({ code: '000001' }))),
      ).toBe(ErrorCode.OTP_INVALID);
    });
  });

  describe('a review account', () => {
    const review = { reviewAccounts: [{ phone: PHONE, code: '135790' }] };

    it('signs in with its fixed code and is logged at warn', async () => {
      const kit = buildAuthUseCases(review);
      await request(kit);

      const result = await kit.verifyOtp.execute(input({ code: '135790' }));

      expect(result.principal.phone).toBe(PHONE);
      expect(logWarn).toHaveBeenCalledWith(
        { userId: 'user-1', sessionId: 'session-1', audience: 'customer' },
        'Signed in with a review account',
      );
    });

    it('does not log an ordinary sign-in at warn', async () => {
      const kit = buildAuthUseCases();
      await request(kit);

      await kit.verifyOtp.execute(input());

      expect(logWarn).not.toHaveBeenCalled();
    });

    it('is held to the attempt limit like any phone', async () => {
      const kit = buildAuthUseCases(review);
      await request(kit);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await codeOf(kit.verifyOtp.execute(input({ code: '000001' })));
      }

      expect(
        await codeOf(kit.verifyOtp.execute(input({ code: '135790' }))),
      ).toBe(ErrorCode.OTP_EXPIRED);
    });
  });
});
