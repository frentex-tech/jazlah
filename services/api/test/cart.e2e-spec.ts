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
import { holdRowLock } from './support/row-lock';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type CartBody = {
  vendor: { id: string; name: { ar: string; en: string } } | null;
  lines: {
    id: string;
    productId: string;
    quantity: number;
    unitPriceHalalas: number;
    totalHalalas: number;
    isAvailable: boolean;
    cutting: { id: string } | null;
    packaging: string | null;
    exclusions: { id: string }[];
    notes: string | null;
  }[];
  coupon: null;
  fulfilment: null;
  subtotalHalalas: number;
  discountHalalas: number;
  deliveryFeeHalalas: number;
  totalHalalas: number;
  vatHalalas: number;
  issues: { code: string; lineId: string }[];
  canCheckout: boolean;
};

/**
 * The customer cart end to end (CRT-API-1): real products published through the catalog,
 * priced by `PricingService`. The operations settings are one global row another suite
 * may change between two requests, so no test here depends on the minimum order or the
 * delivery fee, and the pause is covered by the use case tests.
 */
describe('Cart (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;
  let admin: TestUser;
  let owner: TestUser;
  let options: CatalogOptions;
  let productId: string;

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
    const vendor = await vendors.approvedVendor('cart-vendor');
    admin = vendor.admin;
    owner = vendor.owner;
    options = await catalog.options(admin);
    productId = await catalog.published(owner, admin, options);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    // Carts and their lines go with their users, products and vendors (cascade).
    await catalog.cleanUp();
    await vendors.cleanUp();
    await app.close();
  });

  const bearer = (user: TestUser): [string, string] => [
    'Authorization',
    `Bearer ${user.accessToken}`,
  ];
  const codeOf = (body: unknown) => (body as ErrorResponseBody).code;

  /** The product's only size, as the public sees it. */
  async function sizeOf(id: string): Promise<string> {
    const res = await catalog.http.get(`/v1/public/products/${id}`).expect(200);
    const sizes = (res.body as { sizes: { id: string }[] }).sizes;
    return sizes[0]?.id ?? '';
  }

  async function item(id = productId, overrides: Record<string, unknown> = {}) {
    return {
      productId: id,
      sizeId: await sizeOf(id),
      cuttingStyleId: options.cuttingStyleId,
      packaging: 'trays',
      exclusionItemIds: [options.exclusionItemId],
      quantity: 2,
      ...overrides,
    };
  }

  const add = (user: TestUser, body: Record<string, unknown>) =>
    catalog.http
      .post('/v1/customer/cart/items')
      .set(...bearer(user))
      .send(body);

  it('starts empty, adds a line priced by the catalog, and reads it back', async () => {
    const customer = await vendors.customer('cart-add');
    const empty = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect(empty.body).toMatchObject({
      vendor: null,
      lines: [],
      coupon: null,
      fulfilment: null,
      subtotalHalalas: 0,
      totalHalalas: 0,
      canCheckout: false,
    });

    const added = await add(customer, await item()).expect(200);
    const cart = added.body as CartBody;
    // 95000 size + 1500 cutting + 300 trays = 96800 a unit, VAT included.
    expect(cart.vendor?.name).toEqual(
      expect.objectContaining({ ar: expect.any(String) as unknown }),
    );
    expect(cart.lines).toEqual([
      expect.objectContaining({
        productId,
        quantity: 2,
        unitPriceHalalas: 96_800,
        totalHalalas: 193_600,
        isAvailable: true,
        cutting: expect.objectContaining({
          id: options.cuttingStyleId,
        }) as unknown,
        packaging: 'trays',
        exclusions: [expect.objectContaining({ id: options.exclusionItemId })],
        notes: null,
      }),
    ]);
    expect(cart.subtotalHalalas).toBe(193_600);
    expect(cart.discountHalalas).toBe(0);
    // round half up of total × 15 / 115, on whatever fee the settings hold now.
    const total = cart.totalHalalas;
    expect(cart.vatHalalas).toBe(
      Math.floor((2 * total * 15 + 115) / (2 * 115)),
    );
    expect(cart.issues).toEqual([]);

    const read = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect((read.body as CartBody).lines.map((line) => line.id)).toEqual([
      cart.lines[0]?.id,
    ]);
  });

  it('adds the same choice to its line and refuses past 99', async () => {
    const customer = await vendors.customer('cart-merge');
    await add(customer, await item()).expect(200);
    const again = await add(
      customer,
      await item(productId, { quantity: 3 }),
    ).expect(200);
    expect((again.body as CartBody).lines.map((line) => line.quantity)).toEqual(
      [5],
    );

    const tooMany = await add(
      customer,
      await item(productId, { quantity: 95 }),
    ).expect(400);
    expect(tooMany.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ field: 'quantity', constraints: ['max'] }],
    });
  });

  it('changes a quantity, removes a line and empties the cart', async () => {
    const customer = await vendors.customer('cart-edit');
    const added = await add(customer, await item()).expect(200);
    const lineId = (added.body as CartBody).lines[0]?.id ?? '';

    const changed = await catalog.http
      .patch(`/v1/customer/cart/items/${lineId}`)
      .set(...bearer(customer))
      .send({ quantity: 4 })
      .expect(200);
    expect((changed.body as CartBody).lines[0]).toMatchObject({
      quantity: 4,
      totalHalalas: 387_200,
    });

    const notMine = await catalog.http
      .patch('/v1/customer/cart/items/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b')
      .set(...bearer(customer))
      .send({ quantity: 1 })
      .expect(404);
    expect(codeOf(notMine.body)).toBe('NOT_FOUND');

    const removed = await catalog.http
      .delete(`/v1/customer/cart/items/${lineId}`)
      .set(...bearer(customer))
      .expect(200);
    expect(removed.body).toMatchObject({ vendor: null, lines: [] });

    await add(customer, await item()).expect(200);
    const cleared = await catalog.http
      .delete('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect(cleared.body).toMatchObject({
      vendor: null,
      lines: [],
      totalHalalas: 0,
    });
  });

  it('keeps one customer out of another customer’s lines', async () => {
    const first = await vendors.customer('cart-owner');
    const second = await vendors.customer('cart-other');
    const added = await add(first, await item()).expect(200);
    const lineId = (added.body as CartBody).lines[0]?.id ?? '';

    await catalog.http
      .delete(`/v1/customer/cart/items/${lineId}`)
      .set(...bearer(second))
      .expect(404);
    const still = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(first))
      .expect(200);
    expect((still.body as CartBody).lines).toHaveLength(1);
  });

  it('refuses another store’s product unless the customer agrees to replace the cart', async () => {
    const other = await vendors.approvedVendor('cart-vendor-2');
    const otherOptions = await catalog.options(other.admin);
    const otherProduct = await catalog.published(
      other.owner,
      other.admin,
      otherOptions,
    );
    const customer = await vendors.customer('cart-mismatch');
    const first = await add(customer, await item()).expect(200);
    const firstVendor = (first.body as CartBody).vendor;

    const otherItem = {
      ...(await item(otherProduct)),
      cuttingStyleId: otherOptions.cuttingStyleId,
      exclusionItemIds: [otherOptions.exclusionItemId],
    };
    const refused = await add(customer, otherItem).expect(409);
    expect(refused.body).toMatchObject({
      code: 'CART_VENDOR_MISMATCH',
      details: { vendorId: firstVendor?.id, vendorName: firstVendor?.name },
    });

    const replaced = await add(customer, {
      ...otherItem,
      replaceCart: true,
    }).expect(200);
    expect((replaced.body as CartBody).vendor?.id).toBe(other.vendorId);
    expect(
      (replaced.body as CartBody).lines.map((line) => line.productId),
    ).toEqual([otherProduct]);
  });

  it('refuses a choice the catalog refuses, in the contract’s order', async () => {
    const customer = await vendors.customer('cart-refusals');

    const noCut = await add(
      customer,
      await item(productId, { cuttingStyleId: null }),
    ).expect(422);
    expect(codeOf(noCut.body)).toBe('OPTION_REQUIRED');

    const unknownSize = await add(customer, {
      ...(await item()),
      sizeId: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    });
    expect(codeOf(unknownSize.body)).toBe('OPTION_NOT_IN_PRODUCT');

    const missing = await add(customer, {
      ...(await item()),
      productId: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    });
    expect(codeOf(missing.body)).toBe('PRODUCT_UNAVAILABLE');
  });

  it('refuses a cutting style and packaging an admin rule forbids together', async () => {
    const ruleAdmin = await vendors.admin();
    const rule = await catalog.http
      .post('/v1/admin/cutting-packaging-incompatibilities')
      .set(...bearer(ruleAdmin))
      .send({ cuttingStyleId: options.cuttingStyleId, packaging: 'trays' })
      .expect(201);
    catalog.rememberRule((rule.body as { id: string }).id);
    try {
      const customer = await vendors.customer('cart-rule');
      const refused = await add(customer, await item());
      expect(codeOf(refused.body)).toBe('INCOMPATIBLE_CUTTING_PACKAGING');
    } finally {
      await catalog.http
        .delete(
          `/v1/admin/cutting-packaging-incompatibilities/${(rule.body as { id: string }).id}`,
        )
        .set(...bearer(ruleAdmin))
        .expect(204);
    }
  });

  it('flags a changed price and an unavailable line, and a PATCH accepts the new price', async () => {
    const product = await catalog.published(owner, admin, options);
    const customer = await vendors.customer('cart-issues');
    const added = await add(customer, await item(product)).expect(200);
    const lineId = (added.body as CartBody).lines[0]?.id ?? '';

    await prisma.productSize.updateMany({
      where: { productId: product },
      data: { priceHalalas: 99_000 },
    });
    const changed = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect((changed.body as CartBody).issues).toEqual([
      {
        code: 'PRICE_CHANGED',
        lineId,
        oldUnitPriceHalalas: 96_800,
        newUnitPriceHalalas: 100_800,
      },
    ]);
    expect((changed.body as CartBody).canCheckout).toBe(false);

    const accepted = await catalog.http
      .patch(`/v1/customer/cart/items/${lineId}`)
      .set(...bearer(customer))
      .send({ quantity: 2 })
      .expect(200);
    expect((accepted.body as CartBody).lines[0]?.unitPriceHalalas).toBe(
      100_800,
    );
    expect((accepted.body as CartBody).issues).toEqual([]);

    await prisma.product.update({
      where: { id: product },
      data: { isAvailable: false },
    });
    const unavailable = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect((unavailable.body as CartBody).lines[0]?.isAvailable).toBe(false);
    expect((unavailable.body as CartBody).issues).toEqual([
      expect.objectContaining({ code: 'ITEM_UNAVAILABLE', lineId }),
    ]);
  });

  it('locks the cart for each write: two adds at once both count', async () => {
    const customer = await vendors.customer('cart-lock');
    await add(customer, await item(productId, { quantity: 1 })).expect(200);
    const cart = await prisma.cart.findUniqueOrThrow({
      where: { userId: customer.userId },
    });
    const body = await item(productId, { quantity: 1 });

    const lock = await holdRowLock(prisma, 'carts', cart.id);
    let both: Promise<unknown[]>;
    try {
      both = Promise.all([
        add(customer, body).then((res) => res.status),
        add(customer, body).then((res) => res.status),
      ]);
      await lock.waitForWaiters(2);
    } finally {
      await lock.release();
    }

    expect(await both).toEqual([200, 200]);
    const after = await catalog.http
      .get('/v1/customer/cart')
      .set(...bearer(customer))
      .expect(200);
    expect((after.body as CartBody).lines.map((line) => line.quantity)).toEqual(
      [3],
    );
  });

  // The pause is one global row: it is set and lifted inside this test, between two
  // requests, as the settings suite does.
  it('refuses a cart change while orders are paused, with the admin’s message', async () => {
    const customer = await vendors.customer('cart-paused');
    const body = await item();
    await catalog.http
      .put('/v1/admin/settings/operations/pause')
      .set(...bearer(admin))
      .send({
        isPaused: true,
        messageAr: 'متوقفين للجرد',
        messageEn: 'Stock count',
      })
      .expect(200);
    let paused: Awaited<ReturnType<typeof add>>;
    try {
      paused = await add(customer, body);
    } finally {
      await catalog.http
        .put('/v1/admin/settings/operations/pause')
        .set(...bearer(admin))
        .send({ isPaused: false })
        .expect(200);
    }

    expect(paused.status).toBe(409);
    expect(paused.body).toMatchObject({
      code: 'ORDERING_PAUSED',
      details: { messageAr: 'متوقفين للجرد', messageEn: 'Stock count' },
    });
  });

  it('refuses an invalid body with its fields', async () => {
    const customer = await vendors.customer('cart-invalid');

    const res = await add(customer, {
      productId: 'not-a-uuid',
      sizeId: await sizeOf(productId),
      quantity: 0,
      packaging: 'box',
    }).expect(400);

    expect(codeOf(res.body)).toBe('VALIDATION_FAILED');
    const fields = (res.body as { details: { field: string }[] }).details.map(
      (d) => d.field,
    );
    expect(fields).toEqual(
      expect.arrayContaining(['productId', 'quantity', 'packaging']),
    );
  });

  it.each([
    ['get', '/v1/customer/cart'],
    ['delete', '/v1/customer/cart'],
    ['post', '/v1/customer/cart/items'],
    ['patch', '/v1/customer/cart/items/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
    ['delete', '/v1/customer/cart/items/7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b'],
  ] as const)('%s %s needs a customer token', async (method, path) => {
    const unsigned = await catalog.http[method](path).expect(401);
    const asVendor = await catalog.http[method](path)
      .set(...bearer(owner))
      .expect(403);

    expect(codeOf(unsigned.body)).toBe('UNAUTHORIZED');
    expect(codeOf(asVendor.body)).toBe('FORBIDDEN');
  });
});
