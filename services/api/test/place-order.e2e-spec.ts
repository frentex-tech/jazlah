import type { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CatalogJourney, type CatalogOptions } from './support/catalog-journey';
import { createHttpApp } from './support/create-http-app';
import { FindCustomerOrderUseCase } from '@modules/orders';
import { holdRowLock } from './support/row-lock';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type Day = { date: string; isAvailable: boolean };
type PlacedBody = {
  order: {
    id: string;
    number: string;
    status: string;
    fulfilment: string;
    fulfilmentDate: string;
    paymentMethod: string;
    totalHalalas: number;
    subtotalHalalas: number;
    deliveryFeeHalalas: number;
    vatHalalas: number;
    notes: string | null;
    window: { start: string; end: string } | null;
    address: { label: string; city: string | null } | null;
    pickupPoint: { name: { en: string }; phone: string | null } | null;
    vendor: { id: string; name: { en: string } };
    customer: { id: string; name: string | null; phone: string };
    items: {
      productId: string;
      quantity: number;
      unitPriceHalalas: number;
      totalHalalas: number;
      name: { ar: string; en: string };
      packaging: string | null;
      cutting: { name: { en: string } } | null;
      exclusions: { name: { en: string } }[];
    }[];
    history: { from: string | null; to: string; actorType: string }[];
  };
  payment: unknown;
};
type CartBody = {
  totalHalalas: number;
  lines: { id: string; unitPriceHalalas: number }[];
  issues: { code: string; lineId: string }[];
};

/** Squares at a latitude and longitude no other suite draws zones at. */
const ZONE = {
  type: 'Polygon',
  coordinates: [
    [
      [57, 21.5],
      [57.2, 21.5],
      [57.2, 21.7],
      [57, 21.7],
      [57, 21.5],
    ],
  ],
};
const INSIDE = { latitude: 21.6, longitude: 57.1 };
const OUTSIDE = { latitude: 21.6, longitude: 58.1 };

/**
 * Placing an order end to end (ORD-API-1): cash on delivery from the server cart, in one
 * transaction keyed by `Idempotency-Key`. The operations settings are one global row
 * another suite may change, so no test depends on their values: days are chosen from
 * what the days route answers, and capacity limits are set on this suite's own vendors'
 * day rows.
 */
describe('Place order (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;
  let admin: TestUser;
  let owner: TestUser;
  let vendorId: string;
  let options: CatalogOptions;
  let productId: string;
  const zoneIds: string[] = [];
  const vendorIds: string[] = [];
  let keyCounter = 0;

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
    const vendor = await vendors.approvedVendor('place-order-vendor');
    admin = vendor.admin;
    owner = vendor.owner;
    vendorId = vendor.vendorId;
    vendorIds.push(vendorId);
    options = await catalog.options(admin);
    productId = await catalog.published(owner, admin, options);
    const zone = await catalog.http
      .post('/v1/admin/coverage-zones')
      .set(...bearer(admin))
      .send({
        name: { ar: 'منطقة الطلب', en: 'Place order zone' },
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
    // An order restricts the deletion of its customer and its vendor; its lines and
    // history go with it (cascade).
    await prisma.order.deleteMany({ where: { vendorId: { in: vendorIds } } });
    await prisma.auditLog.deleteMany({ where: { entityId: { in: zoneIds } } });
    await prisma.coverageZone.deleteMany({ where: { id: { in: zoneIds } } });
    await catalog.cleanUp();
    await vendors.cleanUp();
    await app.close();
  });

  function bearer(user: TestUser): [string, string] {
    return ['Authorization', `Bearer ${user.accessToken}`];
  }
  const codeOf = (body: unknown) => (body as ErrorResponseBody).code;
  const newKey = (): string => {
    keyCounter += 1;
    return `00000000-0000-4000-8000-${String(keyCounter).padStart(12, '0')}`;
  };

  async function sizeOf(product: string): Promise<string> {
    const res = await catalog.http
      .get(`/v1/public/products/${product}`)
      .expect(200);
    return (res.body as { sizes: { id: string }[] }).sizes[0]?.id ?? '';
  }

  /** A signed-in customer, with a full name unless `named` is false. */
  async function customer(label: string, named = true): Promise<TestUser> {
    const user = await vendors.customer(label);
    if (named) {
      await catalog.http
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send({ fullName: 'عبدالله الحربي' })
        .expect(200);
    }
    return user;
  }

  async function addToCart(
    user: TestUser,
    product = productId,
    productOptions = options,
    quantity = 1,
  ): Promise<void> {
    await catalog.http
      .post('/v1/customer/cart/items')
      .set(...bearer(user))
      .send({
        productId: product,
        sizeId: await sizeOf(product),
        cuttingStyleId: productOptions.cuttingStyleId,
        packaging: 'trays',
        exclusionItemIds: [productOptions.exclusionItemId],
        quantity,
      })
      .expect(200);
  }

  async function days(user: TestUser, method: string): Promise<Day[]> {
    const res = await catalog.http
      .get(`/v1/customer/checkout/days?method=${method}`)
      .set(...bearer(user))
      .expect(200);
    return (res.body as { items: Day[] }).items;
  }

  async function addressOf(user: TestUser, location = INSIDE): Promise<string> {
    const res = await catalog.http
      .post('/v1/customer/addresses')
      .set(...bearer(user))
      .send({ label: 'البيت', location, city: 'الرياض' })
      .expect(201);
    return (res.body as { id: string }).id;
  }

  /** `which` day of the available ones: the first, or the last of the horizon. */
  async function chooseFulfilment(
    user: TestUser,
    method: 'delivery' | 'pickup',
    which: 'first' | 'last' = 'first',
    addressId?: string,
  ): Promise<string> {
    const available = (await days(user, method)).filter((d) => d.isAvailable);
    const day = which === 'first' ? available[0] : available.at(-1);
    expect(day).toBeDefined();
    await catalog.http
      .patch('/v1/customer/cart/fulfilment')
      .set(...bearer(user))
      .send(
        method === 'delivery'
          ? {
              method,
              addressId: addressId ?? (await addressOf(user)),
              date: day?.date,
            }
          : { method, date: day?.date },
      )
      .expect(200);
    return day?.date ?? '';
  }

  /** A named customer whose cart has one line and a fulfilment chosen. */
  async function ready(
    label: string,
    method: 'delivery' | 'pickup' = 'delivery',
    which: 'first' | 'last' = 'first',
  ): Promise<{ user: TestUser; date: string }> {
    const user = await customer(label);
    await addToCart(user);
    return { user, date: await chooseFulfilment(user, method, which) };
  }

  function place(
    user: TestUser,
    key: string | null = newKey(),
    body: object = { paymentMethod: 'cod' },
  ): request.Test {
    const call = catalog.http.post('/v1/customer/orders').set(...bearer(user));
    return (key === null ? call : call.set('Idempotency-Key', key)).send(body);
  }

  const cartOf = async (user: TestUser): Promise<CartBody> =>
    (
      await catalog.http
        .get('/v1/customer/cart')
        .set(...bearer(user))
        .expect(200)
    ).body as CartBody;

  const ordersOf = (user: TestUser) =>
    prisma.order.findMany({ where: { userId: user.userId } });

  const bookedOn = async (date: string): Promise<number> =>
    (
      await prisma.dayCapacity.findUnique({
        where: {
          vendorId_date: { vendorId, date: new Date(`${date}T00:00:00Z`) },
        },
      })
    )?.ordersBooked ?? 0;

  /** Nothing was kept: no order, the cart as it was. */
  async function expectNothingPlaced(user: TestUser, lines = 1): Promise<void> {
    expect(await ordersOf(user)).toEqual([]);
    expect((await cartOf(user)).lines).toHaveLength(lines);
  }

  describe('the happy path', () => {
    it('places a delivery order from the cart: snapshots, server money, history, capacity, the empty cart and the event', async () => {
      const { user, date } = await ready('po-delivery');
      const before = await cartOf(user);
      const bookedBefore = await bookedOn(date);
      const events: unknown[] = [];
      const emitter = app.get(EventEmitter2);
      const listener = (event: unknown) => events.push(event);
      emitter.on('orders.order.placed', listener);

      const res = await place(user, newKey(), {
        paymentMethod: 'cod',
        notes: 'اتصل قبل الوصول',
      }).expect(201);
      emitter.off('orders.order.placed', listener);

      const { order, payment } = res.body as PlacedBody;
      expect(payment).toBeNull();
      expect(order).toMatchObject({
        status: 'new',
        fulfilment: 'delivery',
        fulfilmentDate: date,
        paymentMethod: 'cod',
        notes: 'اتصل قبل الوصول',
        pickupPoint: null,
        address: { label: 'البيت', city: 'الرياض' },
        window: { start: expect.any(String) as unknown },
        vendor: { id: vendorId },
        customer: { id: user.userId, name: 'عبدالله الحربي' },
        history: [{ from: null, to: 'new', actorType: 'customer' }],
      });
      expect(order.number).toMatch(/^JZ-\d{6}-\d{4,}$/);
      // The order's money is the cart's: the lines, the fee, and the VAT inside the total.
      expect(order.totalHalalas).toBe(before.totalHalalas);
      expect(order.totalHalalas).toBe(
        order.subtotalHalalas + order.deliveryFeeHalalas,
      );
      expect(order.vatHalalas).toBe(
        Math.floor((order.totalHalalas * 15 * 2 + 115) / (115 * 2)),
      );
      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toMatchObject({
        productId,
        quantity: 1,
        unitPriceHalalas: before.lines[0]?.unitPriceHalalas,
        name: { ar: expect.any(String) as unknown, en: 'Naimi lamb' },
        packaging: 'trays',
      });
      expect(order.items[0]?.cutting?.name.en).toEqual(expect.any(String));
      expect(order.items[0]?.exclusions).toHaveLength(1);

      // Saved: the vendor's commission is copied, capacity taken, the cart empty.
      const saved = await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, history: true },
      });
      const vendor = await prisma.vendor.findUniqueOrThrow({
        where: { id: vendorId },
      });
      expect(saved.commissionBasisPoints).toBe(vendor.commissionBasisPoints);
      expect(saved.customerPhone).toBe(user.phone);
      expect(saved.items).toHaveLength(1);
      expect(saved.history).toHaveLength(1);
      expect(await bookedOn(date)).toBe(bookedBefore + 1);
      expect((await cartOf(user)).lines).toEqual([]);
      // Delivered after the commit.
      expect(events).toEqual([{ orderId: order.id, vendorId }]);
    });

    it('places a pickup order: the store’s pickup point, no address, no window, no fee', async () => {
      const { user } = await ready('po-pickup', 'pickup');

      const res = await place(user).expect(201);

      const { order } = res.body as PlacedBody;
      expect(order).toMatchObject({
        status: 'new',
        fulfilment: 'pickup',
        address: null,
        window: null,
        deliveryFeeHalalas: 0,
      });
      expect(order.pickupPoint?.name.en).toEqual(expect.any(String));
      expect(order.totalHalalas).toBe(order.subtotalHalalas);
    });

    it('keeps the order as placed when the saved address changes afterwards', async () => {
      const { user } = await ready('po-snapshot');
      const res = await place(user).expect(201);
      const { order } = res.body as PlacedBody;
      const [address] = await prisma.customerAddress.findMany({
        where: { userId: user.userId },
      });

      await prisma.customerAddress.update({
        where: { id: address?.id ?? '' },
        data: { label: 'تغيّر' },
      });

      const saved = await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
      });
      expect(saved.addressSnapshot).toMatchObject({ label: 'البيت' });
    });

    it('reads an order only for its own customer: the real lookup filters by user', async () => {
      const { user } = await ready('po-lookup', 'pickup');
      const other = await customer('po-lookup-other');
      const res = await place(user).expect(201);
      const orderId = (res.body as PlacedBody).order.id;
      const lookup = app.get(FindCustomerOrderUseCase);

      const own = await lookup.execute(user.userId, orderId);
      const foreign = await lookup.execute(other.userId, orderId).then(
        () => 'found',
        (error: unknown) => (error as { code?: string }).code,
      );

      expect(own.id).toBe(orderId);
      expect(foreign).toBe('NOT_FOUND');
    });

    it('gives each order of many placed at once its own number', async () => {
      const buyers: { user: TestUser }[] = [];
      for (const label of ['a', 'b', 'c', 'd']) {
        buyers.push(await ready(`po-numbers-${label}`, 'pickup'));
      }

      const responses = await Promise.all(
        buyers.map(({ user }) => place(user).expect(201)),
      );

      const numbers = responses.map(
        (res) => (res.body as PlacedBody).order.number,
      );
      expect(new Set(numbers).size).toBe(numbers.length);
    });
  });

  describe('refusals place nothing', () => {
    it('needs the Idempotency-Key header to be a UUID, and a customer token', async () => {
      const { user } = await ready('po-header', 'pickup');

      const missing = await place(user, null).expect(400);
      const invalid = await place(user, 'not-a-uuid').expect(400);
      const unsigned = await catalog.http
        .post('/v1/customer/orders')
        .set('Idempotency-Key', newKey())
        .send({ paymentMethod: 'cod' })
        .expect(401);

      for (const res of [missing, invalid]) {
        expect(res.body).toMatchObject({
          code: 'VALIDATION_FAILED',
          details: [{ field: 'Idempotency-Key' }],
        });
      }
      expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
      await expectNothingPlaced(user);
    });

    it('refuses an empty cart: CART_EMPTY', async () => {
      const user = await customer('po-empty');

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('CART_EMPTY');
      expect(await ordersOf(user)).toEqual([]);
    });

    it('refuses a customer without a full name: PROFILE_INCOMPLETE, and succeeds once named', async () => {
      const user = await customer('po-unnamed', false);
      await addToCart(user);
      await chooseFulfilment(user, 'pickup');

      const refused = await place(user).expect(409);

      expect(codeOf(refused.body)).toBe('PROFILE_INCOMPLETE');
      await expectNothingPlaced(user);
      await catalog.http
        .patch('/v1/customer/profile')
        .set(...bearer(user))
        .send({ fullName: 'سارة' })
        .expect(200);
      await place(user).expect(201);
    });

    it.each(['pickup', 'delivery'] as const)(
      'refuses a disabled customer the same way for %s: ACCOUNT_DISABLED, nothing placed',
      async (method) => {
        const { user } = await ready(`po-disabled-${method}`, method);
        await prisma.user.update({
          where: { id: user.userId },
          data: { disabledAt: new Date() },
        });

        const res = await place(user).expect(403);

        expect(codeOf(res.body)).toBe('ACCOUNT_DISABLED');
        expect(await ordersOf(user)).toEqual([]);
      },
    );

    it('refuses a cart whose fulfilment was never chosen: FULFILMENT_REQUIRED', async () => {
      const user = await customer('po-no-fulfilment');
      await addToCart(user);

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('FULFILMENT_REQUIRED');
      await expectNothingPlaced(user);
    });

    it('refuses a product switched off, naming the line: ITEM_UNAVAILABLE', async () => {
      const product = await catalog.published(owner, admin, options);
      const user = await customer('po-off');
      await addToCart(user, product);
      await chooseFulfilment(user, 'pickup');
      const [line] = (await cartOf(user)).lines;
      await prisma.product.update({
        where: { id: product },
        data: { isAvailable: false },
      });

      const res = await place(user).expect(409);

      expect(res.body).toMatchObject({
        code: 'ITEM_UNAVAILABLE',
        details: { lineIds: [line?.id] },
      });
      await expectNothingPlaced(user);
    });

    it('refuses a product that is no longer published: ITEM_UNAVAILABLE', async () => {
      const product = await catalog.published(owner, admin, options);
      const user = await customer('po-unpublished');
      await addToCart(user, product);
      await chooseFulfilment(user, 'pickup');
      await prisma.product.update({
        where: { id: product },
        data: { status: 'draft' },
      });

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('ITEM_UNAVAILABLE');
      await expectNothingPlaced(user);
    });

    it('refuses a product of a suspended vendor: ITEM_UNAVAILABLE', async () => {
      const other = await vendors.approvedVendor('po-suspended-vendor');
      vendorIds.push(other.vendorId);
      const otherOptions = await catalog.options(other.admin);
      const product = await catalog.published(
        other.owner,
        other.admin,
        otherOptions,
      );
      const user = await customer('po-suspended');
      await addToCart(user, product, otherOptions);
      await chooseFulfilment(user, 'pickup');
      await prisma.vendor.update({
        where: { id: other.vendorId },
        data: {
          status: 'suspended',
          suspendedAt: new Date(),
          suspensionReason: 'test',
        },
      });

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('ITEM_UNAVAILABLE');
      await expectNothingPlaced(user);
    });

    it('refuses a cutting style and packaging an admin rule now forbids: ITEM_UNAVAILABLE', async () => {
      const user = await customer('po-incompatible');
      await addToCart(user);
      await chooseFulfilment(user, 'pickup');
      const rule = await prisma.cuttingPackagingIncompatibility.create({
        data: { cuttingStyleId: options.cuttingStyleId, packaging: 'trays' },
      });
      try {
        const res = await place(user).expect(409);

        expect(codeOf(res.body)).toBe('ITEM_UNAVAILABLE');
        await expectNothingPlaced(user);
      } finally {
        await prisma.cuttingPackagingIncompatibility.delete({
          where: { id: rule.id },
        });
      }
    });

    it('refuses a product that stopped allowing the method: FULFILMENT_NOT_SUPPORTED', async () => {
      const product = await catalog.published(owner, admin, options);
      const user = await customer('po-method');
      await addToCart(user, product);
      await chooseFulfilment(user, 'delivery');
      await prisma.product.update({
        where: { id: product },
        data: { fulfilment: 'pickup' },
      });

      const res = await place(user).expect(422);

      expect(codeOf(res.body)).toBe('FULFILMENT_NOT_SUPPORTED');
      await expectNothingPlaced(user);
    });

    it('refuses an address that left coverage after it was chosen: ADDRESS_NOT_COVERED, nothing reserved', async () => {
      const { user, date } = await ready('po-coverage');
      const [address] = await prisma.customerAddress.findMany({
        where: { userId: user.userId },
      });
      await catalog.http
        .patch(`/v1/customer/addresses/${address?.id}`)
        .set(...bearer(user))
        .send({ location: OUTSIDE })
        .expect(200);
      const booked = await bookedOn(date);

      const res = await place(user).expect(422);

      expect(codeOf(res.body)).toBe('ADDRESS_NOT_COVERED');
      await expectNothingPlaced(user);
      expect(await bookedOn(date)).toBe(booked);
    });

    it('refuses a deleted address: FULFILMENT_REQUIRED', async () => {
      const { user } = await ready('po-address-gone');
      await prisma.customerAddress.deleteMany({
        where: { userId: user.userId },
      });

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('FULFILMENT_REQUIRED');
      await expectNothingPlaced(user);
    });

    it('refuses a day that is full by the time of placing: DAY_FULL, nothing persisted', async () => {
      const { user, date } = await ready('po-full', 'pickup', 'last');
      await prisma.dayCapacity.upsert({
        where: {
          vendorId_date: { vendorId, date: new Date(`${date}T00:00:00Z`) },
        },
        create: {
          vendorId,
          date: new Date(`${date}T00:00:00Z`),
          ordersLimit: 1,
          ordersBooked: 1,
        },
        update: { ordersLimit: 1, ordersBooked: 1 },
      });

      const res = await place(user).expect(409);

      expect(codeOf(res.body)).toBe('DAY_FULL');
      await expectNothingPlaced(user);
      expect(await bookedOn(date)).toBe(1);
    });

    it('refuses a day that can no longer be chosen: DAY_NOT_AVAILABLE', async () => {
      const { user } = await ready('po-past', 'pickup');
      await prisma.cart.update({
        where: { userId: user.userId },
        data: { fulfilmentDate: new Date('2020-01-01T00:00:00Z') },
      });

      const res = await place(user).expect(409);

      expect(res.body).toMatchObject({
        code: 'DAY_NOT_AVAILABLE',
        details: { reason: 'PAST_CUTOFF' },
      });
      await expectNothingPlaced(user);
    });

    it.each(['mada', 'card', 'applepay', 'wallet'])(
      'refuses %s: PAYMENT_METHOD_NOT_AVAILABLE, and an unknown method is invalid',
      async (method) => {
        const { user } = await ready(`po-pay-${method}`, 'pickup');

        const res = await place(user, newKey(), {
          paymentMethod: method,
        }).expect(422);
        const unknown = await place(user, newKey(), {
          paymentMethod: 'cash',
        }).expect(400);

        expect(res.body).toMatchObject({
          code: 'PAYMENT_METHOD_NOT_AVAILABLE',
          details: { method },
        });
        expect(codeOf(unknown.body)).toBe('VALIDATION_FAILED');
        await expectNothingPlaced(user);
      },
    );

    it('refuses a wallet part: WALLET_INSUFFICIENT with a balance of 0', async () => {
      const { user } = await ready('po-wallet', 'pickup');

      const res = await place(user, newKey(), {
        paymentMethod: 'cod',
        walletAmountHalalas: 100,
      }).expect(409);

      expect(res.body).toMatchObject({
        code: 'WALLET_INSUFFICIENT',
        details: { balanceHalalas: 0 },
      });
      await expectNothingPlaced(user);
    });
  });

  describe('prices come from the server', () => {
    it('refuses a price that moved after the line was added, then orders at the new server price once accepted', async () => {
      const product = await catalog.published(owner, admin, options);
      const user = await customer('po-price');
      await addToCart(user, product, options, 2);
      await chooseFulfilment(user, 'pickup');
      const [before] = (await cartOf(user)).lines;
      const oldPrice = before?.unitPriceHalalas ?? 0;
      const size = await prisma.productSize.findFirstOrThrow({
        where: { productId: product },
      });
      await prisma.$transaction([
        prisma.productSize.update({
          where: { id: size.id },
          data: { priceHalalas: size.priceHalalas + 5_000 },
        }),
        prisma.product.update({
          where: { id: product },
          data: { minPriceHalalas: size.priceHalalas + 5_000 },
        }),
      ]);

      const refused = await place(user).expect(409);

      expect(refused.body).toMatchObject({
        code: 'PRICE_CHANGED',
        details: { lineIds: [before?.id] },
      });
      await expectNothingPlaced(user);
      // The customer accepts the new price (PATCH the line with the same quantity).
      await catalog.http
        .patch(`/v1/customer/cart/items/${before?.id}`)
        .set(...bearer(user))
        .send({ quantity: 2 })
        .expect(200);
      const accepted = await cartOf(user);

      const res = await place(user).expect(201);

      const { order } = res.body as PlacedBody;
      expect(order.items[0]?.unitPriceHalalas).toBe(oldPrice + 5_000);
      expect(order.items[0]?.totalHalalas).toBe((oldPrice + 5_000) * 2);
      expect(order.totalHalalas).toBe(accepted.totalHalalas);
    });
  });

  describe('idempotency', () => {
    it('answers the first order again for the same key and body: one order, one place taken', async () => {
      const { user, date } = await ready('po-replay', 'pickup');
      const key = newKey();
      const booked = await bookedOn(date);

      const first = await place(user, key).expect(201);
      const again = await place(user, key).expect(201);

      expect((again.body as PlacedBody).order.id).toBe(
        (first.body as PlacedBody).order.id,
      );
      expect((again.body as PlacedBody).order.number).toBe(
        (first.body as PlacedBody).order.number,
      );
      expect(await ordersOf(user)).toHaveLength(1);
      expect(await bookedOn(date)).toBe(booked + 1);
    });

    it('refuses the same key with another body: IDEMPOTENCY_KEY_REUSED, the first order kept', async () => {
      const { user } = await ready('po-reused', 'pickup');
      const key = newKey();
      const first = await place(user, key).expect(201);

      const reused = await place(user, key, {
        paymentMethod: 'cod',
        notes: 'مختلف',
      }).expect(422);

      expect(codeOf(reused.body)).toBe('IDEMPOTENCY_KEY_REUSED');
      const orders = await ordersOf(user);
      expect(orders.map((order) => order.id)).toEqual([
        (first.body as PlacedBody).order.id,
      ]);
    });

    it('treats the same body written in another order of keys as the same request', async () => {
      const { user } = await ready('po-key-order', 'pickup');
      const key = newKey();
      await place(user, key, { notes: 'x', paymentMethod: 'cod' }).expect(201);

      await place(user, key, { paymentMethod: 'cod', notes: 'x' }).expect(201);

      expect(await ordersOf(user)).toHaveLength(1);
    });

    it('makes one order of two requests with the same key at once', async () => {
      const { user, date } = await ready('po-same-key', 'pickup');
      const key = newKey();
      const booked = await bookedOn(date);

      const [a, b] = await Promise.all([place(user, key), place(user, key)]);

      expect([a.status, b.status]).toEqual([201, 201]);
      expect((a.body as PlacedBody).order.id).toBe(
        (b.body as PlacedBody).order.id,
      );
      expect(await ordersOf(user)).toHaveLength(1);
      expect(await bookedOn(date)).toBe(booked + 1);
    });

    it('keeps no key for a refusal: the same key works once the cart is fixed', async () => {
      const user = await customer('po-refusal-key');
      await addToCart(user);
      const key = newKey();

      await place(user, key).expect(409);
      await chooseFulfilment(user, 'pickup');

      await place(user, key).expect(201);
    });
  });

  describe('concurrency', () => {
    it('gives the last place of a day to one of two orders at once; the other is DAY_FULL', async () => {
      const first = await ready('po-race-a', 'pickup', 'last');
      const second = await ready('po-race-b', 'pickup', 'last');
      expect(second.date).toBe(first.date);
      const date = first.date;
      await prisma.dayCapacity.upsert({
        where: {
          vendorId_date: { vendorId, date: new Date(`${date}T00:00:00Z`) },
        },
        create: {
          vendorId,
          date: new Date(`${date}T00:00:00Z`),
          ordersLimit: 1,
          ordersBooked: 0,
        },
        update: { ordersLimit: 1, ordersBooked: 0 },
      });

      const results = await Promise.all([
        place(first.user),
        place(second.user),
      ]);

      expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
      const refused = results.find((res) => res.status === 409);
      expect(codeOf(refused?.body)).toBe('DAY_FULL');
      expect(await bookedOn(date)).toBe(1);
      const orders = [
        ...(await ordersOf(first.user)),
        ...(await ordersOf(second.user)),
      ];
      expect(orders).toHaveLength(1);
    });

    it('makes one order when the same cart is placed twice at once with different keys', async () => {
      const { user, date } = await ready('po-cart-lock', 'pickup');
      const cart = await prisma.cart.findUniqueOrThrow({
        where: { userId: user.userId },
      });
      const booked = await bookedOn(date);
      // Hold the cart's row so both requests are at its lock before either goes on.
      const held = await holdRowLock(prisma, 'carts', cart.id);
      let settled = 0;
      const track = (call: request.Test) =>
        Promise.resolve(call).finally(() => {
          settled += 1;
        });
      try {
        const calls = [track(place(user)), track(place(user))];
        await held.waitForWaiters(2, () => settled > 0);
        await held.release();
        const results = await Promise.all(calls);

        expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
        expect(codeOf(results.find((res) => res.status === 409)?.body)).toBe(
          'CART_EMPTY',
        );
      } finally {
        await held.release().catch(() => undefined);
      }
      expect(await ordersOf(user)).toHaveLength(1);
      expect(await bookedOn(date)).toBe(booked + 1);
    });
  });
});
