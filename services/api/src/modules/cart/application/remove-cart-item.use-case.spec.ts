import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { FakeCartScheduling } from '../domain/fakes/fake-cart-scheduling.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { RemoveCartItemUseCase } from './remove-cart-item.use-case';

const USER = 'user-1';
const choice = (notes: string | null) => ({
  productId: 'naimi',
  sizeId: 'size-1',
  cuttingStyleId: null,
  packaging: null,
  exclusionItemIds: [],
  notes,
});

async function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const transactions = { run: <T>(work: () => Promise<T>) => work() };
  const pricer = new CartPricer(catalog, settings, new FakeCartScheduling());
  catalog.set('naimi', { vendorId: 'v1' });
  const add = new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    transactions,
    pricer,
  );
  await add.execute(USER, { choice: choice(null), quantity: 1 }, false);
  const cart = await add.execute(
    USER,
    { choice: choice('x'), quantity: 1 },
    false,
  );
  return {
    settings,
    useCase: new RemoveCartItemUseCase(carts, settings, transactions, pricer),
    ids: cart.lines.map((line) => line.id),
  };
}

const failure = (promise: Promise<unknown>): Promise<AppError | null> =>
  promise.then(
    () => null,
    (caught: unknown) => {
      if (caught instanceof AppError) {
        return caught;
      }
      throw caught;
    },
  );

describe('RemoveCartItemUseCase', () => {
  it('removes a line; the last one leaves the cart without a store', async () => {
    const { useCase, ids } = await setUp();
    const [first = '', second = ''] = ids;

    const one = await useCase.execute(USER, first);
    expect(one.lines.map((line) => line.id)).toEqual([second]);
    expect(one.vendorId).toBe('v1');

    const none = await useCase.execute(USER, second);
    expect(none.lines).toEqual([]);
    expect(none.vendorId).toBeNull();
    expect(none.canCheckout).toBe(false);
  });

  it('is NOT_FOUND for a line not in the cart, ORDERING_PAUSED while paused', async () => {
    const { settings, useCase, ids } = await setUp();
    expect((await failure(useCase.execute(USER, 'other')))?.code).toBe(
      ErrorCode.NOT_FOUND,
    );

    settings.pause();
    expect((await failure(useCase.execute(USER, ids[0] ?? '')))?.code).toBe(
      ErrorCode.ORDERING_PAUSED,
    );
  });
});
