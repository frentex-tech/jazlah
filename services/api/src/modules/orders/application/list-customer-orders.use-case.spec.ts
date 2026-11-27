import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import { ListCustomerOrdersUseCase } from './list-customer-orders.use-case';

const ALL = { cursor: null, limit: 10 } as const;

async function setUp() {
  const orders = new InMemoryOrderRepository();
  const at = (minute: number) => new Date(Date.UTC(2026, 10, 26, 10, minute));
  await placeTestOrder(orders, { number: 'JZ-1', status: 'new', at: at(1) });
  await placeTestOrder(orders, {
    number: 'JZ-2',
    status: 'delivered',
    at: at(2),
  });
  await placeTestOrder(orders, {
    number: 'JZ-3',
    status: 'cancelled',
    at: at(3),
  });
  await placeTestOrder(orders, {
    number: 'JZ-4',
    status: 'delivery_failed',
    at: at(4),
  });
  await placeTestOrder(orders, {
    number: 'JZ-5',
    userId: 'user-2',
    status: 'new',
    at: at(5),
  });
  return new ListCustomerOrdersUseCase(orders);
}

const numbersOf = (page: { items: readonly { number: string }[] }) =>
  page.items.map((order) => order.number);

describe('ListCustomerOrdersUseCase', () => {
  it("lists only the customer's orders, newest first", async () => {
    const page = await (await setUp()).execute('user-1', undefined, ALL);

    expect(numbersOf(page)).toEqual(['JZ-4', 'JZ-3', 'JZ-2', 'JZ-1']);
    expect(page.nextCursor).toBeNull();
  });

  it('keeps `current` for what is not final and `past` for what is', async () => {
    const useCase = await setUp();

    expect(numbersOf(await useCase.execute('user-1', 'current', ALL))).toEqual([
      'JZ-4',
      'JZ-1',
    ]);
    expect(numbersOf(await useCase.execute('user-1', 'past', ALL))).toEqual([
      'JZ-3',
      'JZ-2',
    ]);
  });

  it('pages without a duplicate or a gap', async () => {
    const useCase = await setUp();

    const first = await useCase.execute('user-1', undefined, {
      cursor: null,
      limit: 2,
    });
    const second = await useCase.execute('user-1', undefined, {
      cursor: first.nextCursor,
      limit: 2,
    });

    expect(numbersOf(first)).toEqual(['JZ-4', 'JZ-3']);
    expect(numbersOf(second)).toEqual(['JZ-2', 'JZ-1']);
    expect(second.nextCursor).toBeNull();
  });

  it('answers an empty page for a customer with no orders', async () => {
    const page = await (await setUp()).execute('user-9', undefined, ALL);

    expect(page).toEqual({ items: [], nextCursor: null });
  });
});
