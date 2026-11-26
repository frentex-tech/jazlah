import { Money } from '@common/money/money';
import { FixedClock } from '@common/time/fixed-clock.fake';
import { OrderPlacedEvent } from '../domain/events/order-placed.event';
import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import type { NewOrder } from '../domain/new-order.type';
import { CreateOrderUseCase } from './create-order.use-case';

const REQUEST: NewOrder = {
  userId: 'user-1',
  customer: { name: 'Abdullah', phone: '+966500000001' },
  vendorId: 'vendor-1',
  vendor: {
    name: { ar: 'م', en: 'S' },
    phone: null,
    location: null,
    city: null,
  },
  commissionBasisPoints: 1250,
  orderType: 'ready_meat',
  lines: [
    {
      productId: 'p1',
      sizeId: 's1',
      quantity: 2,
      unitPrice: Money.of(97_000),
      packaging: 'vacuum',
      notes: null,
      imageUrl: null,
      names: {
        name: { ar: 'نعيمي', en: 'Naimi' },
        size: { id: 's1', approxWeightGrams: 8000, tag: null },
        cutting: null,
        exclusions: [],
      },
    },
  ],
  fulfilment: 'pickup',
  fulfilmentDate: '2026-11-28',
  window: null,
  address: null,
  pickupPoint: {
    name: { ar: 'م', en: 'S' },
    address: null,
    location: null,
    phone: null,
    hours: null,
  },
  deliveryFee: Money.zero(),
  paymentMethod: 'cod',
  notes: null,
  carcasses: 0,
};

function build(now: string) {
  const orders = new InMemoryOrderRepository();
  const published: unknown[] = [];
  const useCase = new CreateOrderUseCase(
    orders,
    new FixedClock(new Date(now)),
    { run: <T>(work: () => Promise<T>) => work() },
    { publish: (_class, event) => void published.push(event) },
  );
  return { orders, published, useCase };
}

describe('CreateOrderUseCase', () => {
  it('makes the order with its number, money, first status and first history row', async () => {
    const { useCase, published } = build('2026-11-26T10:00:00Z');

    const order = await useCase.execute(REQUEST);

    expect(order.number).toBe('JZ-261126-0001');
    expect(order.status).toBe('new');
    expect(order.total.halalas).toBe(194_000);
    expect(order.history).toEqual([
      {
        from: null,
        to: 'new',
        actorType: 'customer',
        actorId: 'user-1',
        note: null,
        at: new Date('2026-11-26T10:00:00Z'),
      },
    ]);
    expect(published).toEqual([new OrderPlacedEvent(order.id, 'vendor-1')]);
  });

  it('numbers by the Riyadh day: 22:30 UTC is already the next day in Riyadh', async () => {
    const { useCase } = build('2026-11-26T22:30:00Z');

    expect((await useCase.execute(REQUEST)).number).toBe('JZ-261127-0001');
  });

  it('counts up through the day', async () => {
    const { useCase } = build('2026-11-26T10:00:00Z');

    await useCase.execute(REQUEST);

    expect((await useCase.execute(REQUEST)).number).toBe('JZ-261126-0002');
  });

  it('refuses an order without lines', async () => {
    const { useCase, orders } = build('2026-11-26T10:00:00Z');

    await expect(useCase.execute({ ...REQUEST, lines: [] })).rejects.toThrow(
      RangeError,
    );
    expect(orders.saved).toEqual([]);
  });
});
