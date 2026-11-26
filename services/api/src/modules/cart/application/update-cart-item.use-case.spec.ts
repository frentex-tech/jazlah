import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { FakeCartScheduling } from '../domain/fakes/fake-cart-scheduling.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { GetCartUseCase } from './get-cart.use-case';
import { UpdateCartItemUseCase } from './update-cart-item.use-case';

const USER = 'user-1';
const CHOICE = {
  productId: 'naimi',
  sizeId: 'size-1',
  cuttingStyleId: null,
  packaging: null,
  exclusionItemIds: [],
  notes: null,
};

async function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const transactions = { run: <T>(work: () => Promise<T>) => work() };
  const pricer = new CartPricer(catalog, settings, new FakeCartScheduling());
  catalog.set('naimi', { vendorId: 'v1', unitPriceHalalas: 95_000 });
  const added = await new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    transactions,
    pricer,
  ).execute(USER, { choice: CHOICE, quantity: 1 }, false);
  const useCase = new UpdateCartItemUseCase(
    carts,
    catalog,
    settings,
    transactions,
    pricer,
  );
  const lineId = added.lines[0]?.id ?? '';
  return { carts, catalog, settings, useCase, pricer, lineId };
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

describe('UpdateCartItemUseCase', () => {
  it('sets the quantity under the cart lock', async () => {
    const { carts, useCase, lineId } = await setUp();

    const cart = await useCase.execute(USER, lineId, 3);

    expect(carts.locks).toBe(2);
    expect(cart.lines[0]?.line.quantity).toBe(3);
    expect(cart.subtotal.halalas).toBe(285_000);
  });

  it('accepts a changed price when the same quantity is sent, clearing PRICE_CHANGED', async () => {
    const { carts, catalog, useCase, pricer, lineId } = await setUp();
    catalog.set('naimi', { unitPriceHalalas: 97_000 });
    const before = await new GetCartUseCase(carts, pricer).execute(USER);
    expect(before.issues).toEqual([
      {
        code: 'PRICE_CHANGED',
        lineId,
        oldUnitPrice: expect.objectContaining({ halalas: 95_000 }) as unknown,
        newUnitPrice: expect.objectContaining({ halalas: 97_000 }) as unknown,
      },
    ]);
    expect(before.canCheckout).toBe(false);

    const after = await useCase.execute(USER, lineId, 1);

    expect(after.lines[0]?.line.unitPrice.halalas).toBe(97_000);
    expect(after.issues).toEqual([]);
    expect(after.canCheckout).toBe(true);
  });

  it('is NOT_FOUND for a line not in the cart', async () => {
    const { useCase } = await setUp();

    expect((await failure(useCase.execute(USER, 'other', 1)))?.code).toBe(
      ErrorCode.NOT_FOUND,
    );
  });

  it('is SIZE_UNAVAILABLE when the size is switched off, PRODUCT_UNAVAILABLE otherwise', async () => {
    const { catalog, useCase, lineId } = await setUp();
    catalog.set('naimi', { refusals: ['SIZE_UNAVAILABLE'] });
    expect((await failure(useCase.execute(USER, lineId, 2)))?.code).toBe(
      ErrorCode.SIZE_UNAVAILABLE,
    );

    catalog.set('naimi', { refusals: ['OPTION_NOT_IN_PRODUCT'] });
    expect((await failure(useCase.execute(USER, lineId, 2)))?.code).toBe(
      ErrorCode.PRODUCT_UNAVAILABLE,
    );
  });

  it('refuses past 99, and while orders are paused', async () => {
    const { settings, useCase, lineId } = await setUp();
    expect((await failure(useCase.execute(USER, lineId, 100)))?.code).toBe(
      ErrorCode.VALIDATION_FAILED,
    );

    settings.pause();
    expect((await failure(useCase.execute(USER, lineId, 2)))?.code).toBe(
      ErrorCode.ORDERING_PAUSED,
    );
  });
});
