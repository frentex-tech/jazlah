import { Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildAuthUseCases } from './auth-use-cases.fake';

/** Obviously fictitious numbers. */
const PHONE = '+966512345678';
const STAFF_PHONE = '+966511112222';
const ORGANISATION = '11111111-1111-4111-8111-111111111111';

async function errorOf(work: Promise<unknown>): Promise<unknown> {
  return work.then(
    () => {
      throw new Error('expected a rejection');
    },
    (error: unknown) => error,
  );
}

describe('RequestOtpUseCase', () => {
  let logError: jest.SpyInstance;
  let logInfo: jest.SpyInstance;

  beforeEach(() => {
    logInfo = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('for a customer', () => {
    it('stores the hash of a new code, never the code, and sends the code', async () => {
      const kit = buildAuthUseCases();
      kit.codes.nextCodes = ['482913'];

      const result = await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      expect(result).toEqual({ expiresInSeconds: 300, resendAfterSeconds: 60 });
      expect(kit.challenges.rows).toHaveLength(1);
      expect(kit.challenges.rows[0]).toMatchObject({
        phone: PHONE,
        audience: 'customer',
        codeHash: `hash(${PHONE}|customer|482913)`,
        expiresAt: new Date('2026-11-14T09:05:00.000Z'),
        attempts: 0,
        consumedAt: null,
      });
      expect(kit.sender.sent).toEqual([
        { phone: PHONE, text: 'رمز التحقق في جزلة: 482913' },
      ]);
    });

    it('writes the message in English when English is asked', async () => {
      const kit = buildAuthUseCases();
      kit.codes.nextCodes = ['482913'];

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'en',
      });

      expect(kit.sender.sent[0]?.text).toBe(
        'Your JAZLA verification code: 482913',
      );
    });

    it('sends to a phone never seen before: anyone may be a customer', async () => {
      const kit = buildAuthUseCases();

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      expect(kit.users.users).toEqual([]);
      expect(kit.sender.sent).toHaveLength(1);
    });

    it('keeps the code and the phone out of the log', async () => {
      const kit = buildAuthUseCases();
      kit.codes.nextCodes = ['482913'];

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      const logged = JSON.stringify(logInfo.mock.calls);
      expect(logged).toContain('challenge-1');
      expect(logged).not.toContain('482913');
      expect(logged).not.toContain(PHONE);
    });

    it('deletes the challenge and reports the failure when the SMS is not sent', async () => {
      const kit = buildAuthUseCases();
      const failure = new AppError(ErrorCode.SERVICE_UNAVAILABLE);
      kit.sender.failNext(failure);

      const error = await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(error).toBe(failure);
      expect(kit.challenges.rows).toEqual([]);
    });

    it('lets the previous code stand, and a retry go at once, after a failed send', async () => {
      const kit = buildAuthUseCases();
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });
      kit.clock.advanceSeconds(61);
      kit.sender.failNext(new AppError(ErrorCode.SERVICE_UNAVAILABLE));
      await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(kit.challenges.rows.map((row) => row.id)).toEqual(['challenge-1']);
      await expect(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      ).resolves.toBeDefined();
    });

    it('still reports the send failure when the challenge cannot be deleted', async () => {
      const kit = buildAuthUseCases();
      const failure = new AppError(ErrorCode.SERVICE_UNAVAILABLE);
      kit.sender.failNext(failure);
      kit.challenges.deleteFailure = new Error('database down');

      const error = await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(error).toBe(failure);
      expect(logError).toHaveBeenCalledTimes(1);
    });
  });

  describe('the resend wait', () => {
    it('refuses a second request inside the wait, saying how long is left', async () => {
      const kit = buildAuthUseCases();
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });
      kit.clock.advanceSeconds(20);

      const error = await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(error).toMatchObject({
        code: ErrorCode.RATE_LIMITED,
        retryAfterSeconds: 40,
      });
      expect(kit.sender.sent).toHaveLength(1);
    });

    it('does not count a refused resend against the phone', async () => {
      const kit = buildAuthUseCases();
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(kit.limit.counted).toEqual([PHONE]);
    });

    it('allows a new code once the wait has passed, and the newest is the one that counts', async () => {
      const kit = buildAuthUseCases();
      kit.codes.nextCodes = ['111111', '222222'];
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });
      kit.clock.advanceSeconds(60);

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      expect(kit.challenges.rows).toHaveLength(2);
      expect(
        (await kit.challenges.findNewest(PHONE, 'customer'))?.codeHash,
      ).toBe(`hash(${PHONE}|customer|222222)`);
    });

    it('is per audience: a customer code does not hold back a vendor code', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(PHONE, 'vendor', ORGANISATION);
      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      await expect(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'vendor',
          language: 'ar',
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('the phone limit', () => {
    it('stops before anything is stored or sent when the phone is over its limit', async () => {
      const kit = buildAuthUseCases();
      const refusal = new AppError(ErrorCode.RATE_LIMITED, {
        retryAfterSeconds: 600,
      });
      kit.limit.refuseWith(refusal);

      const error = await errorOf(
        kit.requestOtp.execute({
          phone: PHONE,
          audience: 'customer',
          language: 'ar',
        }),
      );

      expect(error).toBe(refusal);
      expect(kit.challenges.rows).toEqual([]);
      expect(kit.sender.sent).toEqual([]);
    });
  });

  describe('for a staff audience', () => {
    it('sends a real code to a phone with active access, without waiting for the SMS', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
      kit.codes.nextCodes = ['482913'];

      const result = await kit.requestOtp.execute({
        phone: STAFF_PHONE,
        audience: 'vendor',
        language: 'ar',
      });

      expect(result).toEqual({ expiresInSeconds: 300, resendAfterSeconds: 60 });
      expect(kit.sender.sent).toEqual([]);
      expect(kit.detached.started).toEqual(['otp-sms']);
      await kit.detached.settle();
      expect(kit.sender.sent).toEqual([
        { phone: STAFF_PHONE, text: 'رمز التحقق في جزلة: 482913' },
      ]);
      expect(kit.challenges.rows[0]?.codeHash).toBe(
        `hash(${STAFF_PHONE}|vendor|482913)`,
      );
    });

    it.each([
      ['a phone nobody has', () => undefined],
      [
        'a customer without access',
        (kit: ReturnType<typeof buildAuthUseCases>) => {
          kit.users.add(STAFF_PHONE);
        },
      ],
      [
        'staff of another audience',
        (kit: ReturnType<typeof buildAuthUseCases>) => {
          kit.users.grant(STAFF_PHONE, 'kitchen', ORGANISATION);
        },
      ],
      [
        'staff whose access was deactivated',
        (kit: ReturnType<typeof buildAuthUseCases>) => {
          const user = kit.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
          kit.users.deactivate(user.id, 'vendor');
        },
      ],
    ])(
      'answers %s exactly like a real request, stores a row no code matches, and sends nothing',
      async (_label, arrange) => {
        const real = buildAuthUseCases();
        real.users.grant(STAFF_PHONE, 'vendor', ORGANISATION);
        const expected = await real.requestOtp.execute({
          phone: STAFF_PHONE,
          audience: 'vendor',
          language: 'ar',
        });
        const kit = buildAuthUseCases();
        arrange(kit);

        const result = await kit.requestOtp.execute({
          phone: STAFF_PHONE,
          audience: 'vendor',
          language: 'ar',
        });
        await kit.detached.settle();

        expect(result).toEqual(expected);
        expect(kit.sender.sent).toEqual([]);
        expect(kit.detached.started).toEqual([]);
        expect(kit.challenges.rows).toHaveLength(1);
        expect(kit.challenges.rows[0]).toMatchObject({
          phone: STAFF_PHONE,
          audience: 'vendor',
          codeHash: 'unmatchable-1',
          expiresAt: real.challenges.rows[0]?.expiresAt,
          attempts: 0,
        });
        expect(kit.limit.counted).toEqual(real.limit.counted);
      },
    );

    it('holds a phone without access to the same resend wait', async () => {
      const kit = buildAuthUseCases();
      await kit.requestOtp.execute({
        phone: STAFF_PHONE,
        audience: 'vendor',
        language: 'ar',
      });

      const error = await errorOf(
        kit.requestOtp.execute({
          phone: STAFF_PHONE,
          audience: 'vendor',
          language: 'ar',
        }),
      );

      expect(error).toMatchObject({
        code: ErrorCode.RATE_LIMITED,
        retryAfterSeconds: 60,
      });
    });

    it('logs a failed send at error and deletes its row, the request having already answered', async () => {
      const kit = buildAuthUseCases();
      kit.users.grant(STAFF_PHONE, 'admin', null);
      kit.sender.failNext(new AppError(ErrorCode.SERVICE_UNAVAILABLE));

      await expect(
        kit.requestOtp.execute({
          phone: STAFF_PHONE,
          audience: 'admin',
          language: 'ar',
        }),
      ).resolves.toBeDefined();
      expect(kit.challenges.rows).toHaveLength(1);

      await kit.detached.settle();

      expect(kit.challenges.rows).toEqual([]);
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ challengeId: 'challenge-1' }),
        'Verification code not sent',
      );
      expect(JSON.stringify(logError.mock.calls)).not.toContain(STAFF_PHONE);
    });
  });

  describe('a review account', () => {
    const review = { reviewAccounts: [{ phone: PHONE, code: '135790' }] };

    it('stores its fixed code and sends no SMS', async () => {
      const kit = buildAuthUseCases(review);
      kit.codes.nextCodes = ['482913'];

      const result = await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      expect(result).toEqual({ expiresInSeconds: 300, resendAfterSeconds: 60 });
      expect(kit.challenges.rows[0]?.codeHash).toBe(
        `hash(${PHONE}|customer|135790)`,
      );
      expect(kit.sender.sent).toEqual([]);
    });

    it('still needs granted access for a staff audience', async () => {
      const kit = buildAuthUseCases(review);

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'admin',
        language: 'ar',
      });

      expect(kit.challenges.rows[0]?.codeHash).toBe('unmatchable-1');
    });

    it('is under the same limits as any phone', async () => {
      const kit = buildAuthUseCases(review);

      await kit.requestOtp.execute({
        phone: PHONE,
        audience: 'customer',
        language: 'ar',
      });

      expect(kit.limit.counted).toEqual([PHONE]);
    });
  });
});
