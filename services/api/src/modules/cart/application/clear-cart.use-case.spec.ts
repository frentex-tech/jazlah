import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { ClearCartUseCase } from './clear-cart.use-case';

const USER = 'user-1';

async function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const transactions = { run: <T>(work: () => Promise<T>) => work() };
  const pricer = new CartPricer(catalog, settings);
  catalog.set('naimi', {});
  await new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    transactions,
    pricer,
  ).execute(
    USER,
    {
      choice: {
        productId: 'naimi',
        sizeId: 's',
        cuttingStyleId: null,
        packaging: null,
        exclusionItemIds: [],
        notes: null,
      },
      quantity: 2,
    },
    false,
  );
  return {
    carts,
    settings,
    useCase: new ClearCartUseCase(carts, settings, transactions, pricer),
  };
}

describe('ClearCartUseCase', () => {
  it('empties the cart and its store', async () => {
    const { carts, useCase } = await setUp();

    const cart = await useCase.execute(USER);

    expect(cart.lines).toEqual([]);
    expect(cart.total.halalas).toBe(0);
    const saved = await carts.findByUser(USER);
    expect(saved?.lines).toEqual([]);
    expect(saved?.vendorId).toBeNull();
  });

  it('refuses while orders are paused, nothing changed', async () => {
    const { carts, settings, useCase } = await setUp();
    settings.pause();

    const error: unknown = await useCase.execute(USER).then(
      () => null,
      (caught: unknown) => caught,
    );

    expect(error instanceof AppError ? error.code : error).toBe(
      ErrorCode.ORDERING_PAUSED,
    );
    expect((await carts.findByUser(USER))?.lines).toHaveLength(1);
  });
});
