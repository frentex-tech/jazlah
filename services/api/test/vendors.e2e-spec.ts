import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CLOCK } from '@modules/auth/domain/ports/clock.port';
import { createHttpApp } from './support/create-http-app';
import { TestClock } from './support/test-clock';
import {
  TEST_IBAN,
  VendorJourney,
  type TestUser,
} from './support/vendor-journey';

/** What the API answers for an application (dates as JSON strings). */
type ApplicationBody = {
  id: string;
  status: string;
  ibanMasked: string;
  commercialRegistrationNumber: string;
  rejectionReason: string | null;
  documents: { kind: string; mediaId: string; url?: string }[];
};
type VendorBody = {
  id: string;
  status: string;
  commissionBasisPoints: number;
  ibanMasked: string | null;
  logoUrl: string | null;
  name: { ar: string; en: string };
  description: { ar: string | null; en: string | null };
};
type Page<T> = { items: T[]; nextCursor: string | null };

const IBAN_DIGITS = TEST_IBAN.replace(/\s/g, '');
const errorCode = (body: unknown): string => (body as ErrorResponseBody).code;

/**
 * Vendors end to end: applications, review, vendor management, the vendor's profile and
 * the public pages, against the real application and database, with the fake sms and
 * storage providers and a clock the tests move. Each test has its own phones, so
 * nothing is shared between tests.
 */
describe('Vendors (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let journey: VendorJourney;
  const clock = new TestClock();

  beforeAll(async () => {
    app = await createHttpApp({
      overrides: [
        { provide: SMS_PORTS, useValue: [new FakeSmsProvider()] },
        { provide: STORAGE_PORT, useValue: new FakeStorageProvider() },
        { provide: CLOCK, useValue: clock },
      ],
    });
    prisma = app.get(PrismaService);
    const [sms] = app.get<FakeSmsProvider[]>(SMS_PORTS);
    if (sms === undefined) {
      throw new Error('no fake sms provider');
    }
    journey = new VendorJourney(app, sms, app.get(STORAGE_PORT));
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await journey.cleanUp();
    await app.close();
  });

  const bearer = (user: TestUser): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];

  describe('a customer applying', () => {
    it('applies, sees the application with the IBAN masked, and the documents attached', async () => {
      const customer = await journey.customer();
      const documents = await journey.documents(customer);

      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(journey.applicationBody(documents))
        .expect(201);
      const latest = await journey.http
        .get('/v1/customer/vendor-applications/latest')
        .set(...bearer(customer))
        .expect(200);

      const body = res.body as ApplicationBody;
      expect(body).toMatchObject({
        status: 'pending',
        ibanMasked: 'SA** **** **** **** **** 7519',
        commercialRegistrationNumber: '1010123456',
        rejectionReason: null,
      });
      expect(body.documents).toHaveLength(3);
      expect(latest.body).toEqual(res.body);
      expect(JSON.stringify([res.body, latest.body])).not.toContain(
        IBAN_DIGITS,
      );
      const row = await prisma.vendorApplication.findUnique({
        where: { id: body.id },
      });
      expect(row?.ibanEncrypted).not.toContain(IBAN_DIGITS);
    });

    it('refuses an invalid IBAN, a missing document kind and a malformed body with VALIDATION_FAILED', async () => {
      const customer = await journey.customer();
      const documents = await journey.documents(customer);
      const send = (body: Record<string, unknown>) =>
        journey.http
          .post('/v1/customer/vendor-applications')
          .set(...bearer(customer))
          .send(body)
          .expect(400);

      const badIban = await send(
        journey.applicationBody(documents, {
          iban: 'SA04 8000 0000 6080 1016 7519',
        }),
      );
      const missingKind = await send(
        journey.applicationBody(documents.slice(0, 2)),
      );
      const badLocation = await send(
        journey.applicationBody(documents, {
          location: { latitude: 91, longitude: 46 },
        }),
      );

      expect(badIban.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'iban', constraints: ['isSaudiIban'] }],
      });
      expect(JSON.stringify(badIban.body)).not.toContain('8000');
      expect(errorCode(missingKind.body)).toBe('VALIDATION_FAILED');
      expect(badLocation.body).toMatchObject({
        details: [{ field: 'location.latitude' }],
      });
    });

    it('refuses a second pending application with VENDOR_APPLICATION_ALREADY_PENDING', async () => {
      const { customer } = await journey.pendingApplication();

      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(journey.applicationBody(await journey.documents(customer)))
        .expect(409);

      expect(errorCode(res.body)).toBe('VENDOR_APPLICATION_ALREADY_PENDING');
    });

    it("refuses another customer's documents exactly like missing ones", async () => {
      const other = await journey.customer('other');
      const theirs = await journey.documents(other);
      const customer = await journey.customer();
      const mine = await journey.documents(customer);
      const send = (documents: { kind: string; mediaId: string }[]) =>
        journey.http
          .post('/v1/customer/vendor-applications')
          .set(...bearer(customer))
          .send(journey.applicationBody(documents))
          .expect(404);

      const [, , theirPhoto] = theirs;
      if (theirPhoto === undefined) {
        throw new Error('no document');
      }
      const stolen = await send([...mine.slice(0, 2), theirPhoto]);
      const random = await send([
        ...mine.slice(0, 2),
        { kind: 'facility_photo', mediaId: randomUUID() },
      ]);

      expect(errorCode(stolen.body)).toBe('MEDIA_NOT_FOUND');
      expect(errorCode(random.body)).toBe('MEDIA_NOT_FOUND');
    });

    it('answers NOT_FOUND for the latest application of someone who never applied', async () => {
      const customer = await journey.customer();

      const res = await journey.http
        .get('/v1/customer/vendor-applications/latest')
        .set(...bearer(customer))
        .expect(404);

      expect(errorCode(res.body)).toBe('NOT_FOUND');
    });

    it.each([
      ['post', '/v1/customer/vendor-applications'],
      ['get', '/v1/customer/vendor-applications/latest'],
    ] as const)(
      '%s %s: 401 without a token, 403 with an admin token',
      async (method, path) => {
        const admin = await journey.admin();

        const none = await journey.http[method](path).expect(401);
        const wrong = await journey.http[method](path)
          .set(...bearer(admin))
          .expect(403);

        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      },
    );
  });

  describe('an admin reviewing applications', () => {
    it('lists and reads applications, with a link to each document', async () => {
      const { applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();

      const list = await journey.http
        .get('/v1/admin/vendor-applications?status=pending&limit=50')
        .set(...bearer(admin))
        .expect(200);
      const detail = await journey.http
        .get(`/v1/admin/vendor-applications/${applicationId}`)
        .set(...bearer(admin))
        .expect(200);

      const page = list.body as Page<ApplicationBody>;
      expect(page.items.every((item) => item.status === 'pending')).toBe(true);
      const body = detail.body as ApplicationBody;
      expect(body.id).toBe(applicationId);
      expect(
        body.documents.every((document) => typeof document.url === 'string'),
      ).toBe(true);
    });

    it('pages the list with the opaque cursor, and refuses a cursor it did not write', async () => {
      await journey.pendingApplication('first');
      await journey.pendingApplication('second');
      const admin = await journey.admin();

      const first = await journey.http
        .get('/v1/admin/vendor-applications?limit=1')
        .set(...bearer(admin))
        .expect(200);
      const cursor = (first.body as Page<ApplicationBody>).nextCursor;
      const second = await journey.http
        .get('/v1/admin/vendor-applications')
        .query({ limit: 1, cursor })
        .set(...bearer(admin))
        .expect(200);
      const foreign = await journey.http
        .get('/v1/admin/vendor-applications?cursor=abc')
        .set(...bearer(admin))
        .expect(400);
      const tooMany = await journey.http
        .get('/v1/admin/vendor-applications?limit=51')
        .set(...bearer(admin))
        .expect(400);

      expect(cursor).not.toBeNull();
      expect((second.body as Page<ApplicationBody>).items[0]?.id).not.toBe(
        (first.body as Page<ApplicationBody>).items[0]?.id,
      );
      expect(foreign.body).toMatchObject({ details: [{ field: 'cursor' }] });
      expect(tooMany.body).toMatchObject({ details: [{ field: 'limit' }] });
    });

    it('approves: the vendor exists, the applicant signs in as it, the review is final', async () => {
      const { customer, applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();

      const res = await journey.http
        .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1250 })
        .expect(200);
      const again = await journey.http
        .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1250 })
        .expect(409);
      const vendor = await journey.signIn(customer.phone, 'vendor');
      const audit = await prisma.auditLog.findMany({
        where: { entityId: applicationId },
      });

      const body = res.body as VendorBody;
      expect(body).toMatchObject({
        status: 'active',
        commissionBasisPoints: 1250,
        ibanMasked: 'SA** **** **** **** **** 7519',
      });
      expect(errorCode(again.body)).toBe('VENDOR_APPLICATION_NOT_PENDING');
      await journey.http
        .get('/v1/vendor/profile')
        .set(...bearer(vendor))
        .expect(200);
      expect(audit.map((entry) => entry.action)).toEqual([
        'vendors.application.approved',
      ]);
    });

    it('two approvals at once create one vendor', async () => {
      const { applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();
      const approve = () =>
        journey.http
          .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
          .set(...bearer(admin))
          .send({ commissionBasisPoints: 1000 });

      const responses = await Promise.all([approve(), approve()]);

      expect(responses.map((res) => res.status).sort()).toEqual([200, 409]);
      expect(responses.find((res) => res.status === 409)?.body).toMatchObject({
        code: 'VENDOR_APPLICATION_NOT_PENDING',
      });
      expect(await prisma.vendor.count({ where: { applicationId } })).toBe(1);
      expect(
        await prisma.vendorCommissionChange.count({
          where: { vendor: { applicationId } },
        }),
      ).toBe(1);
    });

    it('rejects with a reason the applicant sees, who may then apply again', async () => {
      const { customer, applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();

      await journey.http
        .post(`/v1/admin/vendor-applications/${applicationId}/reject`)
        .set(...bearer(admin))
        .send({ reason: 'السجل التجاري منتهي' })
        .expect(200);
      const latest = await journey.http
        .get('/v1/customer/vendor-applications/latest')
        .set(...bearer(customer))
        .expect(200);
      await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(journey.applicationBody(await journey.documents(customer)))
        .expect(201);

      expect(latest.body).toMatchObject({
        status: 'rejected',
        rejectionReason: 'السجل التجاري منتهي',
      });
    });

    it('refuses unknown applications, malformed ids and invalid bodies', async () => {
      const { applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();
      const post = (path: string, body: Record<string, unknown>) =>
        journey.http
          .post(path)
          .set(...bearer(admin))
          .send(body);

      const unknown = await post(
        `/v1/admin/vendor-applications/${randomUUID()}/approve`,
        { commissionBasisPoints: 1000 },
      ).expect(404);
      const badId = await post('/v1/admin/vendor-applications/nope/approve', {
        commissionBasisPoints: 1000,
      }).expect(400);
      const badCommission = await post(
        `/v1/admin/vendor-applications/${applicationId}/approve`,
        { commissionBasisPoints: 10_001 },
      ).expect(400);
      const noReason = await post(
        `/v1/admin/vendor-applications/${applicationId}/reject`,
        { reason: '   ' },
      ).expect(400);

      expect(errorCode(unknown.body)).toBe('NOT_FOUND');
      expect(badId.body).toMatchObject({ details: [{ field: 'id' }] });
      expect(badCommission.body).toMatchObject({
        details: [{ field: 'commissionBasisPoints' }],
      });
      expect(noReason.body).toMatchObject({ details: [{ field: 'reason' }] });
    });
  });

  describe('an admin managing vendors', () => {
    it('lists and reads vendors, changes the commission and reads its history', async () => {
      const { vendorId, admin } = await journey.approvedVendor();

      const list = await journey.http
        .get('/v1/admin/vendors?status=active&limit=50')
        .set(...bearer(admin))
        .expect(200);
      await journey.http
        .put(`/v1/admin/vendors/${vendorId}/commission`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1500 })
        .expect(200);
      const detail = await journey.http
        .get(`/v1/admin/vendors/${vendorId}`)
        .set(...bearer(admin))
        .expect(200);
      const history = await journey.http
        .get(`/v1/admin/vendors/${vendorId}/commission-history`)
        .set(...bearer(admin))
        .expect(200);

      expect(
        (list.body as Page<VendorBody>).items.every(
          (v) => v.status === 'active',
        ),
      ).toBe(true);
      expect((detail.body as VendorBody).commissionBasisPoints).toBe(1500);
      expect(
        (
          history.body as Page<{
            commissionBasisPoints: number;
            previousCommissionBasisPoints: number | null;
          }>
        ).items.map((entry) => [
          entry.commissionBasisPoints,
          entry.previousCommissionBasisPoints,
        ]),
      ).toEqual([
        [1500, 1250],
        [1250, null],
      ]);
    });

    it('suspends: the vendor is refused at once, at sign-in and on refresh; reinstated, it signs in again', async () => {
      const { vendorId, owner, admin } = await journey.approvedVendor();

      await journey.http
        .post(`/v1/admin/vendors/${vendorId}/suspend`)
        .set(...bearer(admin))
        .send({ reason: 'شكاوى متكررة' })
        .expect(200);
      const atOnce = await journey.http
        .get('/v1/vendor/profile')
        .set(...bearer(owner))
        .expect(403);
      const refresh = await journey.refresh(owner.refreshToken).expect(403);
      clock.advanceSeconds(61);
      const signIn = await journey.verify(owner.phone, 'vendor');
      const twice = await journey.http
        .post(`/v1/admin/vendors/${vendorId}/suspend`)
        .set(...bearer(admin))
        .send({ reason: 'again' })
        .expect(409);
      await journey.http
        .post(`/v1/admin/vendors/${vendorId}/reinstate`)
        .set(...bearer(admin))
        .expect(200);
      clock.advanceSeconds(61);
      const back = await journey.signIn(owner.phone, 'vendor');

      expect(errorCode(atOnce.body)).toBe('VENDOR_SUSPENDED');
      expect(errorCode(refresh.body)).toBe('VENDOR_SUSPENDED');
      expect(signIn.status).toBe(403);
      expect(errorCode(signIn.body)).toBe('VENDOR_SUSPENDED');
      expect(twice.body).toMatchObject({
        code: 'CONFLICT',
        details: { reason: 'VENDOR_ALREADY_SUSPENDED' },
      });
      await journey.http
        .get('/v1/vendor/profile')
        .set(...bearer(back))
        .expect(200);
      expect(
        (
          await prisma.auditLog.findMany({
            where: { entityId: vendorId },
            orderBy: { createdAt: 'asc' },
          })
        ).map((entry) => entry.action),
      ).toEqual(['vendors.vendor.suspended', 'vendors.vendor.reinstated']);
    });

    it('refuses unknown vendors, malformed ids and invalid bodies', async () => {
      const { vendorId, admin } = await journey.approvedVendor();
      const id = randomUUID();

      const unknown = await Promise.all([
        journey.http.get(`/v1/admin/vendors/${id}`).set(...bearer(admin)),
        journey.http
          .post(`/v1/admin/vendors/${id}/suspend`)
          .set(...bearer(admin))
          .send({ reason: 'r' }),
        journey.http
          .post(`/v1/admin/vendors/${id}/reinstate`)
          .set(...bearer(admin)),
        journey.http
          .put(`/v1/admin/vendors/${id}/commission`)
          .set(...bearer(admin))
          .send({ commissionBasisPoints: 1000 }),
        journey.http
          .get(`/v1/admin/vendors/${id}/commission-history`)
          .set(...bearer(admin)),
      ]);
      const active = await journey.http
        .post(`/v1/admin/vendors/${vendorId}/reinstate`)
        .set(...bearer(admin))
        .expect(409);
      const badCommission = await journey.http
        .put(`/v1/admin/vendors/${vendorId}/commission`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 12.5 })
        .expect(400);
      const badStatus = await journey.http
        .get('/v1/admin/vendors?status=closed')
        .set(...bearer(admin))
        .expect(400);

      expect(unknown.map((res) => [res.status, errorCode(res.body)])).toEqual(
        Array.from({ length: 5 }, () => [404, 'NOT_FOUND']),
      );
      expect(active.body).toMatchObject({
        details: { reason: 'VENDOR_NOT_SUSPENDED' },
      });
      expect(badCommission.body).toMatchObject({
        details: [{ field: 'commissionBasisPoints' }],
      });
      expect(badStatus.body).toMatchObject({ details: [{ field: 'status' }] });
    });

    it.each([
      ['get', '/v1/admin/vendor-applications'],
      ['get', `/v1/admin/vendor-applications/${randomUUID()}`],
      ['post', `/v1/admin/vendor-applications/${randomUUID()}/approve`],
      ['post', `/v1/admin/vendor-applications/${randomUUID()}/reject`],
      ['get', '/v1/admin/vendors'],
      ['get', `/v1/admin/vendors/${randomUUID()}`],
      ['post', `/v1/admin/vendors/${randomUUID()}/suspend`],
      ['post', `/v1/admin/vendors/${randomUUID()}/reinstate`],
      ['put', `/v1/admin/vendors/${randomUUID()}/commission`],
      ['get', `/v1/admin/vendors/${randomUUID()}/commission-history`],
    ] as const)(
      '%s %s: 401 without a token, 403 with a customer token',
      async (method, path) => {
        const customer = await journey.customer();

        const none = await journey.http[method](path).expect(401);
        const wrong = await journey.http[method](path)
          .set(...bearer(customer))
          .expect(403);

        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      },
    );
  });

  describe('a vendor and its profile', () => {
    it('reads its profile and sets its logo and descriptions, which the public page shows', async () => {
      const { vendorId, owner } = await journey.approvedVendor();
      const logo = await journey.uploadedFile(
        owner,
        'vendor',
        'vendor.logo',
        'png',
      );

      const read = await journey.http
        .get('/v1/vendor/profile')
        .set(...bearer(owner))
        .expect(200);
      const updated = await journey.http
        .patch('/v1/vendor/profile')
        .set(...bearer(owner))
        .send({ logoMediaId: logo, description: { en: 'Fresh daily' } })
        .expect(200);
      const publicPage = await journey.http
        .get(`/v1/public/vendors/${vendorId}`)
        .expect(200);

      expect((read.body as VendorBody).id).toBe(vendorId);
      expect(updated.body).toMatchObject({
        description: { ar: 'لحوم بلدية', en: 'Fresh daily' },
      });
      expect((updated.body as VendorBody).logoUrl).toEqual(expect.any(String));
      expect(publicPage.body).toEqual({
        id: vendorId,
        name: { ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery' },
        description: { ar: 'لحوم بلدية', en: 'Fresh daily' },
        logoUrl: (updated.body as VendorBody).logoUrl,
      });
    });

    it("gets the same 404 for vendor A's files as for a random id, on every vendor endpoint", async () => {
      const a = await journey.approvedVendor('vendor-a');
      const b = await journey.approvedVendor('vendor-b');
      const aLogo = await journey.uploadedFile(
        a.owner,
        'vendor',
        'vendor.logo',
        'png',
      );
      const random = randomUUID();
      const patch = (logoMediaId: string) =>
        journey.http
          .patch('/v1/vendor/profile')
          .set(...bearer(b.owner))
          .send({ logoMediaId });
      const confirm = (mediaId: string) =>
        journey.http
          .post(`/v1/vendor/media/${mediaId}/confirm`)
          .set(...bearer(b.owner));

      const answers = await Promise.all([
        patch(aLogo),
        patch(random),
        confirm(aLogo),
        confirm(random),
      ]);

      const shapes = answers.map((res) => [res.status, errorCode(res.body)]);
      expect(shapes).toEqual([
        [404, 'MEDIA_NOT_FOUND'],
        [404, 'MEDIA_NOT_FOUND'],
        [404, 'MEDIA_NOT_FOUND'],
        [404, 'MEDIA_NOT_FOUND'],
      ]);
      const profile = await journey.http
        .get('/v1/vendor/profile')
        .set(...bearer(b.owner))
        .expect(200);
      expect((profile.body as VendorBody).id).toBe(b.vendorId);
      expect((profile.body as VendorBody).logoUrl).toBeNull();
    });

    it('refuses an invalid body', async () => {
      const { owner } = await journey.approvedVendor();

      const res = await journey.http
        .patch('/v1/vendor/profile')
        .set(...bearer(owner))
        .send({ logoMediaId: 'nope', extra: true })
        .expect(400);

      expect(errorCode(res.body)).toBe('VALIDATION_FAILED');
    });

    it.each([
      ['get', '/v1/vendor/profile'],
      ['patch', '/v1/vendor/profile'],
    ] as const)(
      '%s %s: 401 without a token, 403 with a customer token',
      async (method, path) => {
        const customer = await journey.customer();

        const none = await journey.http[method](path).expect(401);
        const wrong = await journey.http[method](path)
          .set(...bearer(customer))
          .expect(403);

        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      },
    );
  });

  describe('the public vendor pages', () => {
    it('list and show active vendors only, in both languages', async () => {
      const { vendorId, admin } = await journey.approvedVendor();

      const before = await journey.http
        .get('/v1/public/vendors?limit=50')
        .expect(200);
      await journey.http
        .post(`/v1/admin/vendors/${vendorId}/suspend`)
        .set(...bearer(admin))
        .send({ reason: 'r' })
        .expect(200);
      const after = await journey.http
        .get('/v1/public/vendors?limit=50')
        .expect(200);
      const suspended = await journey.http
        .get(`/v1/public/vendors/${vendorId}`)
        .expect(404);
      const random = await journey.http
        .get(`/v1/public/vendors/${randomUUID()}`)
        .expect(404);

      const ids = (res: { body: unknown }) =>
        (res.body as Page<VendorBody>).items.map((vendor) => vendor.id);
      expect(ids(before)).toContain(vendorId);
      expect(ids(after)).not.toContain(vendorId);
      const shape = (res: { body: unknown }) => {
        const { code, message } = res.body as ErrorResponseBody;
        return { code, message };
      };
      expect(shape(suspended)).toEqual(shape(random));
      expect(errorCode(suspended.body)).toBe('NOT_FOUND');
    });

    it('refuses a malformed id and a foreign cursor', async () => {
      const badId = await journey.http
        .get('/v1/public/vendors/nope')
        .expect(400);
      const badCursor = await journey.http
        .get('/v1/public/vendors?cursor=abc')
        .expect(400);

      expect(badId.body).toMatchObject({ details: [{ field: 'id' }] });
      expect(badCursor.body).toMatchObject({ details: [{ field: 'cursor' }] });
    });
  });
});
