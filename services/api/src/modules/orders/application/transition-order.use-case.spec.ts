import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { FixedClock } from '@common/time/fixed-clock.fake';
import type { EventPublisher } from '@infra/event-bus/event-publisher';
import type { CapacityRequest } from '@modules/scheduling';
import { OrderStatusChangedEvent } from '../domain/events/order-status-changed.event';
import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import type { OrderRepository } from '../domain/ports/order.repository.port';
import { TransitionOrderUseCase } from './transition-order.use-case';

const ORDER_ID = 'order-1';
const AT = new Date('2026-11-28T12:00:00.000Z');

function build(
  options: {
    releaseFailure?: Error;
    transitionFailure?: Error;
  } = {},
) {
  const orders = new InMemoryOrderRepository();
  let capacity = 1;
  const released: CapacityRequest[] = [];
  const published: unknown[] = [];
  const auditRows: unknown[] = [];
  const transaction = {
    async run<T>(work: () => Promise<T>): Promise<T> {
      const saved = [...orders.saved];
      const capacityBefore = capacity;
      const auditBefore = [...auditRows];
      try {
        return await work();
      } catch (error) {
        orders.saved.splice(0, orders.saved.length, ...saved);
        capacity = capacityBefore;
        auditRows.splice(0, auditRows.length, ...auditBefore);
        throw error;
      }
    },
  };

  const repository: Pick<OrderRepository, 'lockForWrite' | 'transition'> = {
    lockForWrite: (id, vendorId) => orders.lockForWrite(id, vendorId),
    transition: async (change) => {
      const order = await orders.transition(change);
      if (options.transitionFailure !== undefined) {
        throw options.transitionFailure;
      }
      return order;
    },
  };
  const capacityService = {
    release: (request: CapacityRequest): Promise<void> => {
      released.push(request);
      capacity -= 1;
      if (options.releaseFailure !== undefined) {
        return Promise.reject(options.releaseFailure);
      }
      return Promise.resolve();
    },
  };
  const events: Pick<EventPublisher, 'publish'> = {
    publish: (eventClass, event) => {
      published.push({ eventClass, event });
    },
  };
  const useCase = new TransitionOrderUseCase(
    repository,
    capacityService,
    new FixedClock(AT),
    transaction,
    events,
    {
      write: (entry) => {
        auditRows.push(entry);
        return Promise.resolve();
      },
    },
  );

  return {
    orders,
    useCase,
    released,
    published,
    auditRows,
    bookings: () => capacity,
    async place(status: 'new' | 'out_for_delivery' = 'new') {
      return placeTestOrder(orders, {
        number: 'JZ-261128-0001',
        status,
        at: new Date('2026-11-28T11:00:00.000Z'),
      });
    },
  };
}

describe('TransitionOrderUseCase', () => {
  it('moves an order and writes one history row and event with the same timestamp', async () => {
    const kit = build();
    await kit.place();

    const order = await kit.useCase.execute(ORDER_ID, 'confirmed', {
      type: 'admin',
      id: 'admin-1',
    });

    expect(order.status).toBe('confirmed');
    expect(order.history).toHaveLength(2);
    expect(order.history[1]).toMatchObject({
      from: 'new',
      to: 'confirmed',
      actorType: 'admin',
      actorId: 'admin-1',
      note: null,
      at: AT,
    });
    expect(kit.published).toEqual([
      {
        eventClass: OrderStatusChangedEvent,
        event: new OrderStatusChangedEvent(
          ORDER_ID,
          'vendor-1',
          'user-1',
          'new',
          'confirmed',
          'admin',
          AT,
        ),
      },
    ]);
    expect(kit.released).toEqual([]);
    expect(kit.auditRows).toEqual([
      {
        actorId: 'admin-1',
        action: 'orders.status.transitioned',
        entity: 'order',
        entityId: ORDER_ID,
        metadata: { from: 'new', to: 'confirmed' },
      },
    ]);
  });

  it('rejection saves the note as cancelReason and returns capacity', async () => {
    const kit = build();
    await kit.place();

    const order = await kit.useCase.execute(
      ORDER_ID,
      'cancelled',
      { type: 'vendor', id: 'vendor-user', vendorId: 'vendor-1' },
      'المتجر لا يستطيع تنفيذ الطلب',
    );

    expect(order).toMatchObject({
      status: 'cancelled',
      cancelReason: 'المتجر لا يستطيع تنفيذ الطلب',
    });
    expect(order.history).toHaveLength(2);
    expect(order.history[1]).toMatchObject({
      from: 'new',
      to: 'cancelled',
      actorType: 'vendor',
      note: 'المتجر لا يستطيع تنفيذ الطلب',
      at: AT,
    });
    expect(kit.released).toEqual([
      { vendorId: 'vendor-1', date: '2026-11-28', carcasses: 0 },
    ]);
    expect(kit.bookings()).toBe(0);
    expect(kit.auditRows).toEqual([]);
  });

  it('refuses a transition the actor cannot make without releasing capacity or writing history', async () => {
    const kit = build();
    await kit.place('out_for_delivery');

    await expect(
      kit.useCase.execute(ORDER_ID, 'returned', {
        type: 'vendor',
        id: 'vendor-user',
        vendorId: 'vendor-1',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.ORDER_TRANSITION_NOT_ALLOWED });

    expect((await kit.orders.findById(ORDER_ID))?.history).toHaveLength(1);
    expect(kit.released).toEqual([]);
    expect(kit.published).toEqual([]);
    expect(kit.auditRows).toEqual([]);
  });

  it('scopes the locked order to the vendor and returns NOT_FOUND for another store', async () => {
    const kit = build();
    await kit.place();

    await expect(
      kit.useCase.execute(ORDER_ID, 'confirmed', {
        type: 'vendor',
        id: 'another-vendor-user',
        vendorId: 'vendor-2',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect((await kit.orders.findById(ORDER_ID))?.history).toHaveLength(1);
  });

  it('requires a cancellation note even for non-HTTP callers', async () => {
    const kit = build();
    await kit.place();

    await expect(
      kit.useCase.execute(ORDER_ID, 'cancelled', {
        type: 'admin',
        id: 'admin-1',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'note', constraints: ['isNotEmpty'] }],
    });
    expect(kit.released).toEqual([]);
    expect(kit.auditRows).toEqual([]);
  });

  it('reverts capacity, status, history and event when capacity release fails', async () => {
    const failure = new AppError(ErrorCode.INTERNAL_ERROR);
    const kit = build({ releaseFailure: failure });
    await kit.place();

    await expect(
      kit.useCase.execute(
        ORDER_ID,
        'cancelled',
        { type: 'admin', id: 'admin-1' },
        'رفض الطلب',
      ),
    ).rejects.toBe(failure);

    expect(kit.bookings()).toBe(1);
    expect(await kit.orders.findById(ORDER_ID)).toMatchObject({
      status: 'new',
      cancelReason: null,
      history: [{ from: null, to: 'new' }],
    });
    expect(kit.published).toEqual([]);
    expect(kit.auditRows).toEqual([]);
  });

  it('reverts status, history and capacity if persistence fails after a capacity release', async () => {
    const failure = new AppError(ErrorCode.INTERNAL_ERROR);
    const kit = build({ transitionFailure: failure });
    await kit.place();

    await expect(
      kit.useCase.execute(
        ORDER_ID,
        'cancelled',
        { type: 'admin', id: 'admin-1' },
        'رفض الطلب',
      ),
    ).rejects.toBe(failure);

    expect(kit.bookings()).toBe(1);
    expect(await kit.orders.findById(ORDER_ID)).toMatchObject({
      status: 'new',
      cancelReason: null,
      history: [{ from: null, to: 'new' }],
    });
    expect(kit.published).toEqual([]);
    expect(kit.auditRows).toEqual([]);
  });
});
