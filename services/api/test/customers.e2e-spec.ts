import type { INestApplication } from '@nestjs/common';
import request, { type Response, type Test } from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { UsersService } from '@modules/users';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import { holdRowLock } from './support/row-lock';
import { sent } from './support/sent-request';
import { testPhone } from './support/test-phone';

/** An address as the API answers it (dates as JSON strings). */
type AddressBody = {
  id: string;
  label: string;
  location: { latitude: number; longitude: number };
  city: string | null;
  district: string | null;
  street: string | null;
  building: string | null;
  shortNationalAddress: string | null;
  driverInstructions: string | null;
  isDefault: boolean;
  isLocked: boolean;
};

const errorOf = (res: Response): ErrorResponseBody =>
  res.body as ErrorResponseBody;

/**
 * The customer's profile, marketing consent and saved addresses end to end, against the
 * real application and database with the fake sms provider. Each test signs in its own
 * customers (testPhone), so nothing is shared with tests running beside it. The writes
 * that lock the user's row are made to overlap with holdRowLock.
 */
describe('Customers (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let auth: AuthClient;
  const phones: string[] = [];

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    app = await createHttpApp({
      overrides: [{ provide: SMS_PORTS, useValue: [sms] }],
    });
    prisma = app.get(PrismaService);
    auth = new AuthClient(app, sms);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    const users = await prisma.user.findMany({
      where: { phone: { in: phones } },
      select: { id: true },
    });
    const userIds = users.map((user) => user.id);
    await prisma.otpChallenge.deleteMany({ where: { phone: { in: phones } } });
    await prisma.userAccess.deleteMany({ where: { userId: { in: userIds } } });
    // Consent history restricts its user's deletion; profiles, addresses and sessions
    // go with the user.
    await prisma.consentRecord.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const bearer = (user: SignedInBody): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];

  /** A new customer of this test, signed in. */
  async function customer(label = 'customer'): Promise<SignedInBody> {
    const phone = testPhone(label);
    phones.push(phone);
    return auth.signIn(phone);
  }

  const RIYADH = { latitude: 24.7136, longitude: 46.6753 };

  function saveAddress(
    user: SignedInBody,
    body: Record<string, unknown> = {},
  ): Test {
    return http()
      .post('/v1/customer/addresses')
      .set(...bearer(user))
      .send({ label: 'البيت', location: RIYADH, ...body });
  }

  async function savedAddress(
    user: SignedInBody,
    label: string,
  ): Promise<AddressBody> {
    return (await saveAddress(user, { label }).expect(201)).body as AddressBody;
  }

  async function addressesOf(user: SignedInBody): Promise<AddressBody[]> {
    return (
      (
        await http()
          .get('/v1/customer/addresses')
          .set(...bearer(user))
          .expect(200)
      ).body as { items: AddressBody[] }
    ).items;
  }

  /** The labels, as listed, the default marked `*`. */
  async function listed(user: SignedInBody): Promise<string[]> {
    return (await addressesOf(user)).map(
      (each) => `${each.label}${each.isDefault ? '*' : ''}`,
    );
  }

  describe('the profile', () => {
    it('saves it: the name tidied, the email lowercase, and a name completes the profile', async () => {
      const user = await customer();

      const res = await http()
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send({
          fullName: '  محمد   العتيبي ',
          email: ' Mohammed@Example.COM ',
          preferredLanguage: 'en',
        })
        .expect(200);

      expect(res.body).toEqual({
        fullName: 'محمد العتيبي',
        email: 'mohammed@example.com',
        preferredLanguage: 'en',
        isComplete: true,
      });
      expect(
        (await auth.me('customer', user.accessToken).expect(200)).body,
      ).toMatchObject({
        fullName: 'محمد العتيبي',
        email: 'mohammed@example.com',
        preferredLanguage: 'en',
        profileComplete: true,
      });
    });

    it('keeps the fields not sent, and null removes the email', async () => {
      const user = await customer();
      await http()
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send({ fullName: 'محمد', email: 'mohammed@example.com' })
        .expect(200);

      const res = await http()
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send({ email: null })
        .expect(200);

      expect(res.body).toMatchObject({ fullName: 'محمد', email: null });
    });

    it.each([
      ['a one-letter name', { fullName: 'م' }, 'fullName'],
      ['a 61-letter name', { fullName: 'م'.repeat(61) }, 'fullName'],
      [
        'a name of 61 code points with a variation selector',
        { fullName: `${'م'.repeat(59)}\u2764\uFE0F` },
        'fullName',
      ],
      ['a name removed', { fullName: null }, 'fullName'],
      ['an email that is not one', { email: 'not-an-email' }, 'email'],
      ['an unknown language', { preferredLanguage: 'fr' }, 'preferredLanguage'],
    ])('refuses %s with VALIDATION_FAILED', async (_label, body, field) => {
      const user = await customer();

      const res = await http()
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send(body)
        .expect(400);

      expect(errorOf(res).code).toBe('VALIDATION_FAILED');
      expect(JSON.stringify(errorOf(res).details)).toContain(
        `"field":"${field}"`,
      );
    });

    it('needs a customer token: none is UNAUTHORIZED, an admin token FORBIDDEN', async () => {
      const adminPhone = testPhone('admin');
      phones.push(adminPhone);
      await app.get(UsersService).grantAdminAccess(adminPhone);
      const admin = await auth.signIn(adminPhone, 'admin');

      await http()
        .patch('/v1/customer/profile')
        .send({ fullName: 'محمد' })
        .expect(401);
      const forbidden = await http()
        .patch('/v1/customer/profile')
        .set(...bearer(admin))
        .send({ fullName: 'محمد' })
        .expect(403);

      expect(errorOf(forbidden).code).toBe('FORBIDDEN');
    });
  });

  describe('marketing consent', () => {
    const consent = (user: SignedInBody, granted: unknown) =>
      http()
        .put('/v1/customer/profile/marketing-consent')
        .set(...bearer(user))
        .send({ granted });

    async function historyOf(user: SignedInBody) {
      return (
        await prisma.consentRecord.findMany({
          where: { userId: user.principal.userId },
          orderBy: { sequence: 'asc' },
        })
      ).map(({ granted, sequence, source, kind }) => ({
        granted,
        sequence,
        source,
        kind,
      }));
    }

    it('keeps the history after grant, withdraw, grant, the last one current', async () => {
      const user = await customer();

      await consent(user, true).expect(200);
      await consent(user, false).expect(200);
      const last = await consent(user, true).expect(200);

      expect(await historyOf(user)).toEqual([
        { granted: true, sequence: 1, source: 'customer', kind: 'marketing' },
        { granted: false, sequence: 2, source: 'customer', kind: 'marketing' },
        { granted: true, sequence: 3, source: 'customer', kind: 'marketing' },
      ]);
      expect(last.body).toMatchObject({ granted: true });
      expect(
        (await auth.me('customer', user.accessToken).expect(200)).body,
      ).toMatchObject({ marketingConsent: { granted: true } });
    });

    it('records nothing when the current choice is sent again', async () => {
      const user = await customer();

      await consent(user, false).expect(200);
      await consent(user, true).expect(200);
      await consent(user, true).expect(200);

      expect((await historyOf(user)).map((row) => row.granted)).toEqual([true]);
    });

    it('records two grants sent at the same moment once', async () => {
      const user = await customer();

      const lock = await holdRowLock(prisma, 'users', user.principal.userId);
      let first!: ReturnType<typeof sent>;
      let second!: ReturnType<typeof sent>;
      try {
        first = sent(consent(user, true));
        second = sent(consent(user, true));
        await lock.waitForWaiters(2, () => first.done && second.done);
      } finally {
        await lock.release();
      }

      expect((await first.response).status).toBe(200);
      expect((await second.response).status).toBe(200);
      expect(await historyOf(user)).toEqual([
        { granted: true, sequence: 1, source: 'customer', kind: 'marketing' },
      ]);
    });

    it('refuses a choice that is not true or false', async () => {
      const user = await customer();

      const res = await consent(user, 'yes').expect(400);

      expect(errorOf(res).code).toBe('VALIDATION_FAILED');
    });
  });

  describe('addresses', () => {
    it('saves an address with its readable fields tidied; the first is the default, the next is not', async () => {
      const user = await customer();

      const home = await saveAddress(user, {
        label: ' البيت ',
        city: 'الرياض',
        district: '  ',
        shortNationalAddress: 'rrrd ٢٩٢٩',
        driverInstructions: 'اتصل قبل الوصول',
      }).expect(201);
      await savedAddress(user, 'العمل');

      expect(home.body).toMatchObject({
        label: 'البيت',
        location: RIYADH,
        city: 'الرياض',
        district: null,
        street: null,
        building: null,
        shortNationalAddress: 'RRRD2929',
        driverInstructions: 'اتصل قبل الوصول',
        isDefault: true,
      });
      expect(await listed(user)).toEqual(['البيت*', 'العمل']);
    });

    it.each([
      [
        'a latitude past 90',
        { location: { latitude: 91, longitude: 46.7 } },
        'location.latitude',
      ],
      [
        'a longitude past -180',
        { location: { latitude: 24.7, longitude: -181 } },
        'location.longitude',
      ],
      [
        'a latitude as text',
        { location: { latitude: '24.7', longitude: 46.7 } },
        'location.latitude',
      ],
      ['no location', { location: undefined }, 'location'],
      ['an empty label', { label: '  ' }, 'label'],
      ['a 31-letter label', { label: 'ب'.repeat(31) }, 'label'],
      [
        'a label of 31 code points with a variation selector',
        { label: `${'ب'.repeat(29)}\u2764\uFE0F` },
        'label',
      ],
      [
        'a short national address of another shape',
        { shortNationalAddress: 'RRR29290' },
        'shortNationalAddress',
      ],
    ])('refuses %s with VALIDATION_FAILED', async (_label, body, field) => {
      const user = await customer();

      const res = await saveAddress(user, body).expect(400);

      expect(errorOf(res).code).toBe('VALIDATION_FAILED');
      expect(JSON.stringify(errorOf(res).details)).toContain(
        `"field":"${field}"`,
      );
    });

    it('refuses the 11th address with ADDRESS_LIMIT_REACHED', async () => {
      const user = await customer();
      for (let n = 1; n <= 10; n += 1) {
        await savedAddress(user, `عنوان ${n}`);
      }

      const refused = await saveAddress(user, { label: 'الحادي عشر' }).expect(
        409,
      );

      expect(errorOf(refused)).toMatchObject({
        code: 'ADDRESS_LIMIT_REACHED',
        details: { limit: 10 },
      });
      expect(await addressesOf(user)).toHaveLength(10);
    });

    it('refuses one of two addresses saved at the same moment over nine', async () => {
      const user = await customer();
      for (let n = 1; n <= 9; n += 1) {
        await savedAddress(user, `عنوان ${n}`);
      }

      const lock = await holdRowLock(prisma, 'users', user.principal.userId);
      let first!: ReturnType<typeof sent>;
      let second!: ReturnType<typeof sent>;
      try {
        first = sent(saveAddress(user, { label: 'أ' }));
        second = sent(saveAddress(user, { label: 'ب' }));
        await lock.waitForWaiters(2, () => first.done && second.done);
      } finally {
        await lock.release();
      }

      expect(
        [(await first.response).status, (await second.response).status].sort(),
      ).toEqual([201, 409]);
      expect(
        await prisma.customerAddress.count({
          where: { userId: user.principal.userId },
        }),
      ).toBe(10);
    });

    it('makes another address the default, which unsets the old one', async () => {
      const user = await customer();
      await savedAddress(user, 'البيت');
      const work = await savedAddress(user, 'العمل');

      const res = await http()
        .post(`/v1/customer/addresses/${work.id}/default`)
        .set(...bearer(user))
        .expect(200);

      expect((res.body as AddressBody).isDefault).toBe(true);
      expect(await listed(user)).toEqual(['العمل*', 'البيت']);
    });

    it('leaves exactly one default after two default changes at the same moment', async () => {
      const user = await customer();
      await savedAddress(user, 'البيت');
      const work = await savedAddress(user, 'العمل');
      const parents = await savedAddress(user, 'بيت الأهل');
      const makeDefault = (id: string) =>
        http()
          .post(`/v1/customer/addresses/${id}/default`)
          .set(...bearer(user));

      const lock = await holdRowLock(prisma, 'users', user.principal.userId);
      let first!: ReturnType<typeof sent>;
      let second!: ReturnType<typeof sent>;
      try {
        first = sent(makeDefault(work.id));
        second = sent(makeDefault(parents.id));
        await lock.waitForWaiters(2, () => first.done && second.done);
      } finally {
        await lock.release();
      }

      expect((await first.response).status).toBe(200);
      expect((await second.response).status).toBe(200);
      expect(
        (await addressesOf(user)).filter((each) => each.isDefault),
      ).toHaveLength(1);
    });

    it('promotes the newest remaining address when the default is deleted', async () => {
      const user = await customer();
      const home = await savedAddress(user, 'البيت');
      await savedAddress(user, 'العمل');
      await savedAddress(user, 'بيت الأهل');

      await http()
        .delete(`/v1/customer/addresses/${home.id}`)
        .set(...bearer(user))
        .expect(204);

      expect(await listed(user)).toEqual(['بيت الأهل*', 'العمل']);
    });

    it('changes the fields sent; null clears a readable field; the default stays', async () => {
      const user = await customer();
      const home = (
        await saveAddress(user, {
          city: 'الرياض',
          street: 'طريق الملك فهد',
        }).expect(201)
      ).body as AddressBody;

      const res = await http()
        .patch(`/v1/customer/addresses/${home.id}`)
        .set(...bearer(user))
        .send({ label: 'الفيلا', city: null, building: 'مبنى 12' })
        .expect(200);

      expect(res.body).toMatchObject({
        label: 'الفيلا',
        city: null,
        street: 'طريق الملك فهد',
        building: 'مبنى 12',
        isDefault: true,
      });
      expect(
        (
          await http()
            .get(`/v1/customer/addresses/${home.id}`)
            .set(...bearer(user))
            .expect(200)
        ).body,
      ).toMatchObject({ label: 'الفيلا' });
    });

    it("answers another customer's address with NOT_FOUND, changing nothing", async () => {
      const owner = await customer('owner');
      const stranger = await customer('stranger');
      const theirs = await savedAddress(owner, 'البيت');
      const path = `/v1/customer/addresses/${theirs.id}`;

      const responses = [
        await http()
          .get(path)
          .set(...bearer(stranger)),
        await http()
          .patch(path)
          .set(...bearer(stranger))
          .send({ label: 'لي' }),
        await http()
          .post(`${path}/default`)
          .set(...bearer(stranger)),
        await http()
          .delete(path)
          .set(...bearer(stranger)),
      ];

      for (const res of responses) {
        expect(res.status).toBe(404);
        expect(errorOf(res).code).toBe('NOT_FOUND');
      }
      expect(await listed(owner)).toEqual(['البيت*']);
    });

    it('needs a token', async () => {
      await http().get('/v1/customer/addresses').expect(401);
    });
  });
});
