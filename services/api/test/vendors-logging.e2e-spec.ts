import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { createHttpApp } from './support/create-http-app';
import { LogCapture } from './support/log-capture';
import { TEST_IBAN, VendorJourney } from './support/vendor-journey';

/** The IBAN's characters without the spaces people type, and its account part alone. */
const IBAN = TEST_IBAN.replace(/\s/g, '');
const ACCOUNT = IBAN.slice(8);

/**
 * No IBAN in any log line or response, through a whole vendor journey: applying (also
 * with an invalid IBAN), approving, reading. One application per file reads its logs
 * (nestjs-pino keeps one root logger per process).
 */
describe('IBANs never reach the logs or the responses (e2e)', () => {
  let app: INestApplication<App>;
  let journey: VendorJourney;
  const capture = new LogCapture();

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    const storage = new FakeStorageProvider();
    app = await createHttpApp({
      logDestination: capture.stream,
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

  it('keeps the IBAN out of every log line and every response', async () => {
    const customer = await journey.customer();
    const documents = await journey.documents(customer);
    const bodies: unknown[] = [];

    // First check that the IBAN is really in what the API received.
    const sent = journey.applicationBody(documents);
    expect(JSON.stringify(sent)).toContain('8000 0000 6080');
    const invalid = await journey.http
      .post('/v1/customer/vendor-applications')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send(
        journey.applicationBody(documents, {
          iban: 'SA04 8000 0000 6080 1016 7519',
        }),
      )
      .expect(400);
    const created = await journey.http
      .post('/v1/customer/vendor-applications')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send(sent)
      .expect(201);
    const applicationId = (created.body as { id: string }).id;
    const admin = await journey.admin();
    const approved = await journey.http
      .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ commissionBasisPoints: 1000 })
      .expect(200);
    const vendorId = (approved.body as { id: string }).id;
    bodies.push(invalid.body, created.body, approved.body);
    for (const path of ['/v1/customer/vendor-applications/latest']) {
      bodies.push(
        (
          await journey.http
            .get(path)
            .set('Authorization', `Bearer ${customer.accessToken}`)
            .expect(200)
        ).body,
      );
    }
    for (const path of [
      `/v1/admin/vendor-applications/${applicationId}`,
      '/v1/admin/vendor-applications',
      `/v1/admin/vendors/${vendorId}`,
      '/v1/admin/vendors',
    ]) {
      bodies.push(
        (
          await journey.http
            .get(path)
            .set('Authorization', `Bearer ${admin.accessToken}`)
            .expect(200)
        ).body,
      );
    }
    const owner = await journey.signIn(customer.phone, 'vendor');
    bodies.push(
      (
        await journey.http
          .get('/v1/vendor/profile')
          .set('Authorization', `Bearer ${owner.accessToken}`)
          .expect(200)
      ).body,
    );

    const responses = JSON.stringify(bodies);
    expect(responses).toContain('SA** **** **** **** **** 7519');
    expect(capture.lines.length).toBeGreaterThan(0);
    for (const text of [responses, capture.text()]) {
      expect(text).not.toContain(IBAN);
      expect(text).not.toContain(ACCOUNT);
      expect(text).not.toContain('8000 0000 6080');
    }
  });
});
