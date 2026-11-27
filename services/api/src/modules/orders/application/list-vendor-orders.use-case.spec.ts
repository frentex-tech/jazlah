import { InMemoryOrderRepository } from '../domain/fakes/in-memory-order.repository.fake';
import { placeTestOrder } from '../domain/fakes/place-test-order.fake';
import { ListVendorOrdersUseCase } from './list-vendor-orders.use-case';

const ALL = { cursor: null, limit: 10 } as const;

async function setUp() {
  const orders = new InMemoryOrderRepository();
  const at = (minute: number) => new Date(Date.UTC(2026, 10, 26, 10, minute));
  await placeTestOrder(orders, { number: 'JZ-1', at: at(1) });
  await placeTestOrder(orders, {
    number: 'JZ-2',
    paymentMethod: 'mada',
    status: 'confirmed',
    fulfilmentDate: '2026-11-29',
    customerName: 'Sara',
    at: at(2),
  });
  await placeTestOrder(orders, {
    number: 'JZ-3',
    vendorId: 'vendor-2',
    at: at(3),
  });
  return new ListVendorOrdersUseCase(orders);
}

const numbersOf = (page: { items: readonly { number: string }[] }) =>
  page.items.map((order) => order.number);

describe('ListVendorOrdersUseCase', () => {
  it("lists only the store's orders, newest first", async () => {
    const page = await (await setUp()).execute('vendor-1', {}, ALL);

    expect(numbersOf(page)).toEqual(['JZ-2', 'JZ-1']);
  });

  it("never lists another store's orders, whatever the filter asks", async () => {
    // A caller that sends a store anyway (the type refuses it in a literal).
    const smuggled = { status: undefined, vendorId: 'vendor-2' };
    const page = await (await setUp()).execute('vendor-1', smuggled, ALL);

    expect(numbersOf(page)).toEqual(['JZ-2', 'JZ-1']);
  });

  it('narrows by status, method, day and search', async () => {
    const useCase = await setUp();

    expect(
      numbersOf(await useCase.execute('vendor-1', { status: 'new' }, ALL)),
    ).toEqual(['JZ-1']);
    expect(
      numbersOf(
        await useCase.execute('vendor-1', { paymentMethod: 'mada' }, ALL),
      ),
    ).toEqual(['JZ-2']);
    expect(
      numbersOf(
        await useCase.execute(
          'vendor-1',
          { fulfilmentDate: '2026-11-29' },
          ALL,
        ),
      ),
    ).toEqual(['JZ-2']);
    expect(
      numbersOf(await useCase.execute('vendor-1', { search: 'sara' }, ALL)),
    ).toEqual(['JZ-2']);
  });
});
