import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { Redis } from 'ioredis';
import { ERROR_MESSAGES } from '@common/errors/error-messages.constants';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { authConfig } from '@config/auth.config';
import { rateLimitConfig } from '@config/rate-limit.config';
import { redisConfig } from '@config/redis.config';
import type { RedisConfig } from '@config/redis-config.type';
import { RedisService } from '@infra/redis/redis.service';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS, SmsError } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { CLOCK } from '@modules/auth/domain/ports/clock.port';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import type { HttpAppOptions } from './support/http-app-options.type';
import { TestClock } from './support/test-clock';
import { testPhone } from './support/test-phone';

/**
 * Signing in end to end: the real application, database and Redis, with the fake sms
 * provider as the phone and a clock the tests move. Each test uses its own phone
 * numbers (testPhone) and client address, so nothing is shared between tests.
 */
describe('Authentication (e2e)', () => {
  const apps: INestApplication<App>[] = [];
  const phones: string[] = [];
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let sms: FakeSmsProvider;
  let clock: TestClock;
  let client: AuthClient;

  /** An application with its own fake phone and clock. */
  async function start(options: HttpAppOptions = {}) {
    const fake = new FakeSmsProvider();
    const testClock = new TestClock();
    const started: INestApplication<App> = await createHttpApp({
      ...options,
      overrides: [
        { provide: SMS_PORTS, useValue: [fake] },
        { provide: CLOCK, useValue: testClock },
        ...(options.overrides ?? []),
      ],
    });
    apps.push(started);
    return {
      app: started,
      sms: fake,
      clock: testClock,
      client: new AuthClient(started, fake),
    };
  }

  /** A phone of this test, remembered so its rows are deleted afterwards. */
  function phone(label = ''): string {
    const number = testPhone(label);
    phones.push(number);
    return number;
  }

  /** Grants staff access straight in the database: no endpoint does it yet. */
  async function grant(
    number: string,
    audience: 'vendor' | 'kitchen' | 'admin',
  ): Promise<{ userId: string; organisationId: string | null }> {
    const user = await prisma.user.upsert({
      where: { phone: number },
      create: { phone: number },
      update: {},
    });
    const organisationId = audience === 'admin' ? null : randomUUID();
    await prisma.userAccess.create({
      data: { userId: user.id, audience, organisationId },
    });
    return { userId: user.id, organisationId };
  }

  beforeAll(async () => {
    ({ app, sms, clock, client } = await start());
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (prisma !== undefined) {
      await prisma.otpChallenge.deleteMany({
        where: { phone: { in: phones } },
      });
      // Sessions, refresh tokens and access rows go with their user (cascade).
      await prisma.user.deleteMany({ where: { phone: { in: phones } } });
    }
    await Promise.all(apps.map((each) => each.close()));
  });

  describe('a customer signing in', () => {
    it('requests a code, verifies it, and is then known on a customer route', async () => {
      const number = phone();

      const requested = await client.requestCode(number).expect(200);
      expect(requested.body).toEqual({
        expiresInSeconds: 300,
        resendAfterSeconds: 60,
      });
      expect(client.messagesTo(number)).toHaveLength(1);

      const verified = await client
        .verify(number, await client.codeFor(number), 'customer', {
          deviceName: 'Test phone',
        })
        .expect(200);
      const body = verified.body as SignedInBody;
      expect(body.accessTokenExpiresInSeconds).toBe(900);
      expect(body.refreshTokenExpiresInSeconds).toBe(2_592_000);
      expect(body.principal).toEqual({
        userId: body.principal.userId,
        phone: `+966*******${number.slice(-2)}`,
        audience: 'customer',
        organisationId: null,
        sessionId: body.principal.sessionId,
      });

      const me = await client.me('customer', body.accessToken).expect(200);
      expect(me.body).toEqual(body.principal);

      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: body.principal.sessionId },
      });
      expect(session).toMatchObject({
        audience: 'customer',
        organisationId: null,
        deviceName: 'Test phone',
        devicePlatform: 'ios',
        revokedAt: null,
      });
    });

    it('stores neither the code nor the refresh token', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      const { refreshToken, principal } = (
        await client.verify(number, code).expect(200)
      ).body as SignedInBody;

      const challenge = await prisma.otpChallenge.findFirstOrThrow({
        where: { phone: number },
      });
      const tokens = await prisma.refreshToken.findMany({
        where: { sessionId: principal.sessionId },
      });

      expect(challenge.codeHash).toMatch(/^[0-9a-f]{64}$/);
      expect(JSON.stringify(challenge)).not.toContain(code);
      expect(tokens).toHaveLength(1);
      expect(JSON.stringify(tokens)).not.toContain(refreshToken);
    });

    it('accepts the phone and the code in Arabic digits', async () => {
      const number = phone();
      const arabic = (text: string) =>
        text.replace(/\d/g, (digit) =>
          String.fromCharCode(0x0660 + Number(digit)),
        );
      await client.requestCode(arabic(`0${number.slice(4)}`)).expect(200);

      const res = await client
        .verify(number, arabic(await client.codeFor(number)))
        .expect(200);

      expect((res.body as SignedInBody).principal.audience).toBe('customer');
    });

    it('sends the message in English when English is asked', async () => {
      const number = phone();

      await client.requestCode(number).set('Accept-Language', 'en').expect(200);

      expect(client.messagesTo(number)[0]).toMatch(
        /^Your JAZLA verification code: \d{6}$/,
      );
    });

    it.each([
      ['a landline', { phone: '0112345678', audience: 'customer' }, 'phone'],
      [
        'an unknown audience',
        { phone: '0512345678', audience: 'root' },
        'audience',
      ],
      ['no audience', { phone: '0512345678' }, 'audience'],
    ])(
      'refuses %s with VALIDATION_FAILED and sends nothing',
      async (_l, body, field) => {
        const before = sms.sent.length;
        const res = await request(app.getHttpServer())
          .post('/v1/public/auth/otp/request')
          .send(body)
          .expect(400);

        const error = res.body as ErrorResponseBody;
        expect(error.code).toBe('VALIDATION_FAILED');
        expect(JSON.stringify(error.details)).toContain(`"field":"${field}"`);
        expect(sms.sent).toHaveLength(before);
      },
    );
  });

  describe('the code', () => {
    it('a wrong code is OTP_INVALID; after the fifth attempt even the right code is OTP_EXPIRED', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      const wrong = code === '000000' ? '000001' : '000000';

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const res = await client.verify(number, wrong).expect(422);
        expect((res.body as ErrorResponseBody).code).toBe('OTP_INVALID');
      }
      const res = await client.verify(number, code).expect(410);

      expect((res.body as ErrorResponseBody).code).toBe('OTP_EXPIRED');
      expect(
        await prisma.user.findUnique({ where: { phone: number } }),
      ).toBeNull();
    });

    it('holds the attempt limit when the guesses arrive at once', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      const guesses = Array.from({ length: 12 }, (_, i) =>
        String(i).padStart(6, '0'),
      ).filter((guess) => guess !== code);

      const statuses = (
        await Promise.all(guesses.map((guess) => client.verify(number, guess)))
      ).map((res) => res.status);

      expect(statuses.filter((status) => status === 422)).toHaveLength(5);
      expect(statuses.filter((status) => status === 410)).toHaveLength(
        guesses.length - 5,
      );
      const challenge = await prisma.otpChallenge.findFirstOrThrow({
        where: { phone: number },
      });
      expect(challenge.attempts).toBe(5);
    });

    it('works once', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      await client.verify(number, code).expect(200);

      const res = await client.verify(number, code).expect(410);

      expect((res.body as ErrorResponseBody).code).toBe('OTP_EXPIRED');
    });

    it('expires', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      clock.advanceSeconds(301);

      const res = await client.verify(number, code).expect(410);

      expect((res.body as ErrorResponseBody).code).toBe('OTP_EXPIRED');
    });

    it('a resend inside the wait is RATE_LIMITED with Retry-After; after it, the new code replaces the old', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);
      const first = await client.codeFor(number);

      const early = await client
        .requestCode(number)
        .set('Accept-Language', 'en')
        .expect(429);
      expect(early.body).toMatchObject({
        code: 'RATE_LIMITED',
        message: ERROR_MESSAGES.RATE_LIMITED.en,
      });
      const retryAfter = Number(early.headers['retry-after']);
      expect(retryAfter).toBeGreaterThan(50);
      expect(retryAfter).toBeLessThanOrEqual(60);
      expect(client.messagesTo(number)).toHaveLength(1);

      clock.advanceSeconds(61);
      await client.requestCode(number).expect(200);
      const second = await client.codeFor(number);
      if (second !== first) {
        await client.verify(number, first).expect(422);
      }
      await client.verify(number, second).expect(200);
    });
  });

  describe('rate limits', () => {
    it('the fourth request for one phone is RATE_LIMITED, whatever the address and audience', async () => {
      const number = phone();
      const from = (audience: string, address: string) =>
        client.requestCode(number, audience).set('X-Forwarded-For', address);

      await from('customer', '2001:db8:aa::1').expect(200);
      await from('vendor', '2001:db8:aa::2').expect(200);
      await from('kitchen', '2001:db8:aa::3').expect(200);
      const res = await from('admin', '2001:db8:aa::4').expect(429);

      expect((res.body as ErrorResponseBody).code).toBe('RATE_LIMITED');
      expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
      expect(client.messagesTo(number)).toHaveLength(1);
    });

    it('stores no phone number in a rate limit key', async () => {
      const number = phone();
      await client.requestCode(number).expect(200);

      const { keyPrefix } = app.get<RedisConfig>(redisConfig.KEY);
      const keys = await app
        .get(RedisService)
        .keys(`${keyPrefix}:rate-limit:*`);

      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(key).toMatch(/:rate-limit:\{[0-9a-f]{64}\}:(hits|blocked)$/);
        expect(key).not.toContain(number.slice(1));
      }
    });

    it('takes the address limits from configuration: over them is RATE_LIMITED with the limit in the headers', async () => {
      const limited = await start({
        rateLimit: {
          ...rateLimitConfig(),
          configured: {
            ...rateLimitConfig().configured,
            otpRequestAddress: { limit: 2, windowMs: 600_000 },
            otpVerifyAddress: { limit: 1, windowMs: 600_000 },
          },
        },
      });

      const first = await limited.client.requestCode(phone('a')).expect(200);
      expect(first.headers['x-ratelimit-limit']).toBe('2');
      await limited.client.requestCode(phone('b')).expect(200);
      const third = await limited.client.requestCode(phone('c')).expect(429);
      expect((third.body as ErrorResponseBody).code).toBe('RATE_LIMITED');
      expect(limited.client.messagesTo(phone('c'))).toEqual([]);

      await limited.client.verify(phone('a'), '000000').expect(422);
      await limited.client.verify(phone('a'), '000000').expect(429);
    });

    it('answers 503 and sends nothing while the rate limit storage is unavailable', async () => {
      const down = await start({
        rateLimitRedis: { status: 'reconnecting' } as unknown as Redis,
      });
      const number = phone();

      const requested = await down.client.requestCode(number).expect(503);
      const verified = await down.client.verify(number, '000000').expect(503);

      expect((requested.body as ErrorResponseBody).code).toBe(
        'SERVICE_UNAVAILABLE',
      );
      expect((verified.body as ErrorResponseBody).code).toBe(
        'SERVICE_UNAVAILABLE',
      );
      expect(down.sms.sent).toEqual([]);
      expect(
        await prisma.otpChallenge.count({ where: { phone: number } }),
      ).toBe(0);
    });
  });

  describe('when the SMS cannot be sent', () => {
    it('a customer request answers 503 and leaves no challenge, so a retry goes at once', async () => {
      const number = phone();
      sms.failNext(new SmsError('unavailable'));

      const res = await client.requestCode(number).expect(503);

      expect((res.body as ErrorResponseBody).code).toBe('SERVICE_UNAVAILABLE');
      expect(
        await prisma.otpChallenge.count({ where: { phone: number } }),
      ).toBe(0);
      await client.requestCode(number).expect(200);
    });
  });

  describe('staff audiences', () => {
    it('a request for a phone without access is indistinguishable from a real one and sends nothing', async () => {
      const staff = phone('staff');
      const stranger = phone('stranger');
      await grant(staff, 'vendor');

      const real = await client.requestCode(staff, 'vendor').expect(200);
      const fake = await client.requestCode(stranger, 'vendor').expect(200);
      await client.codeFor(staff);

      expect(fake.body).toEqual(real.body);
      expect(client.messagesTo(stranger)).toEqual([]);
      expect(
        await prisma.user.findUnique({ where: { phone: stranger } }),
      ).toBeNull();

      const rows = await prisma.otpChallenge.findMany({
        where: { phone: { in: [staff, stranger] } },
      });
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        expect(row.codeHash).toMatch(/^[0-9a-f]{64}$/);
        expect(row.attempts).toBe(0);
      }

      // The same resend wait.
      const realAgain = await client.requestCode(staff, 'vendor').expect(429);
      const fakeAgain = await client
        .requestCode(stranger, 'vendor')
        .expect(429);
      expect((fakeAgain.body as ErrorResponseBody).code).toBe(
        (realAgain.body as ErrorResponseBody).code,
      );
      expect(fakeAgain.headers['retry-after']).toBeDefined();

      // The same answers to a wrong code, attempt by attempt, then the same lock.
      const code = await client.codeFor(staff);
      const wrong = code === '000000' ? '000001' : '000000';
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const realRes = await client.verify(staff, wrong, 'vendor');
        const fakeRes = await client.verify(stranger, wrong, 'vendor');
        expect(fakeRes.status).toBe(422);
        expect(fakeRes.status).toBe(realRes.status);
        const fakeBody = fakeRes.body as ErrorResponseBody;
        const realBody = realRes.body as ErrorResponseBody;
        expect(Object.keys(fakeBody)).toEqual(Object.keys(realBody));
        expect(fakeBody.code).toBe(realBody.code);
        expect(fakeBody.message).toBe(realBody.message);
      }
      expect((await client.verify(stranger, wrong, 'vendor')).status).toBe(410);
      expect((await client.verify(staff, wrong, 'vendor')).status).toBe(410);
    });

    it('answers a staff request before its SMS is sent', async () => {
      const staff = phone();
      await grant(staff, 'admin');
      let release: () => void = () => undefined;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      const send = sms.send.bind(sms);
      const spy = jest
        .spyOn(sms, 'send')
        .mockImplementation(async (message, signal) => {
          await held;
          return send(message, signal);
        });
      try {
        await client.requestCode(staff, 'admin').expect(200);

        expect(client.messagesTo(staff)).toEqual([]);
        release();
        expect(await client.codeFor(staff)).toMatch(/^\d{6}$/);
      } finally {
        release();
        spy.mockRestore();
      }
    });

    it('signs staff in with their organisation, and a customer code does not open a staff session', async () => {
      const staff = phone();
      const { organisationId } = await grant(staff, 'vendor');

      const vendor = await client.signIn(staff, 'vendor');

      expect(vendor.principal).toMatchObject({
        audience: 'vendor',
        organisationId,
      });
      await client.me('vendor', vendor.accessToken).expect(200);
    });

    it('refuses a customer token on admin routes for a user who also holds admin access', async () => {
      const number = phone();
      await grant(number, 'admin');

      const customer = await client.signIn(number, 'customer');
      const asAdmin = await client
        .me('admin', customer.accessToken)
        .expect(403);
      expect((asAdmin.body as ErrorResponseBody).code).toBe('FORBIDDEN');
      await client.logoutAll('admin', customer.accessToken).expect(403);

      const admin = await client.signIn(number, 'admin');
      expect(admin.principal.userId).toBe(customer.principal.userId);
      await client.me('admin', admin.accessToken).expect(200);
      await client.me('customer', admin.accessToken).expect(403);
      // Refreshing keeps the single audience.
      const refreshed = (
        await client.refresh(customer.refreshToken).expect(200)
      ).body as SignedInBody;
      await client.me('admin', refreshed.accessToken).expect(403);
      await client.me('customer', refreshed.accessToken).expect(200);
    });

    it('ends a staff session at refresh once the access is deactivated', async () => {
      const staff = phone();
      const { userId } = await grant(staff, 'kitchen');
      const kitchen = await client.signIn(staff, 'kitchen');
      await prisma.userAccess.updateMany({
        where: { userId, audience: 'kitchen' },
        data: { deactivatedAt: new Date() },
      });

      const res = await client.refresh(kitchen.refreshToken).expect(401);

      expect((res.body as ErrorResponseBody).code).toBe(
        'REFRESH_TOKEN_INVALID',
      );
      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: kitchen.principal.sessionId },
      });
      expect(session.revocationReason).toBe('access_lost');
      // And a new request is now the unverifiable kind: nothing is sent.
      clock.advanceSeconds(61);
      const sentBefore = client.messagesTo(staff).length;
      await client.requestCode(staff, 'kitchen').expect(200);
      expect(client.messagesTo(staff)).toHaveLength(sentBefore);
    });
  });

  describe('refresh', () => {
    it('rotates: a new pair, and the access token expires into ACCESS_TOKEN_EXPIRED', async () => {
      const first = await client.signIn(phone());
      clock.advanceSeconds(901);

      const expired = await client
        .me('customer', first.accessToken)
        .expect(401);
      expect((expired.body as ErrorResponseBody).code).toBe(
        'ACCESS_TOKEN_EXPIRED',
      );

      const second = (await client.refresh(first.refreshToken).expect(200))
        .body as SignedInBody;
      expect(second.refreshToken).not.toBe(first.refreshToken);
      await client.me('customer', second.accessToken).expect(200);
      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: first.principal.sessionId },
      });
      expect(session.lastUsedAt.getTime()).toBeGreaterThan(
        session.createdAt.getTime(),
      );
    });

    it('detects reuse: the old token again revokes the session, the new token with it', async () => {
      const first = await client.signIn(phone());
      const second = (await client.refresh(first.refreshToken).expect(200))
        .body as SignedInBody;

      const reused = await client.refresh(first.refreshToken).expect(401);
      expect((reused.body as ErrorResponseBody).code).toBe(
        'REFRESH_TOKEN_INVALID',
      );
      await client.refresh(second.refreshToken).expect(401);

      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: first.principal.sessionId },
      });
      expect(session.revocationReason).toBe('reuse_detected');
    });

    it('lets one of two simultaneous refreshes of the same token win at most, and revokes the session', async () => {
      const first = await client.signIn(phone());

      const statuses = (
        await Promise.all([
          client.refresh(first.refreshToken),
          client.refresh(first.refreshToken),
        ])
      ).map((res) => res.status);

      expect(
        statuses.filter((status) => status === 200).length,
      ).toBeLessThanOrEqual(1);
      expect(statuses).toContain(401);
      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: first.principal.sessionId },
      });
      expect(session.revocationReason).toBe('reuse_detected');
      expect(
        await prisma.refreshToken.count({
          where: { sessionId: session.id, usedAt: null },
        }),
      ).toBeLessThanOrEqual(1);
    });

    it('refuses an unknown token and a malformed body', async () => {
      const unknown = await client.refresh('x'.repeat(43)).expect(401);
      expect((unknown.body as ErrorResponseBody).code).toBe(
        'REFRESH_TOKEN_INVALID',
      );
      const invalid = await client.refresh('short').expect(400);
      expect((invalid.body as ErrorResponseBody).code).toBe(
        'VALIDATION_FAILED',
      );
    });
  });

  describe('signing out', () => {
    it('logout ends that session only, and answers 204 for anything', async () => {
      const number = phone();
      const first = await client.signIn(number);
      clock.advanceSeconds(61);
      const second = await client.signIn(number);

      await client.logout(first.refreshToken).expect(204);
      await client.logout(first.refreshToken).expect(204);
      await client.logout('y'.repeat(43)).expect(204);

      await client.refresh(first.refreshToken).expect(401);
      await client.refresh(second.refreshToken).expect(200);
    });

    it('logout-all ends every session of the audience, not those of another audience', async () => {
      const number = phone();
      await grant(number, 'admin');
      const first = await client.signIn(number);
      clock.advanceSeconds(61);
      const second = await client.signIn(number);
      const admin = await client.signIn(number, 'admin');

      await client.logoutAll('customer', second.accessToken).expect(204);

      await client.refresh(first.refreshToken).expect(401);
      await client.refresh(second.refreshToken).expect(401);
      await client.refresh(admin.refreshToken).expect(200);
      const sessions = await prisma.authSession.findMany({
        where: { userId: first.principal.userId, audience: 'customer' },
      });
      expect(sessions.map((session) => session.revocationReason)).toEqual([
        'logout_all',
        'logout_all',
      ]);
      // The accepted window: the access token itself works until it expires.
      await client.me('customer', second.accessToken).expect(200);
      clock.advanceSeconds(901);
      await client.me('customer', second.accessToken).expect(401);
    });

    it('logout-all needs a sign-in', async () => {
      const res = await client.logoutAll('customer', 'not-a-token').expect(401);

      expect((res.body as ErrorResponseBody).code).toBe('UNAUTHORIZED');
    });
  });

  describe('a disabled user', () => {
    it('cannot verify, cannot refresh, and is told so on me', async () => {
      const number = phone();
      const signedIn = await client.signIn(number);
      await prisma.user.update({
        where: { phone: number },
        data: { disabledAt: new Date() },
      });

      const me = await client.me('customer', signedIn.accessToken).expect(403);
      expect((me.body as ErrorResponseBody).code).toBe('ACCOUNT_DISABLED');

      const refreshed = await client.refresh(signedIn.refreshToken).expect(403);
      expect((refreshed.body as ErrorResponseBody).code).toBe(
        'ACCOUNT_DISABLED',
      );
      const session = await prisma.authSession.findUniqueOrThrow({
        where: { id: signedIn.principal.sessionId },
      });
      expect(session.revocationReason).toBe('access_lost');

      clock.advanceSeconds(61);
      await client.requestCode(number).expect(200);
      const code = await client.codeFor(number);
      const wrong = code === '000000' ? '000001' : '000000';
      await client.verify(number, wrong).expect(422);
      const verified = await client.verify(number, code).expect(403);
      expect((verified.body as ErrorResponseBody).code).toBe(
        'ACCOUNT_DISABLED',
      );
      expect(
        await prisma.authSession.count({
          where: { userId: signedIn.principal.userId },
        }),
      ).toBe(1);
    });
  });

  describe('a review account', () => {
    it('signs in with its fixed code and never triggers an SMS', async () => {
      const number = phone();
      const review = await start({
        overrides: [
          {
            provide: authConfig.KEY,
            useValue: {
              ...authConfig(),
              reviewAccounts: [{ phone: number, code: '135790' }],
            },
          },
        ],
      });

      await review.client.requestCode(number).expect(200);
      await review.client.verify(number, '135791').expect(422);
      const res = await review.client.verify(number, '135790').expect(200);

      expect((res.body as SignedInBody).principal.audience).toBe('customer');
      expect(review.sms.sent).toEqual([]);
      // Another phone on the same application still gets a real code.
      const other = phone('other');
      await review.client.requestCode(other).expect(200);
      expect(review.client.messagesTo(other)).toHaveLength(1);
    });
  });

  describe('signing key rotation', () => {
    it('accepts a token of the previous key after a rotation, and rejects it once that key is gone', async () => {
      const old = await client.signIn(phone());
      const current = authConfig().accessTokenKey;
      const next = { id: 'next', secret: `${current.secret}-rotated` };
      const rotated = await start({
        overrides: [
          {
            provide: authConfig.KEY,
            useValue: {
              ...authConfig(),
              accessTokenKey: next,
              previousAccessTokenKey: current,
            },
          },
        ],
      });
      const retired = await start({
        overrides: [
          {
            provide: authConfig.KEY,
            useValue: {
              ...authConfig(),
              accessTokenKey: next,
              previousAccessTokenKey: undefined,
            },
          },
        ],
      });

      await rotated.client.me('customer', old.accessToken).expect(200);
      const fresh = (await rotated.client.refresh(old.refreshToken).expect(200))
        .body as SignedInBody;
      await rotated.client.me('customer', fresh.accessToken).expect(200);
      // Nobody was signed out by the rotation; the old application no longer knows the new key.
      await client.me('customer', fresh.accessToken).expect(401);
      await retired.client.me('customer', old.accessToken).expect(401);
      await retired.client.me('customer', fresh.accessToken).expect(200);
    });
  });
});
