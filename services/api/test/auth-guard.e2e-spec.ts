import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { RouteAudienceCheck } from '@common/guards/route-audience.check';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { AuthClient } from './support/auth-client';
import { AUTH_PROBE_LIMIT } from './support/auth-probe.constants';
import { AuthProbeController } from './support/auth-probe.controller';
import { createHttpApp } from './support/create-http-app';
import { testPhone } from './support/test-phone';

const LIMITED_URL = '/v1/customer/auth-probe/limited';

/** The global authentication guard on the real application. */
describe('Authentication guard (e2e)', () => {
  let app: INestApplication<App>;
  let client: AuthClient;
  const phones: string[] = [];

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    app = await createHttpApp({
      controllers: [AuthProbeController],
      overrides: [{ provide: SMS_PORTS, useValue: [sms] }],
    });
    client = new AuthClient(app, sms);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    const prisma = app.get(PrismaService);
    await prisma.otpChallenge.deleteMany({ where: { phone: { in: phones } } });
    await prisma.user.deleteMany({ where: { phone: { in: phones } } });
    await app.close();
  });

  it.each(['customer', 'vendor', 'kitchen', 'admin'])(
    'refuses a %s route without a token with UNAUTHORIZED, in the standard shape',
    async (audience) => {
      const res = await client.me(audience).expect(401);

      const body = res.body as ErrorResponseBody;
      expect(Object.keys(body).sort()).toEqual([
        'code',
        'message',
        'requestId',
      ]);
      expect(body.code).toBe('UNAUTHORIZED');
    },
  );

  it('refuses a token that is not ours with UNAUTHORIZED', async () => {
    const res = await client.me('customer', 'not.a.token').expect(401);

    expect((res.body as ErrorResponseBody).code).toBe('UNAUTHORIZED');
  });

  it('refuses a customer token on every other audience with FORBIDDEN', async () => {
    const phone = testPhone();
    phones.push(phone);
    const { accessToken } = await client.signIn(phone);

    await client.me('customer', accessToken).expect(200);
    for (const audience of ['vendor', 'kitchen', 'admin']) {
      const res = await client.me(audience, accessToken).expect(403);
      expect((res.body as ErrorResponseBody).code).toBe('FORBIDDEN');
    }
  });

  it('leaves the health checks and the public prefix open, with or without a token', async () => {
    await request(app.getHttpServer()).get('/v1/health').expect(200);
    await request(app.getHttpServer())
      .get('/v1/health')
      .set('Authorization', 'Bearer not.a.token')
      .expect(200);
    await request(app.getHttpServer()).get('/v1/health/ready').expect(200);
    // A public route reached with a bad token is judged on its own terms (here: the body).
    await request(app.getHttpServer())
      .post('/v1/public/auth/refresh')
      .set('Authorization', 'Bearer not.a.token')
      .send({})
      .expect(400);
  });

  it('runs after the rate limit: bad tokens are counted, and end in 429 instead of 401 forever', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < AUTH_PROBE_LIMIT.limit + 1; i += 1) {
      const res = await request(app.getHttpServer())
        .get(LIMITED_URL)
        .set('Authorization', 'Bearer not.a.token');
      statuses.push(res.status);
    }

    expect(statuses).toEqual([401, 401, 429]);
  });

  it('has the startup check that refuses an endpoint with neither an audience prefix nor @Public()', () => {
    // What the check refuses is proven in src/common/guards/route-audience.check.spec.ts,
    // on an application that fails to start. Here: the real application runs it, and
    // started, so every one of its endpoints has an audience or is marked public.
    expect(app.get(RouteAudienceCheck, { strict: false })).toBeInstanceOf(
      RouteAudienceCheck,
    );
  });
});
