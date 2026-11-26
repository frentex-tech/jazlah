import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { FakeCartAddresses } from '../domain/fakes/fake-cart-addresses.fake';
import { FakeCartCatalog } from '../domain/fakes/fake-cart-catalog.fake';
import { FakeCartScheduling } from '../domain/fakes/fake-cart-scheduling.fake';
import { FakeCartSettings } from '../domain/fakes/fake-cart-settings.fake';
import { InMemoryCartRepository } from '../domain/fakes/in-memory-cart.repository.fake';
import { AddCartItemUseCase } from './add-cart-item.use-case';
import { CartPricer } from './cart-pricer';
import { ClearCartUseCase } from './clear-cart.use-case';
import { SetCartFulfilmentUseCase } from './set-cart-fulfilment.use-case';

const USER = 'user-1';
const DAY = '2026-11-28';

function setUp() {
  const carts = new InMemoryCartRepository();
  const catalog = new FakeCartCatalog();
  const settings = new FakeCartSettings();
  const scheduling = new FakeCartScheduling();
  const addresses = new FakeCartAddresses();
  const transactions = { run: <T>(work: () => Promise<T>) => work() };
  const pricer = new CartPricer(catalog, settings, scheduling);
  settings.settings = {
    ...settings.settings,
    deliveryFee: Money.of(2_500),
  };
  catalog.set('naimi', { vendorId: 'v1', unitPriceHalalas: 10_000 });
  addresses.set(USER, 'home', true);
  addresses.set(USER, 'far', false);
  const add = new AddCartItemUseCase(
    carts,
    catalog,
    settings,
    transactions,
    pricer,
  );
  const useCase = new SetCartFulfilmentUseCase(
    carts,
    catalog,
    settings,
    scheduling,
    addresses,
    transactions,
    pricer,
  );
  const clear = new ClearCartUseCase(carts, settings, transactions, pricer);
  return { carts, catalog, settings, scheduling, add, useCase, clear };
}

const addNaimi = (add: AddCartItemUseCase, productId = 'naimi') =>
  add.execute(
    USER,
    {
      choice: {
        productId,
        sizeId: 's',
        cuttingStyleId: null,
        packaging: null,
        exclusionItemIds: [],
        notes: null,
      },
      quantity: 1,
    },
    false,
  );

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

describe('SetCartFulfilmentUseCase', () => {
  it('chooses delivery to a covered address: the fee and the window show, the day is checked as ready meat', async () => {
    const { carts, scheduling, add, useCase } = setUp();
    await addNaimi(add);

    const cart = await useCase.execute(USER, {
      method: 'delivery',
      addressId: 'home',
      date: DAY,
    });

    expect(carts.locks).toBe(2);
    expect(cart.fulfilment).toEqual({
      method: 'delivery',
      addressId: 'home',
      date: DAY,
      window: { start: '16:00', end: '22:00' },
      pickupPoint: null,
    });
    expect(cart.deliveryFee.halalas).toBe(2_500);
    expect(cart.total.halalas).toBe(12_500);
    expect(scheduling.requests).toEqual([
      {
        vendorId: 'v1',
        method: 'delivery',
        orderTypes: ['ready_meat'],
        date: DAY,
      },
    ]);
  });

  it('chooses pickup: no fee, the pickup point shows', async () => {
    const { add, useCase } = setUp();
    await addNaimi(add);

    const cart = await useCase.execute(USER, {
      method: 'pickup',
      addressId: null,
      date: DAY,
    });

    expect(cart.fulfilment).toMatchObject({
      method: 'pickup',
      addressId: null,
      window: null,
      pickupPoint: { name: { ar: 'v1', en: 'v1' }, hours: null },
    });
    expect(cart.deliveryFee.halalas).toBe(0);
  });

  it('is CART_EMPTY for an empty cart', async () => {
    const { useCase } = setUp();

    const error = await failure(
      useCase.execute(USER, { method: 'pickup', addressId: null, date: DAY }),
    );

    expect(error?.code).toBe(ErrorCode.CART_EMPTY);
  });

  it('is FULFILMENT_NOT_SUPPORTED when a product does not allow the method', async () => {
    const { catalog, add, useCase } = setUp();
    catalog.set('naimi', { fulfilment: 'pickup' });
    await addNaimi(add);

    const error = await failure(
      useCase.execute(USER, {
        method: 'delivery',
        addressId: 'home',
        date: DAY,
      }),
    );

    expect(error?.code).toBe(ErrorCode.FULFILMENT_NOT_SUPPORTED);
  });

  it('is NOT_FOUND for an address not the customer’s, ADDRESS_NOT_COVERED outside every zone', async () => {
    const { add, useCase } = setUp();
    await addNaimi(add);

    const missing = await failure(
      useCase.execute(USER, {
        method: 'delivery',
        addressId: 'other',
        date: DAY,
      }),
    );
    const far = await failure(
      useCase.execute(USER, {
        method: 'delivery',
        addressId: 'far',
        date: DAY,
      }),
    );

    expect(missing?.code).toBe(ErrorCode.NOT_FOUND);
    expect(far?.code).toBe(ErrorCode.ADDRESS_NOT_COVERED);
  });

  it('passes on DAY_FULL and DAY_NOT_AVAILABLE, nothing saved', async () => {
    const { carts, scheduling, add, useCase } = setUp();
    await addNaimi(add);
    scheduling.full.add(DAY);
    scheduling.unavailable.set('2026-11-27', 'PAST_CUTOFF');

    const full = await failure(
      useCase.execute(USER, { method: 'pickup', addressId: null, date: DAY }),
    );
    const late = await failure(
      useCase.execute(USER, {
        method: 'pickup',
        addressId: null,
        date: '2026-11-27',
      }),
    );

    expect(full?.code).toBe(ErrorCode.DAY_FULL);
    expect(late?.code).toBe(ErrorCode.DAY_NOT_AVAILABLE);
    expect(late?.details).toEqual({ reason: 'PAST_CUTOFF' });
    expect((await carts.findByUser(USER))?.fulfilment).toBeNull();
  });

  it('refuses while orders are paused', async () => {
    const { settings, add, useCase } = setUp();
    await addNaimi(add);
    settings.pause();

    const error = await failure(
      useCase.execute(USER, { method: 'pickup', addressId: null, date: DAY }),
    );

    expect(error?.code).toBe(ErrorCode.ORDERING_PAUSED);
  });

  it('is dropped when the cart is emptied or replaced by another store', async () => {
    const { carts, catalog, add, useCase, clear } = setUp();
    await addNaimi(add);
    await useCase.execute(USER, {
      method: 'pickup',
      addressId: null,
      date: DAY,
    });
    await clear.execute(USER);
    expect((await carts.findByUser(USER))?.fulfilment).toBeNull();

    await addNaimi(add);
    await useCase.execute(USER, {
      method: 'pickup',
      addressId: null,
      date: DAY,
    });
    catalog.set('harri', { vendorId: 'v2' });
    await add.execute(
      USER,
      {
        choice: {
          productId: 'harri',
          sizeId: 's',
          cuttingStyleId: null,
          packaging: null,
          exclusionItemIds: [],
          notes: null,
        },
        quantity: 1,
      },
      true,
    );
    expect((await carts.findByUser(USER))?.fulfilment).toBeNull();
  });
});
