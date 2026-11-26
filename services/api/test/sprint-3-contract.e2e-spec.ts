import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { UsersService } from '@modules/users';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import { testPhone } from './support/test-phone';

const ID = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

/**
 * The Sprint 3 contract routes before their tasks land: each needs its audience's
 * token, validates its input, and answers NOT_IMPLEMENTED (501) naming its task.
 * Each task replaces its rows here with its own e2e tests.
 */
describe('Sprint 3 contract (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customer: SignedInBody;
  let admin: SignedInBody;
  const phones: string[] = [];

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    app = await createHttpApp({
      overrides: [{ provide: SMS_PORTS, useValue: [sms] }],
    });
    prisma = app.get(PrismaService);
    const auth = new AuthClient(app, sms);
    const customerPhone = testPhone('contract-customer');
    const adminPhone = testPhone('contract-admin');
    phones.push(customerPhone, adminPhone);
    customer = await auth.signIn(customerPhone);
    await app.get(UsersService).grantAdminAccess(adminPhone);
    admin = await auth.signIn(adminPhone, 'admin');
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
    await prisma.consentRecord.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const token = (user: SignedInBody): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];
  const codeOf = (body: unknown) => (body as ErrorResponseBody).code;

  it.each([
    ['customer', '/v1/customer/cart', 'CRT-API-1'],
    ['customer', '/v1/customer/checkout/days?method=delivery', 'SCH-API-2'],
    ['customer', '/v1/customer/checkout/payment-methods', 'PAY-API-1'],
    ['customer', '/v1/customer/orders?scope=current', 'ORD-API-3'],
    ['customer', `/v1/customer/orders/${ID}`, 'ORD-API-3'],
    ['customer', '/v1/customer/wallet', 'WAL-API-1'],
    ['admin', `/v1/admin/vendors/${ID}/capacity`, 'SCH-API-2'],
    ['admin', '/v1/admin/orders?status=new&paymentMethod=cod', 'ORD-API-3'],
    ['admin', '/v1/admin/coupons', 'CRT-API-3'],
    ['admin', `/v1/admin/customers/${ID}/wallet`, 'WAL-API-1'],
  ])('%s GET %s answers NOT_IMPLEMENTED for %s', async (who, path, task) => {
    const call = http().get(path);
    if (who !== 'public') {
      call.set(...token(who === 'admin' ? admin : customer));
    }
    const res = await call.expect(501);

    expect(res.body).toMatchObject({
      code: 'NOT_IMPLEMENTED',
      details: { task },
    });
  });

  // The Idempotency-Key header is checked by ORD-API-1 itself; the stub only names its task.
  it('places an order only with a token and a valid body', async () => {
    const unsigned = await http()
      .post('/v1/customer/orders')
      .send({ paymentMethod: 'mada' })
      .expect(401);
    const invalid = await http()
      .post('/v1/customer/orders')
      .set(...token(customer))
      .send({ paymentMethod: 'cash' })
      .expect(400);
    const stub = await http()
      .post('/v1/customer/orders')
      .set(...token(customer))
      .set('Idempotency-Key', ID)
      .send({ paymentMethod: 'mada', walletAmountHalalas: 0 })
      .expect(501);

    expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
    expect(invalid.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ field: 'paymentMethod' }],
    });
    expect(stub.body).toMatchObject({ details: { task: 'ORD-API-1' } });
  });

  it('refuses null for a coupon key that cannot be null (PATCH)', async () => {
    const coupon = await http()
      .patch(`/v1/admin/coupons/${ID}`)
      .set(...token(admin))
      .send({ code: null, isActive: null })
      .expect(400);

    expect(coupon.body).toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it.each(['/v1/vendor/orders', `/v1/vendor/orders/${ID}`])(
    'refuses GET %s without a vendor token',
    async (path) => {
      const unsigned = await http().get(path).expect(401);
      const asCustomer = await http()
        .get(path)
        .set(...token(customer))
        .expect(403);

      expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
      expect(codeOf(asCustomer.body)).toBe('FORBIDDEN');
    },
  );

  it('keeps admin routes from customers and takes webhooks without a token', async () => {
    const asCustomer = await http()
      .get('/v1/admin/coupons')
      .set(...token(customer))
      .expect(403);
    const webhook = await http()
      .post('/v1/webhooks/payments/fake')
      .send({})
      .expect(501);

    expect(codeOf(asCustomer.body)).toBe('FORBIDDEN');
    expect(webhook.body).toMatchObject({ details: { task: 'PAY-API-1' } });
  });
});
