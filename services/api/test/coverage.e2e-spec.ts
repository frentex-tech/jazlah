import type { INestApplication } from '@nestjs/common';
import request, { type Response } from 'supertest';
import type { App } from 'supertest/types';
import { loadEnv } from '@config/load-env';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { RedisService } from '@infra/redis/redis.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { COVERAGE_REDIS } from '@modules/coverage';
import { UsersService } from '@modules/users';
import { AuthClient, type SignedInBody } from './support/auth-client';
import { createHttpApp } from './support/create-http-app';
import { testPhone } from './support/test-phone';

/** A zone as the admin endpoints answer it (dates as JSON strings). */
type ZoneBody = {
  id: string;
  name: { ar: string; en: string };
  city: string;
  polygon: { type: 'Polygon'; coordinates: number[][][] };
  isActive: boolean;
};

type CheckBody = {
  covered: boolean;
  zone: { id: string; name: { ar: string; en: string }; city: string } | null;
};

const errorOf = (res: Response): ErrorResponseBody =>
  res.body as ErrorResponseBody;

/**
 * A square polygon 0.2 degrees wide whose south-west corner is (`latitude`,
 * `longitude`). Each test draws its zones in the empty south of the Rub' al Khali, at
 * latitudes no other test (or suite) uses, so tests never see each other's zones.
 */
function square(latitude: number, longitude = 50) {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [longitude, latitude],
        [longitude + 0.2, latitude],
        [longitude + 0.2, latitude + 0.2],
        [longitude, latitude + 0.2],
        [longitude, latitude],
      ],
    ],
  };
}

/** The point in the middle of square(latitude, longitude). */
const middleOf = (latitude: number, longitude = 50) => ({
  lat: latitude + 0.1,
  lng: longitude + 0.1,
});

/**
 * Coverage zones end to end: the admin endpoints (audited, behind the admin audience),
 * the public check against the cached active zones, its database fallback while the
 * cache's Redis never answers, and `isCovered` on saved addresses. Real database
 * (PostGIS) and Redis, the fake sms provider for sign-ins.
 */
describe('Coverage (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let auth: AuthClient;
  const phones: string[] = [];
  const zoneIds: string[] = [];

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
    await prisma.auditLog.deleteMany({ where: { entityId: { in: zoneIds } } });
    await prisma.coverageZone.deleteMany({ where: { id: { in: zoneIds } } });
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
  const bearer = (user: SignedInBody): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];

  async function admin(): Promise<SignedInBody> {
    const phone = testPhone('admin');
    phones.push(phone);
    await app.get(UsersService).grantAdminAccess(phone);
    return auth.signIn(phone, 'admin');
  }

  async function customer(): Promise<SignedInBody> {
    const phone = testPhone('customer');
    phones.push(phone);
    return auth.signIn(phone);
  }

  async function createZone(
    user: SignedInBody,
    body: Record<string, unknown>,
  ): Promise<ZoneBody> {
    const res = await http()
      .post('/v1/admin/coverage-zones')
      .set(...bearer(user))
      .send({
        name: { ar: 'منطقة تجربة', en: 'Test zone' },
        city: 'الرياض',
        ...body,
      })
      .expect(201);
    const zone = res.body as ZoneBody;
    zoneIds.push(zone.id);
    return zone;
  }

  async function check(
    point: { lat: number; lng: number },
    on: INestApplication<App> = app,
  ): Promise<CheckBody> {
    return (
      await request(on.getHttpServer())
        .get('/v1/public/coverage/check')
        .query(point)
        .expect(200)
    ).body as CheckBody;
  }

  describe('the coverage check', () => {
    it('answers covered inside an active zone, not covered outside, and ignores an inactive zone', async () => {
      const user = await admin();
      const active = await createZone(user, {
        name: { ar: 'الربع الخالي', en: 'Empty Quarter' },
        polygon: square(18),
      });
      await createZone(user, { polygon: square(18.4), isActive: false });

      expect(await check(middleOf(18))).toEqual({
        covered: true,
        zone: {
          id: active.id,
          name: { ar: 'الربع الخالي', en: 'Empty Quarter' },
          city: 'الرياض',
        },
      });
      expect(await check({ lat: 18.3, lng: 50.1 })).toEqual({
        covered: false,
        zone: null,
      });
      expect(await check(middleOf(18.4))).toEqual({
        covered: false,
        zone: null,
      });
    });

    it('follows every change at once: off, on, redrawn, deleted', async () => {
      const user = await admin();
      const zone = await createZone(user, { polygon: square(17) });
      const path = `/v1/admin/coverage-zones/${zone.id}`;
      expect((await check(middleOf(17))).covered).toBe(true);

      await http()
        .patch(path)
        .set(...bearer(user))
        .send({ isActive: false })
        .expect(200);
      expect((await check(middleOf(17))).covered).toBe(false);

      await http()
        .patch(path)
        .set(...bearer(user))
        .send({ isActive: true, polygon: square(17, 51) })
        .expect(200);
      expect((await check(middleOf(17))).covered).toBe(false);
      expect((await check(middleOf(17, 51))).covered).toBe(true);

      await http()
        .delete(path)
        .set(...bearer(user))
        .expect(204);
      expect((await check(middleOf(17, 51))).covered).toBe(false);
      expect(
        errorOf(
          await http()
            .delete(path)
            .set(...bearer(user)),
        ).code,
      ).toBe('NOT_FOUND');
    });

    it('answers from the database while the cache never answers', async () => {
      const user = await admin();
      const zone = await createZone(user, { polygon: square(16) });
      // The production client class, where nothing listens: never ready.
      const url = new URL(loadEnv().REDIS_URL);
      url.hostname = '127.0.0.1';
      url.port = '1';
      const redis = new RedisService({ url: url.toString() });
      const withoutCache = await createHttpApp({
        overrides: [{ provide: COVERAGE_REDIS, useValue: redis }],
      });
      try {
        expect(await check(middleOf(16), withoutCache)).toMatchObject({
          covered: true,
          zone: { id: zone.id },
        });
        expect(await check({ lat: 16.3, lng: 50.1 }, withoutCache)).toEqual({
          covered: false,
          zone: null,
        });
      } finally {
        await withoutCache.close();
        redis.disconnect();
      }
    });

    it.each([
      ['a latitude past 90', { lat: 91, lng: 50 }, 'lat'],
      ['no longitude', { lat: 20 }, 'lng'],
      ['a longitude that is not a number', { lat: 20, lng: 'east' }, 'lng'],
    ])('refuses %s with VALIDATION_FAILED', async (_, query, field) => {
      const res = await http()
        .get('/v1/public/coverage/check')
        .query(query)
        .expect(400);

      expect(errorOf(res).code).toBe('VALIDATION_FAILED');
      expect(JSON.stringify(errorOf(res).details)).toContain(field);
    });
  });

  describe('admin zones', () => {
    it('creates, reads, lists and renames a zone, GeoJSON in and out, each change audited', async () => {
      const user = await admin();
      const created = await createZone(user, {
        name: { ar: ' الغرب ', en: 'West' },
        city: '  الرياض ',
        polygon: square(15),
      });

      expect(created).toMatchObject({
        name: { ar: 'الغرب', en: 'West' },
        city: 'الرياض',
        polygon: square(15),
        isActive: true,
      });
      const path = `/v1/admin/coverage-zones/${created.id}`;
      expect(
        (
          await http()
            .get(path)
            .set(...bearer(user))
            .expect(200)
        ).body,
      ).toMatchObject({ id: created.id, polygon: square(15) });
      const page = (
        await http()
          .get('/v1/admin/coverage-zones?limit=50')
          .set(...bearer(user))
          .expect(200)
      ).body as { items: ZoneBody[]; nextCursor: string | null };
      expect(page.items.map((zone) => zone.id)).toContain(created.id);

      const renamed = await http()
        .patch(path)
        .set(...bearer(user))
        .send({ name: { ar: 'الغربية', en: 'Western' } })
        .expect(200);
      expect(renamed.body).toMatchObject({
        name: { ar: 'الغربية', en: 'Western' },
        city: 'الرياض',
        polygon: square(15),
      });

      const audit = await prisma.auditLog.findMany({
        where: { entityId: created.id },
        orderBy: { createdAt: 'asc' },
      });
      expect(audit.map((entry) => [entry.action, entry.actorId])).toEqual([
        ['coverage.zone.created', user.principal.userId],
        ['coverage.zone.updated', user.principal.userId],
      ]);
    });

    it.each([
      [
        'edges that cross (a bow tie)',
        {
          type: 'Polygon',
          coordinates: [
            [
              [50, 14],
              [50.2, 14.2],
              [50.2, 14],
              [50, 14.2],
              [50, 14],
            ],
          ],
        },
      ],
      [
        'a ring that is not closed',
        {
          type: 'Polygon',
          coordinates: [
            [
              [50, 14],
              [50.2, 14],
              [50.2, 14.2],
              [50, 14.2],
            ],
          ],
        },
      ],
      [
        'a position out of range',
        {
          type: 'Polygon',
          coordinates: [
            [
              [50, 14],
              [200, 14],
              [50.2, 14.2],
              [50, 14],
            ],
          ],
        },
      ],
    ])(
      'refuses %s with INVALID_POLYGON, saving nothing',
      async (_, polygon) => {
        const user = await admin();
        const before = await prisma.coverageZone.count();

        const res = await http()
          .post('/v1/admin/coverage-zones')
          .set(...bearer(user))
          .send({ name: { ar: 'خطأ', en: 'Broken' }, city: 'الرياض', polygon })
          .expect(422);

        expect(errorOf(res).code).toBe('INVALID_POLYGON');
        expect(await prisma.coverageZone.count()).toBe(before);
      },
    );

    it('refuses an invalid polygon in a change, keeping the zone as it was', async () => {
      const user = await admin();
      const zone = await createZone(user, { polygon: square(13) });

      const res = await http()
        .patch(`/v1/admin/coverage-zones/${zone.id}`)
        .set(...bearer(user))
        .send({
          name: { ar: 'جديد', en: 'New' },
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [50, 13],
                [50.2, 13.2],
                [50.2, 13],
                [50, 13.2],
                [50, 13],
              ],
            ],
          },
        })
        .expect(422);

      expect(errorOf(res).code).toBe('INVALID_POLYGON');
      expect(
        (
          await http()
            .get(`/v1/admin/coverage-zones/${zone.id}`)
            .set(...bearer(user))
            .expect(200)
        ).body,
      ).toMatchObject({ name: { en: 'Test zone' }, polygon: square(13) });
    });

    it('refuses a body without a city or polygon with VALIDATION_FAILED', async () => {
      const user = await admin();

      const res = await http()
        .post('/v1/admin/coverage-zones')
        .set(...bearer(user))
        .send({ name: { ar: 'ناقص', en: 'Missing' } })
        .expect(400);

      expect(errorOf(res).code).toBe('VALIDATION_FAILED');
    });

    it('answers NOT_FOUND for an unknown zone', async () => {
      const user = await admin();
      const path =
        '/v1/admin/coverage-zones/00000000-0000-4000-8000-000000000000';

      expect(
        errorOf(
          await http()
            .get(path)
            .set(...bearer(user)),
        ).code,
      ).toBe('NOT_FOUND');
      expect(
        errorOf(
          await http()
            .patch(path)
            .set(...bearer(user))
            .send({ isActive: false }),
        ).code,
      ).toBe('NOT_FOUND');
    });

    it('is for admins only', async () => {
      const user = await customer();

      await http().get('/v1/admin/coverage-zones').expect(401);
      const res = await http()
        .post('/v1/admin/coverage-zones')
        .set(...bearer(user))
        .send({
          name: { ar: 'لا', en: 'No' },
          city: 'الرياض',
          polygon: square(12),
        })
        .expect(403);
      expect(errorOf(res).code).toBe('FORBIDDEN');
    });
  });

  describe('saved addresses', () => {
    it('says whether each address is covered', async () => {
      const user = await admin();
      await createZone(user, { polygon: square(11) });
      const buyer = await customer();
      const save = (label: string, point: { lat: number; lng: number }) =>
        http()
          .post('/v1/customer/addresses')
          .set(...bearer(buyer))
          .send({
            label,
            location: { latitude: point.lat, longitude: point.lng },
          })
          .expect(201);

      expect((await save('داخل', middleOf(11))).body).toMatchObject({
        isCovered: true,
      });
      await save('خارج', { lat: 11.5, lng: 50.1 });

      const list = (
        await http()
          .get('/v1/customer/addresses')
          .set(...bearer(buyer))
          .expect(200)
      ).body as { items: { label: string; isCovered: boolean }[] };
      expect(
        list.items.map((each) => `${each.label}:${each.isCovered}`),
      ).toEqual(['داخل:true', 'خارج:false']);
    });
  });
});
