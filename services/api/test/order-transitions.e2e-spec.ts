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
import { CheckoutSteps, type PlacedOrderBody } from './support/checkout-steps';
import { createHttpApp } from './support/create-http-app';
import { holdRowLock } from './support/row-lock';
import { sent } from './support/sent-request';
import { VendorJourney, type TestUser } from './support/vendor-journey';

type OrderBody = {
  id: string;
  status: string;
  allowedTransitions: string[];
  cancelReason: string | null;
  history: {
    from: string | null;
    to: string;
    actorType: string;
    note: string | null;
    at: string;
  }[];
};

type StatusEvent = {
  orderId: string;
  from: string;
  to: string;
  actorType: string;
};

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

/**
 * The API's state machine for both dashboard audiences: transitions, history, event
 * timing, saved-address locks, capacity release and the row lock under concurrent moves.
 */
describe('Order transitions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let vendors: VendorJourney;
  let catalog: CatalogJourney;
  let checkout: CheckoutSteps;
  let admin: TestUser;
  let owner: TestUser;
  let otherOwner: TestUser;
  let vendorId: string;
  let otherVendorId: string;
  let options: CatalogOptions;
  let productId: string;
  const vendorIds: string[] = [];
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
    checkout = new CheckoutSteps(vendors, catalog);
    const first = await vendors.approvedVendor('order-transitions-main');
    const second = await vendors.approvedVendor('order-transitions-other');
    admin = first.admin;
    owner = first.owner;
    otherOwner = second.owner;
    vendorId = first.vendorId;
    otherVendorId = second.vendorId;
    vendorIds.push(vendorId, otherVendorId);
    options = await catalog.options(admin);
    productId = await catalog.published(owner, admin, options);
    const zone = await catalog.http
      .post('/v1/admin/coverage-zones')
      .set(...bearer(admin))
      .send({
        name: { ar: 'منطقة انتقال الطلب', en: 'Order transition zone' },
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
    const orders = await prisma.order.findMany({
      where: { vendorId: { in: vendorIds } },
      select: { id: true },
    });
    await prisma.auditLog.deleteMany({
      where: {
        action: 'orders.status.transitioned',
        entityId: { in: orders.map((order) => order.id) },
      },
    });
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

  async function ready(
    label: string,
    method: 'delivery' | 'pickup' = 'delivery',
  ): Promise<{ user: TestUser; date: string }> {
    const user = await checkout.namedCustomer(label);
    await checkout.addToCart(user, productId, options, 1);
    const date = await checkout.chooseFulfilment(
      user,
      method,
      'first',
      undefined,
      method === 'delivery' ? INSIDE : undefined,
    );
    return { user, date };
  }

  async function place(
    label: string,
    method: 'delivery' | 'pickup' = 'delivery',
  ): Promise<{
    user: TestUser;
    date: string;
    order: PlacedOrderBody['order'];
  }> {
    const { user, date } = await ready(label, method);
    const response = await checkout.place(user).expect(201);
    return {
      user,
      date,
      order: (response.body as PlacedOrderBody).order,
    };
  }

  const vendorTransition = (
    user: TestUser,
    orderId: string,
    body: object,
  ): request.Test =>
    vendors.http
      .post(`/v1/vendor/orders/${orderId}/transition`)
      .set(...bearer(user))
      .send(body);

  const adminTransition = (orderId: string, body: object): request.Test =>
    vendors.http
      .post(`/v1/admin/orders/${orderId}/transition`)
      .set(...bearer(admin))
      .send(body);

  async function vendorOrder(
    user: TestUser,
    orderId: string,
  ): Promise<OrderBody> {
    const response = await vendors.http
      .get(`/v1/vendor/orders/${orderId}`)
      .set(...bearer(user))
      .expect(200);
    return response.body as OrderBody;
  }

  async function adminOrder(orderId: string): Promise<OrderBody> {
    const response = await vendors.http
      .get(`/v1/admin/orders/${orderId}`)
      .set(...bearer(admin))
      .expect(200);
    return response.body as OrderBody;
  }

  async function bookedOn(date: string): Promise<number> {
    const row = await prisma.dayCapacity.findUnique({
      where: {
        vendorId_date: { vendorId, date: new Date(`${date}T00:00:00Z`) },
      },
    });
    return row?.ordersBooked ?? 0;
  }

  it('moves a delivery order through the vendor flow and publishes each committed history row', async () => {
    const { order } = await place('ot-delivery-flow');
    const initial = await vendorOrder(owner, order.id);
    expect(initial.allowedTransitions).toEqual(['confirmed', 'cancelled']);

    const emitter = app.get(EventEmitter2);
    const observed: StatusEvent[] = [];
    const listener = (event: StatusEvent) => {
      if (event.orderId === order.id) {
        observed.push(event);
      }
    };
    emitter.on('order.status.changed', listener);

    try {
      for (const [index, to] of [
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'out_for_delivery',
        'delivered',
      ].entries()) {
        const moved = await vendorTransition(owner, order.id, { to }).expect(
          200,
        );
        expect((moved.body as OrderBody).status).toBe(to);
        expect(observed).toHaveLength(index + 1);
        expect(
          await prisma.orderStatusHistory.count({
            where: { orderId: order.id },
          }),
        ).toBe(index + 2);
      }
    } finally {
      emitter.off('order.status.changed', listener);
    }

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { history: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } },
    });
    expect(saved.history.map((entry) => entry.toStatus)).toEqual([
      'new',
      'confirmed',
      'preparing',
      'ready',
      'picked_up',
      'out_for_delivery',
      'delivered',
    ]);
    expect(saved.history).toHaveLength(7);
    expect(saved.updatedAt.getTime()).toBe(
      saved.history.at(-1)?.createdAt.getTime(),
    );
    expect(observed.map((event) => [event.from, event.to])).toEqual([
      ['new', 'confirmed'],
      ['confirmed', 'preparing'],
      ['preparing', 'ready'],
      ['ready', 'picked_up'],
      ['picked_up', 'out_for_delivery'],
      ['out_for_delivery', 'delivered'],
    ]);
  });

  it('allows admin transitions through the pickup flow and never offers delivery steps', async () => {
    const { order } = await place('ot-pickup-flow', 'pickup');
    expect((await adminOrder(order.id)).allowedTransitions).toEqual([
      'confirmed',
      'cancelled',
    ]);

    for (const to of ['confirmed', 'preparing', 'ready']) {
      const moved = await adminTransition(order.id, { to }).expect(200);
      expect((moved.body as OrderBody).status).toBe(to);
    }
    expect((await adminOrder(order.id)).allowedTransitions).toEqual([
      'collected',
    ]);
    const collected = await adminTransition(order.id, {
      to: 'collected',
    }).expect(200);
    expect((collected.body as OrderBody).status).toBe('collected');
    expect((collected.body as OrderBody).allowedTransitions).toEqual([]);
    expect(
      await prisma.auditLog.count({
        where: {
          actorId: admin.userId,
          action: 'orders.status.transitioned',
          entityId: order.id,
        },
      }),
    ).toBe(4);
  });

  it('requires a rejection note, releases capacity, locks the address until final, and still lets it become default', async () => {
    const { user, date, order } = await place('ot-rejection');
    const address = await prisma.customerAddress.findFirstOrThrow({
      where: { userId: user.userId },
    });
    const booked = await bookedOn(date);
    const addressesPath = '/v1/customer/addresses';
    const addressPath = `${addressesPath}/${address.id}`;
    const secondAddress = await vendors.http
      .post(addressesPath)
      .set(...bearer(user))
      .send({ label: 'العمل', location: INSIDE, isDefault: true })
      .expect(201);

    const listed = await vendors.http
      .get(addressesPath)
      .set(...bearer(user))
      .expect(200);
    const savedAddress = (
      listed.body as { items: { id: string; isLocked: boolean }[] }
    ).items.find((item) => item.id === address.id);
    expect(savedAddress?.isLocked).toBe(true);
    const lockedDefault = await vendors.http
      .post(`${addressPath}/default`)
      .set(...bearer(user))
      .expect(200);
    expect((lockedDefault.body as { isDefault: boolean }).isDefault).toBe(true);
    // The second address was the default until this switch: re-read it, its creation
    // response still says isDefault true.
    const secondAfter = await vendors.http
      .get(`${addressesPath}/${(secondAddress.body as { id: string }).id}`)
      .set(...bearer(user))
      .expect(200);
    expect((secondAfter.body as { isDefault: boolean }).isDefault).toBe(false);
    const updateBlocked = await vendors.http
      .patch(addressPath)
      .set(...bearer(user))
      .send({ label: 'تعديل غير مسموح' })
      .expect(409);
    const deleteBlocked = await vendors.http
      .delete(addressPath)
      .set(...bearer(user))
      .expect(409);
    expect(codeOf(updateBlocked.body)).toBe('ADDRESS_IN_USE');
    expect(codeOf(deleteBlocked.body)).toBe('ADDRESS_IN_USE');

    const missingNote = await vendorTransition(owner, order.id, {
      to: 'cancelled',
    }).expect(400);
    expect(codeOf(missingNote.body)).toBe('VALIDATION_FAILED');
    expect((await vendorOrder(owner, order.id)).status).toBe('new');
    expect(await bookedOn(date)).toBe(booked);

    const rejected = await vendorTransition(owner, order.id, {
      to: 'cancelled',
      note: 'المتجر لا يستطيع تنفيذ الطلب',
    }).expect(200);
    expect(rejected.body).toMatchObject({
      status: 'cancelled',
      cancelReason: 'المتجر لا يستطيع تنفيذ الطلب',
      history: [
        { from: null, to: 'new', actorType: 'customer' },
        {
          from: 'new',
          to: 'cancelled',
          actorType: 'vendor',
          note: 'المتجر لا يستطيع تنفيذ الطلب',
        },
      ],
    });
    expect(await bookedOn(date)).toBe(booked - 1);

    const unlocked = await vendors.http
      .get(addressPath)
      .set(...bearer(user))
      .expect(200);
    expect(unlocked.body).toMatchObject({ isLocked: false, isDefault: true });
    await vendors.http
      .patch(addressPath)
      .set(...bearer(user))
      .send({ label: 'البيت الجديد' })
      .expect(200);
    await vendors.http
      .delete(addressPath)
      .set(...bearer(user))
      .expect(204);
    expect((secondAddress.body as { id: string }).id).not.toBe(address.id);
  });

  it('allows only admin to retry or return a failed delivery', async () => {
    const { order } = await place('ot-delivery-failed');
    for (const to of [
      'confirmed',
      'preparing',
      'ready',
      'picked_up',
      'out_for_delivery',
    ]) {
      await vendorTransition(owner, order.id, { to }).expect(200);
    }
    await vendorTransition(owner, order.id, { to: 'delivery_failed' }).expect(
      200,
    );

    expect((await vendorOrder(owner, order.id)).allowedTransitions).toEqual([]);
    expect((await adminOrder(order.id)).allowedTransitions).toEqual([
      'out_for_delivery',
      'returned',
    ]);
    const vendorRetry = await vendorTransition(owner, order.id, {
      to: 'out_for_delivery',
    }).expect(409);
    expect(codeOf(vendorRetry.body)).toBe('ORDER_TRANSITION_NOT_ALLOWED');
    const invalidAdminMove = await adminTransition(order.id, {
      to: 'delivered',
    }).expect(409);
    expect(codeOf(invalidAdminMove.body)).toBe('ORDER_TRANSITION_NOT_ALLOWED');

    await adminTransition(order.id, { to: 'out_for_delivery' }).expect(200);
    await adminTransition(order.id, { to: 'delivery_failed' }).expect(200);
    const returned = await adminTransition(order.id, { to: 'returned' }).expect(
      200,
    );
    expect((returned.body as OrderBody).status).toBe('returned');
  });

  it('lets an admin reject a COD order with a note, capacity release and audit entry', async () => {
    const { date, order } = await place('ot-admin-rejection', 'pickup');
    const booked = await bookedOn(date);

    const rejected = await adminTransition(order.id, {
      to: 'cancelled',
      note: 'لا يمكن تجهيز الطلب',
    }).expect(200);

    expect(rejected.body).toMatchObject({
      status: 'cancelled',
      cancelReason: 'لا يمكن تجهيز الطلب',
    });
    expect(await bookedOn(date)).toBe(booked - 1);
    expect(
      await prisma.auditLog.count({
        where: {
          actorId: admin.userId,
          action: 'orders.status.transitioned',
          entityId: order.id,
        },
      }),
    ).toBe(1);
  });

  it('keeps another vendor from transitioning an order and refuses customer and anonymous callers', async () => {
    const { user, order } = await place('ot-transition-scope', 'pickup');
    expect(order.vendor.id).toBe(vendorId);
    expect(otherVendorId).not.toBe(vendorId);

    const foreign = await vendors.http
      .post(`/v1/vendor/orders/${order.id}/transition`)
      .set(...bearer(otherOwner))
      .send({ to: 'confirmed' })
      .expect(404);
    const customer = await vendors.http
      .post(`/v1/vendor/orders/${order.id}/transition`)
      .set(...bearer(user))
      .send({ to: 'confirmed' })
      .expect(403);
    const anonymous = await vendors.http
      .post(`/v1/admin/orders/${order.id}/transition`)
      .send({ to: 'confirmed' })
      .expect(401);

    expect(codeOf(foreign.body)).toBe('NOT_FOUND');
    expect(codeOf(customer.body)).toBe('FORBIDDEN');
    expect(codeOf(anonymous.body)).toBe('UNAUTHORIZED');
    expect((await vendorOrder(owner, order.id)).status).toBe('new');
  });

  it('serializes competing moves on the order row; only one transition is committed', async () => {
    const { date, order } = await place('ot-transition-race', 'pickup');
    const booked = await bookedOn(date);
    const lock = await holdRowLock(prisma, 'orders', order.id);
    let confirm!: ReturnType<typeof sent>;
    let reject!: ReturnType<typeof sent>;
    try {
      confirm = sent(vendorTransition(owner, order.id, { to: 'confirmed' }));
      reject = sent(
        vendorTransition(owner, order.id, {
          to: 'cancelled',
          note: 'رفض متزامن',
        }),
      );
      await lock.waitForWaiters(2);
    } finally {
      await lock.release();
    }
    const results = await Promise.all([confirm.response, reject.response]);

    expect(results.map((response) => response.status).sort()).toEqual([
      200, 409,
    ]);
    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { history: true },
    });
    expect(saved.history).toHaveLength(2);
    expect(await bookedOn(date)).toBe(
      saved.status === 'cancelled' ? booked - 1 : booked,
    );
  });
});
