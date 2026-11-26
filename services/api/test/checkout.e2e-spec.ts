import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CatalogJourney, type CatalogOptions } from './support/catalog-journey';
import { createHttpApp } from './support/create-http-app';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type Day = {
  date: string;
  isAvailable: boolean;
  reason: string | null;
  window: { start: string; end: string } | null;
};
type CartBody = {
  fulfilment: {
    method: string;
    addressId: string | null;
    date: string;
    window: { start: string; end: string } | null;
    pickupPoint: {
      name: { ar: string; en: string };
      address: { ar: string; en: string } | null;
      phone: string | null;
      hours: null;
    } | null;
  } | null;
  deliveryFeeHalalas: number;
  totalHalalas: number;
};

/** A square 0.2 degrees wide at a latitude and longitude no other suite draws zones at. */
const ZONE = {
  type: 'Polygon',
  coordinates: [
    [
      [53, 19.5],
      [53.2, 19.5],
      [53.2, 19.7],
      [53, 19.7],
      [53, 19.5],
    ],
  ],
};
const INSIDE = { latitude: 19.6, longitude: 53.1 };
const OUTSIDE = { latitude: 19.6, longitude: 54.1 };

/**
 * Checkout end to end (SCH-API-2, PAY-API-1's methods): the days a cart can be fulfilled
 * on, choosing delivery or pickup and the day, and the payment methods. The operations
 * settings are one global row another suite may change between two requests, so no
 * test depends on their values: days are chosen from what the days route answers.
 */
describe('Checkout (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;
  let admin: TestUser;
  let owner: TestUser;
  let options: CatalogOptions;
  let productId: string;
  const zoneIds: string[] = [];

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    const storage = new FakeStorageProvider();
    app = await createHttpApp({
      overrides: [
        { provide: SMS_PORTS, useValue: [sms] },
        { provide: STORAGE_PORT, useValue: storage },
      ],
    });
    prisma = app.get(PrismaService);
    vendors = new VendorJourney(app, sms, storage);
    catalog = new CatalogJourney(app, vendors);
    const vendor = await vendors.approvedVendor('checkout-vendor');
    admin = vendor.admin;
    owner = vendor.owner;
    options = await catalog.options(admin);
    productId = await catalog.published(owner, admin, options);
    const zone = await catalog.http
      .post('/v1/admin/coverage-zones')
      .set(...bearer(admin))
      .send({
        name: { ar: 'منطقة الدفع', en: 'Checkout zone' },
        city: 'الرياض',
        polygon: ZONE,
      })
      .expect(201);
    zoneIds.push((zone.body as { id: string }).id);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await prisma.auditLog.deleteMany({ where: { entityId: { in: zoneIds } } });
    await prisma.coverageZone.deleteMany({ where: { id: { in: zoneIds } } });
    // Carts, lines and addresses go with their users, products and vendors (cascade).
    await catalog.cleanUp();
    await vendors.cleanUp();
    await app.close();
  });

  function bearer(user: TestUser): [string, string] {
    return ['Authorization', `Bearer ${user.accessToken}`];
  }
  const codeOf = (body: unknown) => (body as ErrorResponseBody).code;

  async function customerWithCart(label: string, product = productId) {
    const customer = await vendors.customer(label);
    const res = await catalog.http
      .get(`/v1/public/products/${product}`)
      .expect(200);
    const sizeId = (res.body as { sizes: { id: string }[] }).sizes[0]?.id;
    await catalog.http
      .post('/v1/customer/cart/items')
      .set(...bearer(customer))
      .send({
        productId: product,
        sizeId,
        cuttingStyleId: options.cuttingStyleId,
        packaging: 'trays',
        exclusionItemIds: [options.exclusionItemId],
        quantity: 1,
      })
      .expect(200);
    return customer;
  }

  async function daysOf(user: TestUser, method: string): Promise<Day[]> {
    const res = await catalog.http
      .get(`/v1/customer/checkout/days?method=${method}`)
      .set(...bearer(user))
      .expect(200);
    return (res.body as { items: Day[] }).items;
  }

  async function addressOf(user: TestUser, location: object): Promise<string> {
    const res = await catalog.http
      .post('/v1/customer/addresses')
      .set(...bearer(user))
      .send({ label: `checkout-${user.userId.slice(0, 8)}`, location })
      .expect(201);
    return (res.body as { id: string }).id;
  }

  const setFulfilment = (user: TestUser, body: object) =>
    catalog.http
      .patch('/v1/customer/cart/fulfilment')
      .set(...bearer(user))
      .send(body);

  describe('GET /v1/customer/checkout/days', () => {
    it('lists the horizon from today in Riyadh, each day available with its window or not with its reason', async () => {
      const customer = await customerWithCart('days-list');

      const days = await daysOf(customer, 'delivery');

      expect(days.length).toBeGreaterThan(0);
      for (const day of days) {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (day.isAvailable) {
          expect(day).toMatchObject({
            reason: null,
            window: { start: expect.any(String) as unknown },
          });
        } else {
          expect(day.window).toBeNull();
          expect(['PAST_CUTOFF', 'CLOSED', 'FULL']).toContain(day.reason);
        }
      }
      const sorted = [...days.map((day) => day.date)].sort();
      expect(days.map((day) => day.date)).toEqual(sorted);
    });

    it('is FULFILMENT_NOT_SUPPORTED for a pickup-only product with delivery', async () => {
      const pickupOnly = await catalog.published(owner, admin, options, {
        fulfilment: 'pickup',
      });
      const customer = await customerWithCart('days-pickup-only', pickupOnly);

      const res = await catalog.http
        .get('/v1/customer/checkout/days?method=delivery')
        .set(...bearer(customer))
        .expect(422);
      expect(codeOf(res.body)).toBe('FULFILMENT_NOT_SUPPORTED');
      expect((await daysOf(customer, 'pickup')).length).toBeGreaterThan(0);
    });

    it('is CART_EMPTY for an empty cart, VALIDATION_FAILED for an unknown method', async () => {
      const customer = await vendors.customer('days-empty');

      const empty = await catalog.http
        .get('/v1/customer/checkout/days?method=delivery')
        .set(...bearer(customer))
        .expect(409);
      const invalid = await catalog.http
        .get('/v1/customer/checkout/days?method=drone')
        .set(...bearer(customer))
        .expect(400);

      expect(codeOf(empty.body)).toBe('CART_EMPTY');
      expect(invalid.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'method' }],
      });
    });
  });

  describe('PATCH /v1/customer/cart/fulfilment', () => {
    it('chooses pickup on an available day: the store’s pickup point, no fee', async () => {
      const customer = await customerWithCart('fulfil-pickup');
      const day = (await daysOf(customer, 'pickup')).find((d) => d.isAvailable);
      expect(day).toBeDefined();

      const res = await setFulfilment(customer, {
        method: 'pickup',
        date: day?.date,
      }).expect(200);

      const cart = res.body as CartBody;
      expect(cart.fulfilment).toMatchObject({
        method: 'pickup',
        addressId: null,
        date: day?.date,
        window: null,
        pickupPoint: { hours: null },
      });
      expect(cart.fulfilment?.pickupPoint?.name.en).toEqual(expect.any(String));
      expect(cart.deliveryFeeHalalas).toBe(0);
    });

    it('chooses delivery to a covered address: the window and the fee show', async () => {
      const customer = await customerWithCart('fulfil-delivery');
      const addressId = await addressOf(customer, INSIDE);
      const day = (await daysOf(customer, 'delivery')).find(
        (d) => d.isAvailable,
      );

      const res = await setFulfilment(customer, {
        method: 'delivery',
        addressId,
        date: day?.date,
      }).expect(200);

      const cart = res.body as CartBody;
      expect(cart.fulfilment).toMatchObject({
        method: 'delivery',
        addressId,
        date: day?.date,
        window: day?.window,
        pickupPoint: null,
      });
      expect(cart.deliveryFeeHalalas).toBeGreaterThanOrEqual(0);
      const read = await catalog.http
        .get('/v1/customer/cart')
        .set(...bearer(customer))
        .expect(200);
      expect((read.body as CartBody).fulfilment?.addressId).toBe(addressId);
    });

    it('refuses an address outside every zone, one not the customer’s, and delivery without one', async () => {
      const customer = await customerWithCart('fulfil-address');
      const other = await vendors.customer('fulfil-address-other');
      const far = await addressOf(customer, OUTSIDE);
      const notMine = await addressOf(other, INSIDE);
      const day = (await daysOf(customer, 'delivery')).find(
        (d) => d.isAvailable,
      );

      const outside = await setFulfilment(customer, {
        method: 'delivery',
        addressId: far,
        date: day?.date,
      }).expect(422);
      const foreign = await setFulfilment(customer, {
        method: 'delivery',
        addressId: notMine,
        date: day?.date,
      }).expect(404);
      const missing = await setFulfilment(customer, {
        method: 'delivery',
        date: day?.date,
      }).expect(400);

      expect(codeOf(outside.body)).toBe('ADDRESS_NOT_COVERED');
      expect(codeOf(foreign.body)).toBe('NOT_FOUND');
      expect(missing.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [{ field: 'addressId' }],
      });
    });

    it('refuses a day past the horizon, a past day, and a pickup-only cart with delivery', async () => {
      const customer = await customerWithCart('fulfil-days');
      const days = await daysOf(customer, 'pickup');
      const last = days[days.length - 1]?.date ?? '2026-01-01';
      const after = new Date(`${last}T00:00:00Z`);
      after.setUTCDate(after.getUTCDate() + 1);

      const outside = await setFulfilment(customer, {
        method: 'pickup',
        date: after.toISOString().slice(0, 10),
      }).expect(409);
      const past = await setFulfilment(customer, {
        method: 'pickup',
        date: '2020-01-01',
      }).expect(409);

      expect(outside.body).toMatchObject({
        code: 'DAY_NOT_AVAILABLE',
        details: { reason: 'OUTSIDE_HORIZON' },
      });
      expect(past.body).toMatchObject({
        code: 'DAY_NOT_AVAILABLE',
        details: { reason: 'PAST_CUTOFF' },
      });

      const pickupOnly = await catalog.published(owner, admin, options, {
        fulfilment: 'pickup',
      });
      const second = await customerWithCart('fulfil-pickup-only', pickupOnly);
      const addressId = await addressOf(second, INSIDE);
      const refused = await setFulfilment(second, {
        method: 'delivery',
        addressId,
        date: days.find((d) => d.isAvailable)?.date,
      }).expect(422);
      expect(codeOf(refused.body)).toBe('FULFILMENT_NOT_SUPPORTED');
    });

    it('is CART_EMPTY for an empty cart', async () => {
      const customer = await vendors.customer('fulfil-empty');

      const res = await setFulfilment(customer, {
        method: 'pickup',
        date: '2030-01-01',
      }).expect(409);

      expect(codeOf(res.body)).toBe('CART_EMPTY');
    });
  });

  describe('GET /v1/customer/checkout/payment-methods', () => {
    it('answers the cart’s total, a wallet balance of 0, and at most cash on delivery', async () => {
      const customer = await customerWithCart('pay-methods');
      const cart = await catalog.http
        .get('/v1/customer/cart')
        .set(...bearer(customer))
        .expect(200);

      const res = await catalog.http
        .get('/v1/customer/checkout/payment-methods')
        .set(...bearer(customer))
        .expect(200);

      const body = res.body as {
        items: { method: string; isAvailable: boolean; reason: null }[];
        walletBalanceHalalas: number;
        totalHalalas: number;
      };
      expect(body.totalHalalas).toBe((cart.body as CartBody).totalHalalas);
      expect(body.walletBalanceHalalas).toBe(0);
      for (const item of body.items) {
        expect(item).toEqual({
          method: 'cod',
          isAvailable: true,
          reason: null,
        });
      }
    });

    it('is CART_EMPTY for an empty cart, and NOT_IMPLEMENTED to pay an order again', async () => {
      const customer = await vendors.customer('pay-empty');

      const empty = await catalog.http
        .get('/v1/customer/checkout/payment-methods')
        .set(...bearer(customer))
        .expect(409);
      const again = await catalog.http
        .get(
          '/v1/customer/checkout/payment-methods?orderId=7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
        )
        .set(...bearer(customer))
        .expect(501);

      expect(codeOf(empty.body)).toBe('CART_EMPTY');
      expect(again.body).toMatchObject({ details: { task: 'PAY-API-1' } });
    });
  });

  it.each([
    ['get', '/v1/customer/checkout/days?method=delivery'],
    ['get', '/v1/customer/checkout/payment-methods'],
    ['patch', '/v1/customer/cart/fulfilment'],
  ] as const)('%s %s needs a customer token', async (method, path) => {
    const unsigned = await catalog.http[method](path).expect(401);
    const asVendor = await catalog.http[method](path)
      .set(...bearer(owner))
      .expect(403);

    expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
    expect(codeOf(asVendor.body)).toBe('FORBIDDEN');
  });
});
