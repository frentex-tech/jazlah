import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import type {
  OrderPaymentMethod,
  OrderStatus,
} from '@infra/database/generated/prisma/enums';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { CatalogJourney, type CatalogOptions } from './support/catalog-journey';
import { CheckoutSteps, type PlacedOrderBody } from './support/checkout-steps';
import { createHttpApp } from './support/create-http-app';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type Row = { id: string; number: string; status: string };
type PageBody = { items: Row[]; nextCursor: string | null };
type DetailBody = {
  id: string;
  number: string;
  status: string;
  vendor: { id: string; name: { en: string } };
  customer: { id: string; phone: string };
  totalHalalas: number;
  items: {
    productId: string;
    name: { en: string };
    unitPriceHalalas: number;
    totalHalalas: number;
  }[];
  history: { from: string | null; to: string; actorType: string }[];
  pickupPoint: { name: { en: string } } | null;
};

const MISSING = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';

/**
 * Order lists and detail (ORD-API-3) for the three audiences, on the real database.
 * Orders are saved straight into the tables, with creation times this suite chooses, so
 * the pages are exact; placing an order is place-order.e2e-spec.ts. Every number carries
 * this run's tag, and admin reads are narrowed to this suite's vendors, because other
 * suites' orders share the database.
 */
describe('Order lists and detail (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;
  let admin: TestUser;
  let ownerA: TestUser;
  let ownerB: TestUser;
  let vendorA: string;
  let vendorB: string;
  let customerA: TestUser;
  let customerB: TestUser;
  let options: CatalogOptions;
  let productId: string;
  let sizeId: string;
  const tag = Date.now().toString(36).toUpperCase();
  const base = Date.UTC(2026, 10, 20, 8, 0, 0);
  /** Order numbers by name, and the ids saved. */
  const ids = new Map<string, string>();
  let counter = 0;

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
    const first = await vendors.approvedVendor('order-lists-a');
    const second = await vendors.approvedVendor('order-lists-b');
    admin = first.admin;
    ownerA = first.owner;
    ownerB = second.owner;
    vendorA = first.vendorId;
    vendorB = second.vendorId;
    customerA = await vendors.customer('order-lists-customer-a');
    customerB = await vendors.customer('order-lists-customer-b');
    options = await catalog.options(admin);
    productId = await catalog.published(ownerA, admin, options);
    const size = await prisma.productSize.findFirst({ where: { productId } });
    sizeId = size?.id ?? '';

    // Customer A at store A: six orders, two of them created at the very same instant.
    await save('a1', customerA, vendorA, 'new', 1, { method: 'cod' });
    await save('a2', customerA, vendorA, 'confirmed', 2, { method: 'mada' });
    await save('a3', customerA, vendorA, 'delivered', 3, { method: 'mada' });
    await save('a4', customerA, vendorA, 'cancelled', 4, {
      method: 'cod',
      date: '2026-12-03',
    });
    await save('a5', customerA, vendorA, 'preparing', 5, { method: 'cod' });
    await save('a6', customerA, vendorA, 'new', 5, { method: 'cod' });
    // Customer B at store A, and customer A at store B.
    await save('b1', customerB, vendorA, 'new', 6, {
      method: 'cod',
      name: 'Sara Alharbi',
      phone: '+966500009902',
    });
    await save('x1', customerA, vendorB, 'new', 7, { method: 'cod' });
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    // An order restricts the deletion of its customer and its vendor; its lines and
    // history go with it (cascade).
    await prisma.order.deleteMany({
      where: { vendorId: { in: [vendorA, vendorB] } },
    });
    await catalog.cleanUp();
    await vendors.cleanUp();
    await app.close();
  });

  const bearer = (user: TestUser): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];
  const numberOf = (name: string) => `JZ-E2E-${tag}-${name}`;
  const idOf = (name: string) => ids.get(name) ?? '';
  const codeOf = (body: unknown) => (body as ErrorResponseBody).code;
  const namesOf = (page: PageBody) =>
    page.items.map((row) => row.number.slice(`JZ-E2E-${tag}-`.length));

  /** Saves an order as it was when placed, `minute` minutes after the suite's first instant. */
  async function save(
    name: string,
    customer: TestUser,
    vendorId: string,
    status: OrderStatus,
    minute: number,
    options: {
      method: OrderPaymentMethod;
      date?: string;
      name?: string;
      phone?: string;
    },
  ): Promise<void> {
    counter += 1;
    const at = new Date(base + minute * 60_000);
    const order = await prisma.order.create({
      data: {
        number: numberOf(name),
        userId: customer.userId,
        vendorId,
        status,
        orderType: 'ready_meat',
        fulfilmentMethod: 'pickup',
        fulfilmentDate: new Date(`${options.date ?? '2026-12-01'}T00:00:00Z`),
        paymentMethod: options.method,
        subtotalHalalas: 97_000n,
        vatHalalas: 12_652n,
        totalHalalas: 97_000n,
        deliveryFeeHalalas: 0,
        commissionBasisPoints: 1250,
        customerName: options.name ?? 'Abdullah Alharbi',
        customerPhone: options.phone ?? `+96650000${9000 + counter}`,
        vendorSnapshot: {
          name: { ar: 'متجر', en: `Store of ${name}` },
          phone: null,
          location: null,
          city: null,
        },
        pickupSnapshot: {
          name: { ar: 'متجر', en: `Pickup of ${name}` },
          address: null,
          location: null,
          phone: null,
          hours: null,
        },
        createdAt: at,
        items: {
          create: {
            position: 0,
            productId,
            sizeId,
            quantity: 1,
            unitPriceHalalas: 97_000,
            totalHalalas: 97_000n,
            snapshot: {
              name: { ar: 'نعيمي', en: `Naimi of ${name}` },
              size: { id: sizeId, approxWeightGrams: 8000, tag: null },
              cutting: null,
              exclusions: [],
            },
          },
        },
        history: {
          create: {
            fromStatus: null,
            toStatus: status,
            actorType: 'customer',
            actorId: customer.userId,
            createdAt: at,
          },
        },
      },
    });
    ids.set(name, order.id);
  }

  async function pageOf(
    path: string,
    user: TestUser,
    query: Record<string, string | number> = {},
  ): Promise<PageBody> {
    const res = await vendors.http
      .get(path)
      .query(query)
      .set(...bearer(user))
      .expect(200);
    return res.body as PageBody;
  }

  /** Every page of a list, `limit` rows at a time; fails if a page repeats or never ends. */
  async function allPages(
    path: string,
    user: TestUser,
    query: Record<string, string | number>,
    limit: number,
  ): Promise<string[]> {
    const names: string[] = [];
    let cursor: string | null = null;
    for (let turn = 0; turn < 20; turn += 1) {
      const page: PageBody = await pageOf(path, user, {
        ...query,
        limit,
        ...(cursor === null ? {} : { cursor }),
      });
      expect(page.items.length).toBeLessThanOrEqual(limit);
      names.push(...namesOf(page));
      cursor = page.nextCursor;
      if (cursor === null) {
        return names;
      }
    }
    throw new Error('A list never ended');
  }

  describe('an order placed through the API', () => {
    it('is read back by the customer, the vendor and the admin as it was placed', async () => {
      // Runs first in the file: the snapshot test below changes the product's price.
      const steps = new CheckoutSteps(vendors, catalog);
      const buyer = await steps.namedCustomer('order-lists-buyer');
      await steps.addToCart(buyer, productId, options, 2);
      await steps.choosePickupDay(buyer);
      const placed = await steps.place(buyer).expect(201);
      const order = (placed.body as PlacedOrderBody).order;

      expect(order.vendor.id).toBe(vendorA);
      expect(order.items).toHaveLength(1);
      const line = order.items[0];
      expect(line).toMatchObject({ productId, quantity: 2 });
      expect(line?.totalHalalas).toBe((line?.unitPriceHalalas ?? 0) * 2);
      expect(order.subtotalHalalas).toBe(line?.totalHalalas);

      const listed = await vendors.http
        .get('/v1/customer/orders')
        .set(...bearer(buyer))
        .expect(200);
      const reads = [
        await vendors.http
          .get(`/v1/customer/orders/${order.id}`)
          .set(...bearer(buyer))
          .expect(200),
        await vendors.http
          .get(`/v1/vendor/orders/${order.id}`)
          .set(...bearer(ownerA))
          .expect(200),
        await vendors.http
          .get(`/v1/admin/orders/${order.id}`)
          .set(...bearer(admin))
          .expect(200),
      ];

      expect((listed.body as PageBody).items.map((row) => row.id)).toEqual([
        order.id,
      ]);
      expect(
        (listed.body as { items: { totalHalalas: number }[] }).items[0]
          ?.totalHalalas,
      ).toBe(order.totalHalalas);
      for (const read of reads) {
        const body = read.body as PlacedOrderBody['order'];
        expect(body).toMatchObject({
          id: order.id,
          number: order.number,
          status: order.status,
          totalHalalas: order.totalHalalas,
          subtotalHalalas: order.subtotalHalalas,
          deliveryFeeHalalas: order.deliveryFeeHalalas,
          vatHalalas: order.vatHalalas,
        });
        expect(body.items).toEqual(order.items);
        expect(body.history).toEqual(order.history);
      }
    });
  });

  describe('customer', () => {
    it('lists only my orders, newest first, over pages with no duplicate or gap', async () => {
      const first = await pageOf('/v1/customer/orders', customerA, {
        limit: 2,
      });
      const all = await allPages('/v1/customer/orders', customerA, {}, 2);

      expect(first.items).toHaveLength(2);
      expect(first.nextCursor).not.toBeNull();
      // a5 and a6 share their creation time: the id breaks the tie, in both pages.
      expect(all.slice(0, 1)).toEqual(['x1']);
      expect([...all].sort()).toEqual(
        ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'x1'].sort(),
      );
      expect(new Set(all).size).toBe(all.length);
      expect(all.slice(-4)).toEqual(['a4', 'a3', 'a2', 'a1']);
    });

    it('never lists another customer’s order', async () => {
      const all = await allPages('/v1/customer/orders', customerA, {}, 50);
      const theirs = await allPages('/v1/customer/orders', customerB, {}, 50);

      expect(all).not.toContain('b1');
      expect(theirs).toEqual(['b1']);
    });

    it('splits current and past', async () => {
      const current = await allPages(
        '/v1/customer/orders',
        customerA,
        { scope: 'current' },
        50,
      );
      const past = await allPages(
        '/v1/customer/orders',
        customerA,
        { scope: 'past' },
        50,
      );

      expect([...current].sort()).toEqual(['a1', 'a2', 'a5', 'a6', 'x1']);
      expect(past).toEqual(['a4', 'a3']);
    });

    it('refuses a scope that is not one, and a call without a customer token', async () => {
      const bad = await vendors.http
        .get('/v1/customer/orders?scope=old')
        .set(...bearer(customerA))
        .expect(400);
      const unsigned = await vendors.http
        .get('/v1/customer/orders')
        .expect(401);
      const asVendor = await vendors.http
        .get('/v1/customer/orders')
        .set(...bearer(ownerA))
        .expect(403);

      expect(codeOf(bad.body)).toBe('VALIDATION_FAILED');
      expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
      expect(codeOf(asVendor.body)).toBe('FORBIDDEN');
    });

    it('answers my order in full, from what was saved', async () => {
      const res = await vendors.http
        .get(`/v1/customer/orders/${idOf('a2')}`)
        .set(...bearer(customerA))
        .expect(200);
      const body = res.body as DetailBody;

      expect(body).toMatchObject({
        id: idOf('a2'),
        number: numberOf('a2'),
        status: 'confirmed',
        totalHalalas: 97_000,
        vendor: { id: vendorA, name: { en: 'Store of a2' } },
        customer: { id: customerA.userId },
        pickupPoint: { name: { en: 'Pickup of a2' } },
      });
      expect(body.items).toMatchObject([
        {
          productId,
          name: { en: 'Naimi of a2' },
          unitPriceHalalas: 97_000,
          totalHalalas: 97_000,
        },
      ]);
      expect(body.history).toMatchObject([
        { from: null, to: 'confirmed', actorType: 'customer' },
      ]);
    });

    it('answers another customer’s order exactly as a missing one: NOT_FOUND', async () => {
      const theirs = await vendors.http
        .get(`/v1/customer/orders/${idOf('b1')}`)
        .set(...bearer(customerA))
        .expect(404);
      const missing = await vendors.http
        .get(`/v1/customer/orders/${MISSING}`)
        .set(...bearer(customerA))
        .expect(404);

      expect(codeOf(theirs.body)).toBe('NOT_FOUND');
      expect({ ...(theirs.body as object), requestId: '' }).toEqual({
        ...(missing.body as object),
        requestId: '',
      });
    });

    it('keeps the names, prices and store as they were when the order was placed', async () => {
      const before = await vendors.http
        .get(`/v1/customer/orders/${idOf('a1')}`)
        .set(...bearer(customerA))
        .expect(200);

      await prisma.productSize.update({
        where: { id: sizeId },
        data: { priceHalalas: 123_456 },
      });
      await prisma.vendor.update({
        where: { id: vendorA },
        data: { nameEn: 'Renamed store' },
      });
      const after = await vendors.http
        .get(`/v1/customer/orders/${idOf('a1')}`)
        .set(...bearer(customerA))
        .expect(200);

      expect(after.body).toEqual(before.body);
      expect((after.body as DetailBody).items[0]?.unitPriceHalalas).toBe(
        97_000,
      );
      expect((after.body as DetailBody).vendor.name.en).toBe('Store of a1');
    });
  });

  describe('vendor', () => {
    it('lists only my store’s orders, over pages with no duplicate or gap', async () => {
      const all = await allPages('/v1/vendor/orders', ownerA, {}, 3);

      expect([...all].sort()).toEqual(
        ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'b1'].sort(),
      );
      expect(new Set(all).size).toBe(all.length);
      expect(all[0]).toBe('b1');
      expect(await allPages('/v1/vendor/orders', ownerB, {}, 3)).toEqual([
        'x1',
      ]);
    });

    it('keeps another store’s orders out even when asked for them', async () => {
      const res = await vendors.http
        .get('/v1/vendor/orders')
        .query({ vendorId: vendorB, limit: 50 })
        .set(...bearer(ownerA));

      // `vendorId` is no filter of the vendor's query: refused or ignored, never obeyed.
      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(namesOf(res.body as PageBody)).not.toContain('x1');
      }
    });

    it('narrows by status, method, day and search', async () => {
      const list = (query: Record<string, string>) =>
        allPages('/v1/vendor/orders', ownerA, query, 50);

      expect(await list({ status: 'confirmed' })).toEqual(['a2']);
      expect([...(await list({ paymentMethod: 'mada' }))].sort()).toEqual([
        'a2',
        'a3',
      ]);
      expect(await list({ fulfilmentDate: '2026-12-03' })).toEqual(['a4']);
      expect(await list({ q: numberOf('a3').toLowerCase() })).toEqual(['a3']);
      expect(await list({ q: 'sara' })).toEqual(['b1']);
      expect(await list({ q: '0009902' })).toEqual(['b1']);
    });

    it('answers my store’s order, and NOT_FOUND for another store’s', async () => {
      const own = await vendors.http
        .get(`/v1/vendor/orders/${idOf('b1')}`)
        .set(...bearer(ownerA))
        .expect(200);
      const other = await vendors.http
        .get(`/v1/vendor/orders/${idOf('x1')}`)
        .set(...bearer(ownerA))
        .expect(404);
      const missing = await vendors.http
        .get(`/v1/vendor/orders/${MISSING}`)
        .set(...bearer(ownerA))
        .expect(404);

      expect((own.body as DetailBody).number).toBe(numberOf('b1'));
      expect(codeOf(other.body)).toBe('NOT_FOUND');
      expect(codeOf(missing.body)).toBe('NOT_FOUND');
    });

    it('refuses a customer’s token', async () => {
      await vendors.http
        .get(`/v1/vendor/orders/${idOf('a1')}`)
        .set(...bearer(customerA))
        .expect(403);
    });
  });

  describe('admin', () => {
    it('lists every order, narrowed to the suite’s stores, over pages with no duplicate or gap', async () => {
      const storeA = await allPages(
        '/v1/admin/orders',
        admin,
        { vendorId: vendorA },
        2,
      );
      const storeB = await allPages(
        '/v1/admin/orders',
        admin,
        { vendorId: vendorB },
        2,
      );

      expect(storeA).toHaveLength(7);
      expect(new Set(storeA).size).toBe(7);
      expect(storeA[0]).toBe('b1');
      expect(storeB).toEqual(['x1']);
    });

    it('narrows by status and method', async () => {
      const list = (query: Record<string, string>) =>
        allPages(
          '/v1/admin/orders',
          admin,
          { vendorId: vendorA, ...query },
          50,
        );

      expect(await list({ status: 'delivered' })).toEqual(['a3']);
      expect([...(await list({ paymentMethod: 'mada' }))].sort()).toEqual([
        'a2',
        'a3',
      ]);
    });

    it('answers any order, and NOT_FOUND for an unknown one', async () => {
      const one = await vendors.http
        .get(`/v1/admin/orders/${idOf('x1')}`)
        .set(...bearer(admin))
        .expect(200);
      const missing = await vendors.http
        .get(`/v1/admin/orders/${MISSING}`)
        .set(...bearer(admin))
        .expect(404);

      expect((one.body as DetailBody).number).toBe(numberOf('x1'));
      expect(codeOf(missing.body)).toBe('NOT_FOUND');
    });

    it('refuses a customer’s token', async () => {
      await vendors.http
        .get('/v1/admin/orders')
        .set(...bearer(customerA))
        .expect(403);
    });
  });
});
