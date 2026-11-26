import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import type { LineChoice } from '../domain/line-choice.type';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';

const USER = 'user-1';
const choice = (over: Partial<LineChoice> = {}): LineChoice => ({
  productId: 'naimi',
  sizeId: 'size-1',
  cuttingStyleId: null,
  packaging: null,
  exclusionItemIds: [],
  notes: null,
  ...over,
});

function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const useCase = new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    { run: (work) => work() },
    new CartPricer(catalog, settings),
  );
  catalog.set('naimi', { vendorId: 'v1', unitPriceHalalas: 97_000 });
  return { carts, catalog, settings, useCase };
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

describe('AddCartItemUseCase', () => {
  it('adds a line at the price of today, under the cart lock, and prices the cart', async () => {
    const { carts, useCase } = setUp();

    const cart = await useCase.execute(
      USER,
      { choice: choice(), quantity: 2 },
      false,
    );

    expect(carts.locks).toBe(1);
    expect(cart.vendorId).toBe('v1');
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]?.line.unitPrice.halalas).toBe(97_000);
    expect(cart.subtotal.halalas).toBe(194_000);
    // 194000 × 15 / 115 = 25304.35 → 25304
    expect(cart.vat.halalas).toBe(25_304);
    expect(cart.canCheckout).toBe(true);
  });

  it('adds the same choice to its line, "without" items in any order', async () => {
    const { useCase } = setUp();
    await useCase.execute(
      USER,
      { choice: choice({ exclusionItemIds: ['a', 'b'] }), quantity: 1 },
      false,
    );

    const cart = await useCase.execute(
      USER,
      { choice: choice({ exclusionItemIds: ['b', 'a'] }), quantity: 3 },
      false,
    );

    expect(cart.lines.map((line) => line.line.quantity)).toEqual([4]);
  });

  it('keeps a choice that differs only by its note on its own line', async () => {
    const { useCase } = setUp();
    await useCase.execute(USER, { choice: choice(), quantity: 1 }, false);

    const cart = await useCase.execute(
      USER,
      { choice: choice({ notes: 'بدون شحم' }), quantity: 1 },
      false,
    );

    expect(cart.lines).toHaveLength(2);
  });

  it('refuses past 99 of one choice, nothing changed', async () => {
    const { carts, useCase } = setUp();
    await useCase.execute(USER, { choice: choice(), quantity: 98 }, false);

    const error = await failure(
      useCase.execute(USER, { choice: choice(), quantity: 2 }, false),
    );

    expect(error?.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error?.details).toEqual([
      { field: 'quantity', constraints: ['max'] },
    ]);
    expect((await carts.findByUser(USER))?.lines[0]?.quantity).toBe(98);
  });

  it('refuses the product of another store, naming the store of the cart, unless replacing', async () => {
    const { catalog, useCase } = setUp();
    catalog.set('harri', { vendorId: 'v2', unitPriceHalalas: 50_000 });
    await useCase.execute(USER, { choice: choice(), quantity: 1 }, false);

    const error = await failure(
      useCase.execute(
        USER,
        { choice: choice({ productId: 'harri' }), quantity: 1 },
        false,
      ),
    );
    expect(error?.code).toBe(ErrorCode.CART_VENDOR_MISMATCH);
    expect(error?.details).toEqual({
      vendorId: 'v1',
      vendorName: { ar: 'v1', en: 'v1' },
    });

    const replaced = await useCase.execute(
      USER,
      { choice: choice({ productId: 'harri' }), quantity: 1 },
      true,
    );
    expect(replaced.vendorId).toBe('v2');
    expect(replaced.lines.map((line) => line.line.choice.productId)).toEqual([
      'harri',
    ]);
  });

  it('reports the first refusal in the order of the contract, nothing saved', async () => {
    const { carts, catalog, useCase } = setUp();
    catalog.set('naimi', {
      refusals: ['OPTION_REQUIRED', 'INCOMPATIBLE_CUTTING_PACKAGING'],
    });

    const error = await failure(
      useCase.execute(USER, { choice: choice(), quantity: 1 }, false),
    );

    expect(error?.code).toBe(ErrorCode.INCOMPATIBLE_CUTTING_PACKAGING);
    expect(await carts.findByUser(USER)).toBeNull();
  });

  it('refuses a product the public cannot see', async () => {
    const { useCase } = setUp();

    const error = await failure(
      useCase.execute(
        USER,
        { choice: choice({ productId: 'gone' }), quantity: 1 },
        false,
      ),
    );

    expect(error?.code).toBe(ErrorCode.PRODUCT_UNAVAILABLE);
  });

  it('refuses while orders are paused, with the message of the admin', async () => {
    const { carts, settings, useCase } = setUp();
    settings.pause();

    const error = await failure(
      useCase.execute(USER, { choice: choice(), quantity: 1 }, false),
    );

    expect(error?.code).toBe(ErrorCode.ORDERING_PAUSED);
    expect(error?.details).toEqual({ messageAr: 'متوقف', messageEn: 'Paused' });
    expect(carts.locks).toBe(0);
  });
});
