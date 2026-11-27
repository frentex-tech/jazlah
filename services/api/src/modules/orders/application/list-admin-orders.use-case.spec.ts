import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import { ListAdminOrdersUseCase } from './list-admin-orders.use-case';

const ALL = { cursor: null, limit: 10 } as const;

async function setUp() {
  const orders = new InMemoryOrderRepository();
  const at = (minute: number) => new Date(Date.UTC(2026, 10, 26, 10, minute));
  await placeTestOrder(orders, { number: 'JZ-1', at: at(1) });
  await placeTestOrder(orders, {
    number: 'JZ-2',
    vendorId: 'vendor-2',
    userId: 'user-2',
    status: 'confirmed',
    at: at(2),
  });
  await placeTestOrder(orders, {
    number: 'JZ-3',
    vendorId: 'vendor-2',
    paymentMethod: 'mada',
    at: at(3),
  });
  return new ListAdminOrdersUseCase(orders);
}

const numbersOf = (page: { items: readonly { number: string }[] }) =>
  page.items.map((order) => order.number);

describe('ListAdminOrdersUseCase', () => {
  it('lists every order of every store, newest first', async () => {
    expect(numbersOf(await (await setUp()).execute({}, ALL))).toEqual([
      'JZ-3',
      'JZ-2',
      'JZ-1',
    ]);
  });

  it('narrows by store, status and method', async () => {
    const useCase = await setUp();

    expect(
      numbersOf(await useCase.execute({ vendorId: 'vendor-2' }, ALL)),
    ).toEqual(['JZ-3', 'JZ-2']);
    expect(
      numbersOf(await useCase.execute({ status: 'confirmed' }, ALL)),
    ).toEqual(['JZ-2']);
    expect(
      numbersOf(
        await useCase.execute(
          { vendorId: 'vendor-2', paymentMethod: 'mada' },
          ALL,
        ),
      ),
    ).toEqual(['JZ-3']);
  });

  it('pages without a duplicate or a gap', async () => {
    const useCase = await setUp();

    const first = await useCase.execute({}, { cursor: null, limit: 2 });
    const second = await useCase.execute(
      {},
      { cursor: first.nextCursor, limit: 2 },
    );

    expect(numbersOf(first)).toEqual(['JZ-3', 'JZ-2']);
    expect(numbersOf(second)).toEqual(['JZ-1']);
    expect(second.nextCursor).toBeNull();
  });
});
