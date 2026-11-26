import { Money } from '@common/money/money';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { FakeCartScheduling } from '../domain/fakes/fake-cart-scheduling.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { GetCartUseCase } from './get-cart.use-case';

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
    settings,
    add,
    useCase: new GetCartUseCase(carts, pricer),
  };
}

describe('GetCartUseCase', () => {
  it('is an empty cart for a customer who has none, without making one', async () => {
    const { carts, useCase } = setUp();

    const cart = await useCase.execute(USER);

    expect(cart.vendorId).toBeNull();
    expect(cart.lines).toEqual([]);
    expect(cart.total.halalas).toBe(0);
    expect(cart.canCheckout).toBe(false);
    expect(carts.locks).toBe(0);
    expect(await carts.findByUser(USER)).toBeNull();
  });

  it('flags a line that can no longer be ordered, keeping what it showed', async () => {
    const { catalog, add, useCase } = setUp();
    catalog.set('naimi', {});
    await add.execute(USER, { choice: CHOICE, quantity: 1 }, false);
    catalog.products.delete('naimi');

    const cart = await useCase.execute(USER);

    expect(cart.lines[0]?.isAvailable).toBe(false);
    expect(cart.lines[0]?.display.name).toEqual({ ar: 'naimi', en: 'naimi' });
    expect(cart.issues).toEqual([
      { code: 'ITEM_UNAVAILABLE', lineId: cart.lines[0]?.id },
    ]);
    expect(cart.canCheckout).toBe(false);
  });

  it('blocks checkout below the minimum and says how much is missing', async () => {
    const { catalog, settings, add, useCase } = setUp();
    catalog.set('naimi', { unitPriceHalalas: 4_000 });
    settings.settings = { ...settings.settings, minOrder: Money.of(10_000) };
    await add.execute(USER, { choice: CHOICE, quantity: 2 }, false);

    const cart = await useCase.execute(USER);

    expect(cart.minOrderRemaining.halalas).toBe(2_000);
    expect(cart.canCheckout).toBe(false);
  });
});
