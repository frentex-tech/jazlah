import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartScheduling } from '../domain/fakes/fake-cart-scheduling.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { LockCartForCheckoutUseCase } from './lock-cart-for-checkout.use-case';

const USER = 'user-1';
const CHOICE = {
  productId: 'naimi',
  sizeId: 's',
  cuttingStyleId: null,
  packaging: null,
  exclusionItemIds: [],
  notes: null,
};

function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const pricer = new CartPricer(catalog, settings, new FakeCartScheduling());
  const add = new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    { run: (work) => work() },
    pricer,
  );
  return {
    carts,
    catalog,
    add,
    useCase: new LockCartForCheckoutUseCase(carts, pricer),
  };
}

describe('LockCartForCheckoutUseCase', () => {
  it('locks the cart row and prices what was read under the lock', async () => {
    const { carts, catalog, add, useCase } = setUp();
    catalog.set('naimi', {});
    await add.execute(USER, { choice: CHOICE, quantity: 2 }, false);
    const locksBefore = carts.locks;

    const cart = await useCase.execute(USER);

    expect(carts.locks).toBe(locksBefore + 1);
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.line.quantity).toBe(2);
    expect(cart.issues).toEqual([]);
  });

  it('shows a price that moved since the line was added as an issue, not as the accepted price', async () => {
    const { catalog, add, useCase } = setUp();
    catalog.set('naimi', {});
    await add.execute(USER, { choice: CHOICE, quantity: 1 }, false);
    const accepted = (await useCase.execute(USER)).lines[0]?.line.unitPrice;
    catalog.set('naimi', {
      unitPriceHalalas: (accepted?.halalas ?? 0) + 500,
    });

    const cart = await useCase.execute(USER);

    expect(cart.issues).toMatchObject([{ code: 'PRICE_CHANGED' }]);
    expect(cart.lines[0]?.line.unitPrice).toEqual(accepted);
  });

  it('answers an empty cart, made under the lock, for a customer who has none', async () => {
    const { carts, useCase } = setUp();

    const cart = await useCase.execute(USER);

    expect(cart.vendorId).toBeNull();
    expect(cart.lines).toEqual([]);
    expect(carts.locks).toBe(1);
  });
});
