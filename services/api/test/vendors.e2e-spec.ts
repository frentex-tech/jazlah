import { testRegistrationNumber } from './support/test-registration-number';
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
import { CreatePlatformVendorUseCase } from '@modules/vendors/application/create-platform-vendor.use-case';
import { createHttpApp } from './support/create-http-app';
import { holdRowLock } from './support/row-lock';
import { sent, type SentRequest } from './support/sent-request';
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
    it('refuses a commercial registration number a vendor holds (VENDOR_CR_EXISTS), at submission and at approval', async () => {
      const number = testRegistrationNumber();
      const waiting = await journey.pendingApplication('second', {
        commercialRegistrationNumber: number,
      });
      const { admin } = await journey.approvedVendor('first', {
        commercialRegistrationNumber: number,
      });
      const late = await journey.customer('late');

      const submitted = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(late))
        .send(
          journey.applicationBody(await journey.documents(late), {
            commercialRegistrationNumber: number,
          }),
        )
        .expect(409);
      const approved = await journey.http
        .post(`/v1/admin/vendor-applications/${waiting.applicationId}/approve`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1250 })
        .expect(409);
      const stillPending = await journey.http
        .get('/v1/customer/vendor-applications/latest')
        .set(...bearer(waiting.customer))
        .expect(200);

      expect(submitted.body).toMatchObject({ code: 'VENDOR_CR_EXISTS' });
      expect(approved.body).toMatchObject({ code: 'VENDOR_CR_EXISTS' });
      expect(stillPending.body).toMatchObject({ status: 'pending' });
    });

    it('applies, sees the application with the IBAN masked, and the documents attached', async () => {
      const customer = await journey.customer();
      const documents = await journey.documents(customer);

      const sent = journey.applicationBody(documents);
      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(sent)
        .expect(201);
      const latest = await journey.http
        .get('/v1/customer/vendor-applications/latest')
        .set(...bearer(customer))
        .expect(200);

      const body = res.body as ApplicationBody;
      expect(body).toMatchObject({
        status: 'pending',
        ibanMasked: 'SA** **** **** **** **** 7519',
        // The Arabic-Indic digits sent, stored as Latin ones.
        commercialRegistrationNumber: String(
          sent.commercialRegistrationNumber,
        ).replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)),
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

    it('refuses an invalid IBAN, a missing document kind and a malformed or missing field with VALIDATION_FAILED', async () => {
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
      const textLocation = await send(
        journey.applicationBody(documents, {
          location: { latitude: '24.7', longitude: '46.6' },
        }),
      );
      const noLocation = await send(
        journey.applicationBody(documents, { location: undefined }),
      );
      const noName = await send(
        journey.applicationBody(documents, { name: undefined }),
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
      expect(textLocation.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [
          { field: 'location.latitude' },
          { field: 'location.longitude' },
        ],
      });
      expect(noLocation.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'location', constraints: ['isDefined'] }],
      });
      expect(noName.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'name', constraints: ['isDefined'] }],
      });
      const noCity = await send(
        journey.applicationBody(documents, { city: undefined }),
      );
      const shortCity = await send(
        journey.applicationBody(documents, { city: ' ج‏ ' }),
      );
      const badVat = await send(
        journey.applicationBody(documents, { vatNumber: '210123456700003' }),
      );
      expect(noCity.body).toMatchObject({ details: [{ field: 'city' }] });
      expect(shortCity.body).toMatchObject({
        details: [{ field: 'city', constraints: ['charLength'] }],
      });
      expect(badVat.body).toMatchObject({
        details: [{ field: 'vatNumber', constraints: ['matches'] }],
      });
    });

    it('accepts the optional document kinds and a VAT number, which approval copies to the vendor with the city', async () => {
      const customer = await journey.customer();
      const documents = await journey.documents(customer);
      for (const kind of ['municipality_licence', 'national_id']) {
        documents.push({
          kind,
          mediaId: await journey.uploadedFile(
            customer,
            'customer',
            'vendor.document',
            'pdf',
          ),
        });
      }

      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(
          journey.applicationBody(documents, {
            vatNumber: '٣١٠١٢٣٤٥٦٧٠٠٠٠٣',
          }),
        )
        .expect(201);
      const admin = await journey.admin();
      const approved = await journey.http
        .post(
          `/v1/admin/vendor-applications/${(res.body as ApplicationBody).id}/approve`,
        )
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1000 })
        .expect(200);

      expect(res.body).toMatchObject({
        vatNumber: '310123456700003',
        city: 'الرياض',
      });
      expect(
        (res.body as ApplicationBody).documents
          .map((document) => document.kind)
          .sort(),
      ).toEqual([
        'commercial_registration',
        'facility_photo',
        'health_certificate',
        'municipality_licence',
        'national_id',
      ]);
      expect(approved.body).toMatchObject({
        vatNumber: '310123456700003',
        city: 'الرياض',
        contactPhone: null,
        contactEmail: null,
        coverUrl: null,
      });
    });

    it('still refuses an application missing a required kind, even with the optional ones', async () => {
      const customer = await journey.customer();
      const documents = (await journey.documents(customer)).slice(1);
      for (const kind of ['municipality_licence', 'national_id']) {
        documents.push({
          kind,
          mediaId: await journey.uploadedFile(
            customer,
            'customer',
            'vendor.document',
            'pdf',
          ),
        });
      }

      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(journey.applicationBody(documents))
        .expect(400);

      expect(res.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [
          { field: 'documents', constraints: ['requiresEachDocumentKind'] },
        ],
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

    it('refuses an applicant who already works for a vendor with VENDOR_ACCESS_ALREADY_HELD', async () => {
      const { customer, applicationId } = await journey.pendingApplication();
      const admin = await journey.admin();
      await journey.http
        .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
        .set(...bearer(admin))
        .send({ commissionBasisPoints: 1000 })
        .expect(200);
      const documents = await journey.documents(customer);
      const before = await prisma.vendorApplication.count({
        where: { applicantId: customer.userId },
      });

      const res = await journey.http
        .post('/v1/customer/vendor-applications')
        .set(...bearer(customer))
        .send(journey.applicationBody(documents))
        .expect(409);

      expect(errorCode(res.body)).toBe('VENDOR_ACCESS_ALREADY_HELD');
      expect(
        await prisma.vendorApplication.count({
          where: { applicantId: customer.userId },
        }),
      ).toBe(before);
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

  describe("the applicant's account deleted", () => {
    const deleteAccount = (user: TestUser) =>
      journey.http.delete('/v1/customer/me').set(...bearer(user));

    it('removes a pending application, and marks its documents for the media cleanup', async () => {
      const { customer, applicationId } = await journey.pendingApplication();
      const documentIds = (
        await prisma.vendorApplicationDocument.findMany({
          where: { applicationId },
          select: { mediaId: true },
        })
      ).map((document) => document.mediaId);

      await deleteAccount(customer).expect(204);

      expect(
        await prisma.vendorApplication.count({ where: { id: applicationId } }),
      ).toBe(0);
      expect(
        await prisma.media.findMany({
          where: { id: { in: documentIds } },
          select: { status: true, rejectionReason: true },
        }),
      ).toEqual(
        documentIds.map(() => ({
          status: 'rejected',
          rejectionReason: 'OWNER_DELETED',
        })),
      );
    });

    it('stores no application on the account when the submission waits on its deletion', async () => {
      const customer = await journey.customer('deleted-while-applying');
      const documents = await journey.documents(customer);
      const session = await prisma.authSession.findFirst({
        where: { userId: customer.userId },
        select: { id: true },
      });
      if (session === null) {
        throw new Error('the signed-in customer has no session');
      }
      // The deletion locks the user row FOR UPDATE, erases the applicant data, then
      // deletes the sessions: holding the session row pauses it there, with the user
      // row locked. The submission then queues behind the user lock (holdLive, FOR
      // SHARE) and, once the deletion commits, finds the user deleted.
      // Without holdLive the submission reads the user as live (a plain read does not
      // wait), its INSERT's foreign key check waits for the deletion's FOR UPDATE, and
      // then succeeds on the tombstoned row: an application stored on the deleted
      // account, and this test fails on the count below.
      const lock = await holdRowLock(prisma, 'auth_sessions', session.id);
      let deletion!: SentRequest;
      let submission!: SentRequest;
      try {
        deletion = sent(
          journey.http.delete('/v1/customer/me').set(...bearer(customer)),
        );
        await lock.waitForWaiters(1, () => deletion.done);
        submission = sent(
          journey.http
            .post('/v1/customer/vendor-applications')
            .set(...bearer(customer))
            .send(journey.applicationBody(documents)),
        );
        await lock.waitForWaiters(2, () => deletion.done || submission.done);
      } finally {
        await lock.release();
      }
      const deleted = await deletion.response;
      const submitted = await submission.response;

      expect(deleted.status).toBe(204);
      expect(submitted.status).toBe(401);
      expect(errorCode(submitted.body)).toBe('UNAUTHORIZED');
      expect(
        await prisma.vendorApplication.count({
          where: { applicantId: customer.userId },
        }),
      ).toBe(0);
    });

    it("keeps an approved application and its documents: the vendor's business record", async () => {
      const { owner, applicationId, vendorId } = await journey.approvedVendor();
      await prisma.userAccess.updateMany({
        where: { userId: owner.userId },
        data: { deactivatedAt: new Date() },
      });
      clock.advanceSeconds(61);
      const customer = await journey.signIn(owner.phone, 'customer');

      await deleteAccount(customer).expect(204);

      const application = await prisma.vendorApplication.findUniqueOrThrow({
        where: { id: applicationId },
        include: { documents: { include: { media: true } } },
      });
      expect(application.status).toBe('approved');
      expect(
        application.documents.map((document) => document.media.status),
      ).toEqual(application.documents.map(() => 'ready'));
      expect(await prisma.vendor.count({ where: { id: vendorId } })).toBe(1);
    });
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
      ['patch', `/v1/admin/vendors/${randomUUID()}/profile`],
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

  describe('an admin setting a vendor profile', () => {
    it("puts the admin's uploaded logo and a description on the platform vendor, audited", async () => {
      const admin = await journey.admin();
      const { vendor } = await app
        .get(CreatePlatformVendorUseCase, { strict: false })
        .execute();
      try {
        const logo = await journey.uploadedFile(
          admin,
          'admin',
          'vendor.logo',
          'png',
        );

        const updated = await journey.http
          .patch(`/v1/admin/vendors/${vendor.id}/profile`)
          .set(...bearer(admin))
          .send({
            logoMediaId: logo,
            description: { ar: 'ذبائح جزلة', en: 'Jazla cuts' },
          })
          .expect(200);
        const publicPage = await journey.http
          .get(`/v1/public/vendors/${vendor.id}`)
          .expect(200);

        expect(updated.body).toMatchObject({
          id: vendor.id,
          description: { ar: 'ذبائح جزلة', en: 'Jazla cuts' },
        });
        expect((updated.body as VendorBody).logoUrl).toEqual(
          expect.any(String),
        );
        expect(publicPage.body).toMatchObject({
          id: vendor.id,
          description: { ar: 'ذبائح جزلة', en: 'Jazla cuts' },
          logoUrl: (updated.body as VendorBody).logoUrl,
        });
        expect(
          await prisma.auditLog.findMany({
            where: {
              entityId: vendor.id,
              action: 'vendors.vendor.profile_updated',
            },
            select: { actorId: true, metadata: true },
          }),
        ).toEqual([
          {
            actorId: admin.userId,
            metadata: { fields: 'descriptionAr,descriptionEn,logoMediaId' },
          },
        ]);
      } finally {
        // The platform vendor is unique and other suites (the catalog's JAZLA products)
        // use it at the same time: keep it, and undo only what this test changed.
        await prisma.auditLog.deleteMany({
          where: {
            entityId: vendor.id,
            action: 'vendors.vendor.profile_updated',
          },
        });
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { logoMediaId: null, descriptionAr: null, descriptionEn: null },
        });
      }
    });

    it('refuses invalid input, unknown vendors and a logo the admin did not upload', async () => {
      const { vendorId, owner, admin } = await journey.approvedVendor();
      const ownersLogo = await journey.uploadedFile(
        owner,
        'vendor',
        'vendor.logo',
        'png',
      );
      const patch = (path: string, body: Record<string, unknown>) =>
        journey.http
          .patch(path)
          .set(...bearer(admin))
          .send(body);

      const malformedId = await patch('/v1/admin/vendors/nope/profile', {
        description: { en: 'x' },
      }).expect(400);
      const nullDescription = await patch(
        `/v1/admin/vendors/${vendorId}/profile`,
        { description: null },
      ).expect(400);
      const badLogo = await patch(`/v1/admin/vendors/${vendorId}/profile`, {
        logoMediaId: 'nope',
      }).expect(400);
      const unknown = await patch(`/v1/admin/vendors/${randomUUID()}/profile`, {
        description: { en: 'x' },
      }).expect(404);
      const notTheirs = await patch(`/v1/admin/vendors/${vendorId}/profile`, {
        logoMediaId: ownersLogo,
      }).expect(404);

      expect(malformedId.body).toMatchObject({ details: [{ field: 'id' }] });
      expect(nullDescription.body).toMatchObject({
        details: [{ field: 'description' }],
      });
      expect(badLogo.body).toMatchObject({
        details: [{ field: 'logoMediaId' }],
      });
      expect(errorCode(unknown.body)).toBe('NOT_FOUND');
      expect(errorCode(notTheirs.body)).toBe('MEDIA_NOT_FOUND');
    });

    it('refuses a vendor token with 403', async () => {
      const { vendorId, owner } = await journey.approvedVendor();

      const res = await journey.http
        .patch(`/v1/admin/vendors/${vendorId}/profile`)
        .set(...bearer(owner))
        .send({ description: { en: 'mine' } })
        .expect(403);

      expect(errorCode(res.body)).toBe('FORBIDDEN');
    });

    it("sets a vendor's city, contact details, VAT number and cover, audited; refuses a null city", async () => {
      const { vendorId, admin } = await journey.approvedVendor();
      const cover = await journey.uploadedFile(
        admin,
        'admin',
        'vendor.cover',
        'png',
      );
      const patch = (body: Record<string, unknown>) =>
        journey.http
          .patch(`/v1/admin/vendors/${vendorId}/profile`)
          .set(...bearer(admin))
          .send(body);

      const updated = await patch({
        city: ' جدة‏ ',
        coverMediaId: cover,
        contactPhone: '+966 50 123 4567',
        contactEmail: 'Owner@Example.com',
        vatNumber: '310123456700003',
      }).expect(200);
      const nullCity = await patch({ city: null }).expect(400);
      const publicPage = await journey.http
        .get(`/v1/public/vendors/${vendorId}`)
        .expect(200);

      expect(updated.body).toMatchObject({
        city: 'جدة',
        contactPhone: '+966501234567',
        contactEmail: 'owner@example.com',
        vatNumber: '310123456700003',
      });
      expect((updated.body as { coverUrl: unknown }).coverUrl).toEqual(
        expect.any(String),
      );
      expect(nullCity.body).toMatchObject({ details: [{ field: 'city' }] });
      expect(publicPage.body).toMatchObject({ city: 'جدة' });
      expect(
        await prisma.auditLog.findMany({
          where: {
            entityId: vendorId,
            action: 'vendors.vendor.profile_updated',
          },
          select: { metadata: true },
        }),
      ).toEqual([
        {
          metadata: {
            fields: 'city,contactEmail,contactPhone,coverMediaId,vatNumber',
          },
        },
      ]);
    });
  });

  describe('an admin searching vendors and applications', () => {
    /** Names, a CR number and a city no other test or suite uses. */
    function unique() {
      const token = randomUUID().slice(0, 8);
      const digits = String(
        Number.parseInt(randomUUID().replace(/-/g, '').slice(0, 12), 16),
      )
        .padStart(10, '7')
        .slice(-10);
      return { token, digits, city: `مدينة ${token}` };
    }
    const ids = (res: { body: unknown }) =>
      (res.body as Page<{ id: string }>).items.map((item) => item.id);

    it('finds vendors by either name in any case, by CR number in Arabic digits, by city, with the status', async () => {
      const { token, digits, city } = unique();
      const { vendorId, admin } = await journey.approvedVendor('searched', {
        name: { ar: `ملحمة ${token}`, en: `Butchery ${token}` },
        commercialRegistrationNumber: digits,
        city,
      });
      const list = (query: Record<string, string>) =>
        journey.http
          .get('/v1/admin/vendors')
          .query(query)
          .set(...bearer(admin))
          .expect(200);
      const arabicDigits = digits
        .slice(2, 8)
        .replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)] ?? digit);

      expect(ids(await list({ q: `ملحمة ${token}` }))).toEqual([vendorId]);
      expect(
        ids(await list({ q: ` BUTCHERY ${token.toUpperCase()} ` })),
      ).toEqual([vendorId]);
      expect(ids(await list({ q: arabicDigits }))).toContain(vendorId);
      expect(ids(await list({ city }))).toEqual([vendorId]);
      expect(ids(await list({ city, status: 'active' }))).toEqual([vendorId]);
      expect(ids(await list({ q: token, status: 'suspended' }))).toEqual([]);
      expect(ids(await list({ q: token, city: 'الرياض' }))).toEqual([]);
    });

    it('takes % and _ literally, and pages the matches', async () => {
      const { token, digits } = unique();
      const literal = await journey.approvedVendor('literal', {
        name: { ar: `عرض ${token}`, en: `Deal ${token} 50%_off` },
        commercialRegistrationNumber: digits,
      });
      const lookalike = await journey.approvedVendor('lookalike', {
        name: { ar: `عرض ${token} آخر`, en: `Deal ${token} 50xyoff` },
        commercialRegistrationNumber: unique().digits,
      });
      const admin = literal.admin;
      const list = (query: Record<string, string>) =>
        journey.http
          .get('/v1/admin/vendors')
          .query(query)
          .set(...bearer(admin))
          .expect(200);

      expect(ids(await list({ q: `${token} 50%_` }))).toEqual([
        literal.vendorId,
      ]);
      const first = await list({ q: `Deal ${token}`, limit: '1' });
      const second = await list({
        q: `Deal ${token}`,
        limit: '1',
        cursor: (first.body as Page<unknown>).nextCursor ?? '',
      });
      expect([...ids(first), ...ids(second)]).toEqual([
        lookalike.vendorId,
        literal.vendorId,
      ]);
      expect((second.body as Page<unknown>).nextCursor).toBeNull();
    });

    it('finds applications by name or CR number, with the status', async () => {
      const { token, digits } = unique();
      const { applicationId } = await journey.pendingApplication('searched', {
        name: { ar: `مذبح ${token}`, en: `Abattoir ${token}` },
        commercialRegistrationNumber: digits,
      });
      const admin = await journey.admin();
      const list = (query: Record<string, string>) =>
        journey.http
          .get('/v1/admin/vendor-applications')
          .query(query)
          .set(...bearer(admin))
          .expect(200);

      expect(ids(await list({ q: `abattoir ${token}` }))).toEqual([
        applicationId,
      ]);
      expect(
        ids(await list({ q: `مذبح ${token}`, status: 'pending' })),
      ).toEqual([applicationId]);
      expect(ids(await list({ q: digits }))).toContain(applicationId);
      expect(ids(await list({ q: token, status: 'approved' }))).toEqual([]);
    });

    it('refuses a q shorter than 2 or longer than 100 characters', async () => {
      const admin = await journey.admin();

      const short = await journey.http
        .get('/v1/admin/vendors?q=%20a%20')
        .set(...bearer(admin))
        .expect(400);
      const long = await journey.http
        .get('/v1/admin/vendor-applications')
        .query({ q: 'x'.repeat(101) })
        .set(...bearer(admin))
        .expect(400);

      expect(short.body).toMatchObject({ details: [{ field: 'q' }] });
      expect(long.body).toMatchObject({ details: [{ field: 'q' }] });
    });
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
      const nullDescription = await journey.http
        .patch('/v1/vendor/profile')
        .set(...bearer(owner))
        .send({ description: null })
        .expect(400);
      expect(nullDescription.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'description' }],
      });
      expect(publicPage.body).toEqual({
        id: vendorId,
        name: { ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery' },
        description: { ar: 'لحوم بلدية', en: 'Fresh daily' },
        logoUrl: (updated.body as VendorBody).logoUrl,
        coverUrl: null,
        city: 'الرياض',
      });
    });

    it('sets its cover, contact phone (a landline), email and VAT number; the public page shows the cover and city only', async () => {
      const { vendorId, owner } = await journey.approvedVendor();
      const cover = await journey.uploadedFile(
        owner,
        'vendor',
        'vendor.cover',
        'png',
      );

      const updated = await journey.http
        .patch('/v1/vendor/profile')
        .set(...bearer(owner))
        .send({
          coverMediaId: cover,
          contactPhone: '٠١١ ٢٣٤ ٥٦٧٨',
          contactEmail: ' Shop@Example.COM ',
          vatNumber: '٣١٠١٢٣٤٥٦٧٠٠٠٠٣',
        })
        .expect(200);
      const publicPage = await journey.http
        .get(`/v1/public/vendors/${vendorId}`)
        .expect(200);

      expect(updated.body).toMatchObject({
        contactPhone: '+966112345678',
        contactEmail: 'shop@example.com',
        vatNumber: '310123456700003',
        city: 'الرياض',
      });
      expect((updated.body as { coverUrl: unknown }).coverUrl).toEqual(
        expect.any(String),
      );
      expect(publicPage.body).toMatchObject({
        coverUrl: (updated.body as { coverUrl: string }).coverUrl,
        city: 'الرياض',
      });
      expect(Object.keys(publicPage.body as object).sort()).toEqual([
        'city',
        'coverUrl',
        'description',
        'id',
        'logoUrl',
        'name',
      ]);

      const cleared = await journey.http
        .patch('/v1/vendor/profile')
        .set(...bearer(owner))
        .send({
          coverMediaId: null,
          contactPhone: null,
          contactEmail: null,
          vatNumber: null,
        })
        .expect(200);
      expect(cleared.body).toMatchObject({
        coverUrl: null,
        contactPhone: null,
        contactEmail: null,
        vatNumber: null,
      });
    });

    it('refuses a city, a malformed phone, email or VAT number, and a logo as the cover', async () => {
      const { owner } = await journey.approvedVendor();
      const logo = await journey.uploadedFile(
        owner,
        'vendor',
        'vendor.logo',
        'png',
      );
      const patch = (body: Record<string, unknown>) =>
        journey.http
          .patch('/v1/vendor/profile')
          .set(...bearer(owner))
          .send(body);

      const answers = await Promise.all([
        patch({ city: 'جدة' }),
        patch({ contactPhone: '0152345678' }),
        patch({ contactEmail: 'not-an-email' }),
        patch({ vatNumber: '310123456700004' }),
        patch({ coverMediaId: logo }),
      ]);

      expect(answers.map((res) => [res.status, errorCode(res.body)])).toEqual([
        [400, 'VALIDATION_FAILED'],
        [400, 'VALIDATION_FAILED'],
        [400, 'VALIDATION_FAILED'],
        [400, 'VALIDATION_FAILED'],
        [404, 'MEDIA_NOT_FOUND'],
      ]);
      expect(answers[1]?.body).toMatchObject({
        details: [
          { field: 'contactPhone', constraints: ['isSaudiPhoneNumber'] },
        ],
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
