import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { createHttpApp } from './support/create-http-app';
import { VendorJourney, type TestUser } from './support/vendor-journey';

const errorCode = (body: unknown): string => (body as ErrorResponseBody).code;

/**
 * The upload endpoints of each audience: each accepts only its own purposes, and a file
 * can be confirmed only by the user who requested it. The storage is the fake provider.
 */
describe('Media upload endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let journey: VendorJourney;

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    const storage = new FakeStorageProvider();
    app = await createHttpApp({
      overrides: [
        { provide: SMS_PORTS, useValue: [sms] },
        { provide: STORAGE_PORT, useValue: storage },
      ],
    });
    journey = new VendorJourney(app, sms, storage);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await journey.cleanUp();
    await app.close();
  });

  const requestUpload = (
    user: TestUser,
    audience: string,
    body: Record<string, unknown>,
  ) =>
    journey.http
      .post(`/v1/${audience}/media/uploads`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(body);

  it('lets a customer upload and confirm an application document', async () => {
    const customer = await journey.customer();

    const mediaId = await journey.uploadedFile(
      customer,
      'customer',
      'vendor.document',
      'pdf',
    );

    expect(mediaId).toEqual(expect.any(String));
  });

  it('lets an admin upload and confirm a vendor logo', async () => {
    const admin = await journey.admin();

    await expect(
      journey.uploadedFile(admin, 'admin', 'vendor.logo', 'png'),
    ).resolves.toEqual(expect.any(String));
  });

  it('refuses a purpose that is not the audience’s own as invalid input', async () => {
    const customer = await journey.customer();
    const admin = await journey.admin();

    const logo = await requestUpload(customer, 'customer', {
      purpose: 'vendor.logo',
      contentType: 'image/png',
    }).expect(400);
    const product = await requestUpload(customer, 'customer', {
      purpose: 'catalog.product-image',
      contentType: 'image/png',
    }).expect(400);
    const adminDocument = await requestUpload(admin, 'admin', {
      purpose: 'vendor.document',
      contentType: 'application/pdf',
    }).expect(400);
    const badType = await requestUpload(customer, 'customer', {
      purpose: 'vendor.document',
      contentType: 'video/mp4',
    }).expect(415);

    for (const res of [logo, product, adminDocument]) {
      expect(res.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'purpose' }],
      });
    }
    expect(errorCode(badType.body)).toBe('MEDIA_CONTENT_TYPE_NOT_ALLOWED');
  });

  it("refuses to confirm someone else's file exactly like a missing one", async () => {
    const owner = await journey.customer('owner');
    const stranger = await journey.customer('stranger');
    const ticket = (
      await requestUpload(owner, 'customer', {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      }).expect(201)
    ).body as { mediaId: string };
    const confirm = (mediaId: string) =>
      journey.http
        .post(`/v1/customer/media/${mediaId}/confirm`)
        .set('Authorization', `Bearer ${stranger.accessToken}`)
        .expect(404);

    const theirs = await confirm(ticket.mediaId);
    const random = await confirm(randomUUID());

    expect(errorCode(theirs.body)).toBe('MEDIA_NOT_FOUND');
    expect(errorCode(random.body)).toBe('MEDIA_NOT_FOUND');
  });

  it('refuses a malformed id', async () => {
    const customer = await journey.customer();

    const res = await journey.http
      .post('/v1/customer/media/nope/confirm')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .expect(400);

    expect(res.body).toMatchObject({ details: [{ field: 'id' }] });
  });

  it.each([
    ['customer', 'admin'],
    ['vendor', 'customer'],
    ['admin', 'customer'],
  ] as const)(
    '%s media endpoints: 401 without a token, 403 with a %s token',
    async (audience, other) => {
      const user =
        other === 'admin' ? await journey.admin() : await journey.customer();
      const paths = [
        `/v1/${audience}/media/uploads`,
        `/v1/${audience}/media/${randomUUID()}/confirm`,
      ];

      for (const path of paths) {
        const none = await journey.http.post(path).expect(401);
        const wrong = await journey.http
          .post(path)
          .set('Authorization', `Bearer ${user.accessToken}`)
          .expect(403);
        expect(errorCode(none.body)).toBe('UNAUTHORIZED');
        expect(errorCode(wrong.body)).toBe('FORBIDDEN');
      }
    },
  );
});
