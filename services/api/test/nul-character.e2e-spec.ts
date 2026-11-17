import type { INestApplication } from '@nestjs/common';
import request, { type Response } from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import { testPhone } from './support/test-phone';

/** The status and body of a response, compared whole so a failure shows both. */
const answer = (res: Response) => ({
  status: res.status,
  body: res.body as unknown,
});

/** A VALIDATION_FAILED answer naming `field` with the NUL constraint. */
const refusedNul = (field: string) => ({
  status: 400,
  body: expect.objectContaining({
    code: 'VALIDATION_FAILED',
    details: [{ field, constraints: ['hasNoNulCharacter'] }],
  }) as unknown,
});

/**
 * A NUL character (`\u0000`) in any string input: PostgreSQL cannot store one in a text
 * column, so it must be refused as invalid input before it reaches a query, in a body,
 * a nested body field, a query parameter and a path parameter alike.
 */
describe('A NUL character in input (e2e)', () => {
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

  async function customer(): Promise<SignedInBody> {
    const phone = testPhone();
    phones.push(phone);
    return auth.signIn(phone);
  }

  it('refuses it in a body field, and stores nothing', async () => {
    const user = await customer();

    const res = await http()
      .patch('/v1/customer/profile')
      .set(...bearer(user))
      .send({ fullName: 'سارة\u0000 القحطاني' });

    expect(answer(res)).toEqual(refusedNul('fullName'));
    expect(
      await prisma.customerProfile.count({
        where: { user: { phone: phones.at(-1) } },
      }),
    ).toBe(0);
  });

  it('refuses it in a field of a new record', async () => {
    const user = await customer();

    const res = await http()
      .post('/v1/customer/addresses')
      .set(...bearer(user))
      .send({
        label: 'البيت',
        location: { latitude: 24.7136, longitude: 46.6753 },
        street: 'طريق الملك فهد\u0000',
      });

    expect(answer(res)).toEqual(refusedNul('street'));
  });

  it('refuses it in a query parameter', async () => {
    const res = await http().get('/v1/public/products?cursor=%00');

    expect(answer(res)).toEqual(refusedNul('cursor'));
  });

  it('refuses it in a path parameter', async () => {
    const res = await http().get('/v1/public/vendors/%00');

    expect(answer(res)).toEqual(refusedNul('id'));
  });
});
