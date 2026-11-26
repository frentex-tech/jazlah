import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import type { OperationsSettings as OperationsSettingsRow } from '@infra/database/generated/prisma/client';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { UsersService } from '@modules/users';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import { testPhone } from './support/test-phone';

/**
 * The operations settings (SCH-API-1). The settings are one row shared by every suite:
 * this is the only suite that changes them, it puts every value back after each test,
 * and it pauses ordering only between two consecutive requests.
 */
describe('Operations settings (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let customer: SignedInBody;
  let admin: SignedInBody;
  let saved: OperationsSettingsRow;
  const phones: string[] = [];

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    app = await createHttpApp({
      overrides: [{ provide: SMS_PORTS, useValue: [sms] }],
    });
    prisma = app.get(PrismaService);
    const auth = new AuthClient(app, sms);
    const customerPhone = testPhone('settings-customer');
    const adminPhone = testPhone('settings-admin');
    phones.push(customerPhone, adminPhone);
    customer = await auth.signIn(customerPhone);
    await app.get(UsersService).grantAdminAccess(adminPhone);
    admin = await auth.signIn(adminPhone, 'admin');
    saved = await prisma.operationsSettings.findUniqueOrThrow({
      where: { singleton: true },
    });
  });

  afterEach(async () => {
    // The JSON columns go back as the JSON text they were read as.
    await prisma.$executeRaw`
      UPDATE "operations_settings" SET
        "delivery_window_start" = ${saved.deliveryWindowStart},
        "delivery_window_end" = ${saved.deliveryWindowEnd},
        "cutoffs" = ${JSON.stringify(saved.cutoffs)}::jsonb,
        "default_orders_per_day" = ${saved.defaultOrdersPerDay},
        "default_carcasses_per_day" = ${saved.defaultCarcassesPerDay},
        "cod_enabled" = ${saved.codEnabled},
        "cod_max_order_halalas" = ${saved.codMaxOrderHalalas},
        "cod_allowed_order_types" = ${saved.codAllowedOrderTypes},
        "cod_confirmation" = ${saved.codConfirmation},
        "booking_horizon_days" = ${saved.bookingHorizonDays},
        "min_order_halalas" = ${saved.minOrderHalalas},
        "delivery_fee_halalas" = ${saved.deliveryFeeHalalas},
        "complaint_window_hours" = ${saved.complaintWindowHours},
        "closed_days" = ${JSON.stringify(saved.closedDays)}::jsonb,
        "is_paused" = ${saved.isPaused},
        "pause_message_ar" = ${saved.pauseMessageAr},
        "pause_message_en" = ${saved.pauseMessageEn}
      WHERE "singleton"`;
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
    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
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
  const patch = (body: object) =>
    http()
      .patch('/v1/admin/settings/operations')
      .set(...token(admin))
      .send(body);

  it('answers the saved settings to an admin, and the apps’ part to anyone', async () => {
    const full = await http()
      .get('/v1/admin/settings/operations')
      .set(...token(admin))
      .expect(200);
    const client = await http().get('/v1/public/settings/client').expect(200);

    expect(full.body).toMatchObject({
      deliveryWindow: {
        start: saved.deliveryWindowStart,
        end: saved.deliveryWindowEnd,
      },
      cutoffs: { readyMeat: { leadDays: expect.any(Number) as number } },
      defaultCapacity: { ordersPerDay: saved.defaultOrdersPerDay },
      cod: { enabled: saved.codEnabled, confirmation: saved.codConfirmation },
      bookingHorizonDays: saved.bookingHorizonDays,
      paused: { isPaused: false, messageAr: null, messageEn: null },
    });
    expect(client.body).toEqual({
      deliveryWindow: {
        start: saved.deliveryWindowStart,
        end: saved.deliveryWindowEnd,
      },
      bookingHorizonDays: saved.bookingHorizonDays,
      minOrderHalalas: saved.minOrderHalalas,
      deliveryFeeHalalas: saved.deliveryFeeHalalas,
      codEnabled: saved.codEnabled,
      codMaxOrderHalalas: saved.codMaxOrderHalalas,
      paused: { isPaused: false, messageAr: null, messageEn: null },
    });
  });

  it('keeps the admin settings from callers without a token and from customers', async () => {
    const unsigned = await http()
      .get('/v1/admin/settings/operations')
      .expect(401);
    const asCustomer = await http()
      .patch('/v1/admin/settings/operations')
      .set(...token(customer))
      .send({ minOrderHalalas: 1 })
      .expect(403);

    expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
    expect(codeOf(asCustomer.body)).toBe('FORBIDDEN');
  });

  it('changes only the keys sent, audits it, and the apps see it on the next request', async () => {
    const res = await patch({
      minOrderHalalas: 12_345,
      cod: {
        enabled: true,
        maxOrderHalalas: 99_900,
        allowedOrderTypes: ['ready_meat'],
        confirmation: 'auto',
      },
    }).expect(200);
    const client = await http().get('/v1/public/settings/client').expect(200);
    const audit = await prisma.auditLog.findFirst({
      where: {
        actorId: admin.principal.userId,
        action: 'settings.operations.updated',
      },
    });

    expect(res.body).toMatchObject({
      minOrderHalalas: 12_345,
      deliveryFeeHalalas: saved.deliveryFeeHalalas,
      bookingHorizonDays: saved.bookingHorizonDays,
      cod: { maxOrderHalalas: 99_900, confirmation: 'auto' },
    });
    expect(client.body).toMatchObject({
      minOrderHalalas: 12_345,
      codMaxOrderHalalas: 99_900,
    });
    expect(audit?.metadata).toEqual({ keys: 'cod,minOrderHalalas' });
  });

  it('refuses a window that ends before it starts, and changes nothing', async () => {
    const res = await patch({
      minOrderHalalas: 1,
      deliveryWindow: { start: '22:00', end: '16:00' },
    }).expect(400);
    const row = await prisma.operationsSettings.findUniqueOrThrow({
      where: { singleton: true },
    });

    expect(res.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [
        { field: 'deliveryWindow.end', constraints: ['endBeforeStart'] },
      ],
    });
    expect(row.minOrderHalalas).toBe(saved.minOrderHalalas);
  });

  it('refuses null for a key that cannot be null, and a value out of range', async () => {
    const res = await patch({ minOrderHalalas: null, cod: null }).expect(400);
    const range = await patch({ bookingHorizonDays: 61 }).expect(400);

    expect(codeOf(res.body)).toBe('VALIDATION_FAILED');
    expect(range.body).toMatchObject({
      details: [{ field: 'bookingHorizonDays' }],
    });
  });

  it('saves closed days in date order and refuses a new past day or a repeated one', async () => {
    const day = (date: string) => ({
      date,
      scope: 'both',
      reasonAr: 'إجازة',
      reasonEn: 'Holiday',
    });
    const ok = await patch({
      closedDays: [day('2099-12-02'), day('2099-12-01')],
    }).expect(200);
    const refused = await patch({
      closedDays: [day('2020-01-01'), day('2099-12-01'), day('2099-12-01')],
    }).expect(400);

    expect(
      (ok.body as { closedDays: { date: string }[] }).closedDays.map(
        (closed) => closed.date,
      ),
    ).toEqual(['2099-12-01', '2099-12-02']);
    expect(refused.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [
        { field: 'closedDays.0.date', constraints: ['notPast'] },
        { field: 'closedDays.2.date', constraints: ['isNotRepeated'] },
      ],
    });
  });

  it('keeps a past closed day already saved when the list is sent again', async () => {
    await prisma.operationsSettings.update({
      where: { singleton: true },
      data: {
        closedDays: [
          {
            date: '2020-01-01',
            scope: 'both',
            reasonAr: 'إجازة',
            reasonEn: 'Holiday',
          },
        ],
      },
    });

    await patch({
      closedDays: [
        {
          date: '2020-01-01',
          scope: 'both',
          reasonAr: 'إجازة',
          reasonEn: 'Holiday',
        },
      ],
    }).expect(200);
  });

  it('reads the saved closed days only once it holds the row (row lock)', async () => {
    const pastDay = {
      date: '2020-01-01',
      scope: 'both',
      reasonAr: 'إجازة',
      reasonEn: 'Holiday',
    };
    let locked!: () => void;
    const holding = new Promise<void>((resolve) => {
      locked = resolve;
    });
    let finish!: () => void;
    const finishing = new Promise<void>((resolve) => {
      finish = resolve;
    });
    // Another writer holds the row and, before committing, saves the past day.
    const writer = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT "id" FROM "operations_settings" WHERE "singleton" FOR UPDATE`;
        locked();
        await finishing;
        await tx.$executeRaw`
          UPDATE "operations_settings"
          SET "closed_days" = ${JSON.stringify([pastDay])}::jsonb
          WHERE "singleton"`;
      },
      { timeout: 20_000 },
    );
    await holding;
    let answered = false;
    const sent = patch({ closedDays: [pastDay] }).then((res) => {
      answered = true;
      return res;
    });
    // The request waits behind the lock (or, without one, answers at once).
    const deadline = Date.now() + 10_000;
    for (;;) {
      const [row] = await prisma.$queryRaw<{ waiting: number }[]>`
        SELECT count(*)::int AS "waiting" FROM pg_stat_activity
        WHERE "wait_event_type" = 'Lock' AND "query" ILIKE '%operations_settings%'`;
      if ((row?.waiting ?? 0) >= 1 || answered || Date.now() > deadline) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    finish();
    await writer;
    const res = await sent;

    // With the lock it read the writer's list, where the past day is already saved.
    expect(res.status).toBe(200);
  });

  it('pauses with both messages, shows the pause to the apps, and resumes', async () => {
    const missing = await http()
      .put('/v1/admin/settings/operations/pause')
      .set(...token(admin))
      .send({ isPaused: true, messageAr: 'متوقف' })
      .expect(400);
    const paused = await http()
      .put('/v1/admin/settings/operations/pause')
      .set(...token(admin))
      .send({
        isPaused: true,
        messageAr: 'نعتذر، الطلبات متوقفة مؤقتًا',
        messageEn: 'Ordering is paused for now.',
      })
      .expect(200);
    const client = await http().get('/v1/public/settings/client').expect(200);
    const resumed = await http()
      .put('/v1/admin/settings/operations/pause')
      .set(...token(admin))
      .send({ isPaused: false, messageAr: 'ignored' })
      .expect(200);

    expect(missing.body).toMatchObject({
      details: [{ field: 'messageEn' }],
    });
    expect(paused.body).toMatchObject({
      paused: { isPaused: true, messageEn: 'Ordering is paused for now.' },
    });
    expect(client.body).toMatchObject({ paused: { isPaused: true } });
    expect(resumed.body).toMatchObject({
      paused: { isPaused: false, messageAr: null, messageEn: null },
    });
  });
});
