import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import type { PricedCart, PricedCartLine } from '@modules/cart';
import type { Order } from '@modules/orders';
import { PlaceOrderUseCase } from './place-order.use-case';

const USER = 'user-1';
const KEY = '3c1f8e2a-5b7d-4c9e-a1f0-6d2b8c4e7a90';
const NAME = { ar: 'نعيمي', en: 'Naimi' };

function line(
  id: string,
  overrides: Partial<PricedCartLine> = {},
): PricedCartLine {
  const display = {
    vendorName: { ar: 'م', en: 'S' },
    name: NAME,
    size: { id: 's1', approxWeightGrams: 8000, tag: null },
    cutting: null,
    exclusions: [],
  };
  return {
    id,
    line: {
      id,
      choice: {
        productId: 'p1',
        sizeId: 's1',
        cuttingStyleId: null,
        packaging: 'vacuum',
        exclusionItemIds: [],
        notes: null,
      },
      quantity: 2,
      unitPrice: Money.of(97_000),
      display,
    },
    display,
    imageUrl: null,
    isAvailable: true,
    fulfilment: 'both',
    total: Money.of(194_000),
    ...overrides,
  };
}

function cart(overrides: Partial<PricedCart> = {}): PricedCart {
  return {
    vendorId: 'vendor-1',
    vendorName: { ar: 'م', en: 'S' },
    lines: [line('l1')],
    subtotal: Money.of(194_000),
    discount: Money.zero(),
    deliveryFee: Money.of(2_500),
    total: Money.of(196_500),
    vat: Money.of(25_630),
    minOrder: Money.of(5_000),
    minOrderRemaining: Money.zero(),
    issues: [],
    fulfilment: {
      method: 'delivery',
      addressId: 'a1',
      date: '2026-11-28',
      window: { start: '14:00', end: '22:00' },
      pickupPoint: null,
    },
    orderTypes: ['ready_meat'],
    canCheckout: true,
    ...overrides,
  };
}

type Setup = Readonly<{
  cart: PricedCart;
  fullName: string | null;
  isCovered: boolean;
  addressMissing: boolean;
  paused: boolean;
  cod: { enabled: boolean };
  dayError: AppError | null;
  reserveError: AppError | null;
  accountError: AppError | null;
}>;

function build(setup: Partial<Setup> = {}) {
  const s: Setup = {
    cart: cart(),
    fullName: 'Abdullah',
    isCovered: true,
    addressMissing: false,
    paused: false,
    cod: { enabled: true },
    dayError: null,
    reserveError: null,
    accountError: null,
    ...setup,
  };
  const outcomes = new Map<string, unknown>();
  const created: unknown[] = [];
  const reserved: unknown[] = [];
  let cleared = 0;
  const calls: string[] = [];
  const useCase = new PlaceOrderUseCase(
    { run: <T>(work: () => Promise<T>) => work() },
    {
      runOnce: async <T>(op: string, key: string, work: () => Promise<T>) => {
        const id = `${op}:${key}`;
        if (outcomes.has(id)) {
          return outcomes.get(id) as T;
        }
        const result = await work();
        outcomes.set(id, result);
        return result;
      },
    },
    {
      pause: () =>
        Promise.resolve({
          isPaused: s.paused,
          messageAr: null,
          messageEn: null,
        }),
      cod: () =>
        Promise.resolve({
          enabled: s.cod.enabled,
          maxOrder: null,
          allowedOrderTypes: ['ready_meat'],
        }),
    },
    {
      execute: () => {
        calls.push('cart');
        return Promise.resolve(s.cart);
      },
    },
    {
      execute: () => {
        cleared += 1;
        return Promise.resolve(cart({ lines: [] }));
      },
    },
    {
      lockAccount: () => {
        calls.push('user');
        return s.accountError === null
          ? Promise.resolve({ phone: '+966500000001' })
          : Promise.reject(s.accountError);
      },
      profileOf: () =>
        Promise.resolve({
          fullName: s.fullName,
          email: null,
          preferredLanguage: 'ar',
          isComplete: s.fullName !== null,
        }),
    },
    {
      get: () =>
        s.addressMissing
          ? Promise.reject(new AppError(ErrorCode.NOT_FOUND))
          : Promise.resolve({
              id: 'a1',
              label: 'Home',
              location: { latitude: 24.7, longitude: 46.7 },
              isDefault: true,
              isCovered: s.isCovered,
              city: 'Riyadh',
              district: null,
              street: null,
              building: null,
              shortNationalAddress: null,
              driverInstructions: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
    },
    {
      storeOf: () =>
        Promise.resolve({
          id: 'vendor-1',
          name: { ar: 'م', en: 'S' },
          city: 'Riyadh',
          location: null,
          contactPhone: '+966500000002',
        }),
      commissionBasisPointsOf: () => Promise.resolve(1250),
    },
    {
      assertDayAvailable: () =>
        s.dayError === null
          ? Promise.resolve({
              date: '2026-11-28',
              isAvailable: true,
              reason: null,
              window: { start: '14:00', end: '22:00' },
            })
          : Promise.reject(s.dayError),
      pickupTerms: () =>
        Promise.resolve({
          isOffered: true,
          window: { start: '14:00', end: '22:00' },
          point: {
            name: { ar: 'م', en: 'S' },
            address: { ar: 'الرياض', en: 'Riyadh' },
            location: null,
            phone: '+966500000002',
            hours: null,
          },
        }),
    },
    {
      reserve: (request) => {
        reserved.push(request);
        return s.reserveError === null
          ? Promise.resolve()
          : Promise.reject(s.reserveError);
      },
    },
    {
      execute: (request) => {
        created.push(request);
        return Promise.resolve({ id: `order-${created.length}` } as Order);
      },
    },
    {
      execute: (_user, id) => Promise.resolve({ id } as Order),
    },
  );
  return { useCase, created, reserved, calls, cleared: () => cleared };
}

const BODY = { paymentMethod: 'cod' };

async function code(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error instanceof AppError
      ? { code: error.code, details: error.details }
      : error;
  }
  return 'no error';
}

describe('PlaceOrderUseCase', () => {
  it('places a delivery order from the server cart, snapshots it and empties the cart', async () => {
    const { useCase, created, reserved, cleared } = build();

    const order = await useCase.execute(USER, KEY, {
      ...BODY,
      notes: 'call me',
    });

    expect(order.id).toBe('order-1');
    expect(cleared()).toBe(1);
    expect(reserved).toEqual([
      { vendorId: 'vendor-1', date: '2026-11-28', carcasses: 0 },
    ]);
    expect(created[0]).toMatchObject({
      userId: USER,
      customer: { name: 'Abdullah', phone: '+966500000001' },
      commissionBasisPoints: 1250,
      orderType: 'ready_meat',
      fulfilment: 'delivery',
      window: { start: '14:00', end: '22:00' },
      address: { label: 'Home', city: 'Riyadh' },
      pickupPoint: null,
      paymentMethod: 'cod',
      notes: 'call me',
      vendor: { phone: '+966500000002' },
    });
    expect(created[0]).toMatchObject({
      deliveryFee: Money.of(2_500),
      lines: [
        { quantity: 2, unitPrice: Money.of(97_000), packaging: 'vacuum' },
      ],
    });
  });

  it('places a pickup order with the pickup point and no address or window', async () => {
    const { useCase, created } = build({
      cart: cart({
        deliveryFee: Money.zero(),
        fulfilment: {
          method: 'pickup',
          addressId: null,
          date: '2026-11-28',
          window: null,
          pickupPoint: null,
        },
      }),
    });

    await useCase.execute(USER, KEY, BODY);

    expect(created[0]).toMatchObject({
      fulfilment: 'pickup',
      window: null,
      address: null,
      pickupPoint: { phone: '+966500000002', hours: null },
      deliveryFee: Money.zero(),
    });
  });

  it('answers the first order again for the same key and body, placing nothing twice', async () => {
    const { useCase, created, reserved } = build();

    const first = await useCase.execute(USER, KEY, BODY);
    const again = await useCase.execute(USER, KEY, { ...BODY });

    expect(again.id).toBe(first.id);
    expect(created).toHaveLength(1);
    expect(reserved).toHaveLength(1);
  });

  it('refuses the same key with another body: IDEMPOTENCY_KEY_REUSED', async () => {
    const { useCase } = build();
    await useCase.execute(USER, KEY, BODY);

    expect(
      await code(useCase.execute(USER, KEY, { ...BODY, notes: 'other' })),
    ).toMatchObject({ code: ErrorCode.IDEMPOTENCY_KEY_REUSED });
  });

  it('keeps one key of two customers apart', async () => {
    const { useCase, created } = build();

    await useCase.execute('user-1', KEY, BODY);
    await useCase.execute('user-2', KEY, BODY);

    expect(created).toHaveLength(2);
  });

  it.each([
    ['ORDERING_PAUSED', { paused: true }],
    ['CART_EMPTY', { cart: cart({ vendorId: null, lines: [] }) }],
    ['PROFILE_INCOMPLETE', { fullName: null }],
    [
      'ACCOUNT_DISABLED',
      { accountError: new AppError(ErrorCode.ACCOUNT_DISABLED) },
    ],
    [
      'ITEM_UNAVAILABLE',
      { cart: cart({ issues: [{ code: 'ITEM_UNAVAILABLE', lineId: 'l1' }] }) },
    ],
    [
      'PRICE_CHANGED',
      {
        cart: cart({
          issues: [
            {
              code: 'PRICE_CHANGED',
              lineId: 'l1',
              oldUnitPrice: Money.of(97_000),
              newUnitPrice: Money.of(99_000),
            },
          ],
        }),
      },
    ],
    ['MIN_ORDER_NOT_MET', { cart: cart({ minOrderRemaining: Money.of(100) }) }],
    ['FULFILMENT_REQUIRED', { cart: cart({ fulfilment: null }) }],
    [
      'FULFILMENT_NOT_SUPPORTED',
      { cart: cart({ lines: [line('l1', { fulfilment: 'pickup' })] }) },
    ],
    ['ADDRESS_NOT_COVERED', { isCovered: false }],
    ['FULFILMENT_REQUIRED', { addressMissing: true }],
    [
      'DAY_NOT_AVAILABLE',
      { dayError: new AppError(ErrorCode.DAY_NOT_AVAILABLE) },
    ],
    ['DAY_FULL', { reserveError: new AppError(ErrorCode.DAY_FULL) }],
    ['PAYMENT_METHOD_NOT_AVAILABLE', { cod: { enabled: false } }],
  ] as const)('refuses with %s and places nothing', async (expected, setup) => {
    const { useCase, created, cleared } = build(setup);

    expect(await code(useCase.execute(USER, KEY, BODY))).toMatchObject({
      code: expected,
    });
    expect(created).toHaveLength(0);
    expect(cleared()).toBe(0);
  });

  it('names the failing lines of ITEM_UNAVAILABLE and the minimum of MIN_ORDER_NOT_MET', async () => {
    const unavailable = build({
      cart: cart({ issues: [{ code: 'ITEM_UNAVAILABLE', lineId: 'l1' }] }),
    });
    const minimum = build({
      cart: cart({ minOrderRemaining: Money.of(100) }),
    });

    expect(await code(unavailable.useCase.execute(USER, KEY, BODY))).toEqual({
      code: ErrorCode.ITEM_UNAVAILABLE,
      details: { lineIds: ['l1'] },
    });
    expect(await code(minimum.useCase.execute(USER, KEY, BODY))).toEqual({
      code: ErrorCode.MIN_ORDER_NOT_MET,
      details: { minOrderHalalas: 5_000, remainingHalalas: 100 },
    });
  });

  it.each(['mada', 'card', 'applepay', 'wallet'])(
    'refuses %s: only cash on delivery is offered',
    async (method) => {
      const { useCase } = build();

      expect(
        await code(useCase.execute(USER, KEY, { paymentMethod: method })),
      ).toEqual({
        code: ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE,
        details: { method },
      });
    },
  );

  it('refuses a wallet part: the balance is 0', async () => {
    const { useCase } = build();

    expect(
      await code(
        useCase.execute(USER, KEY, { ...BODY, walletAmountHalalas: 100 }),
      ),
    ).toEqual({
      code: ErrorCode.WALLET_INSUFFICIENT,
      details: { balanceHalalas: 0 },
    });
  });

  it('locks the user row before the cart row, and a disabled customer is refused before the cart is read, for pickup as for delivery', async () => {
    const ok = build();
    await ok.useCase.execute(USER, KEY, BODY);
    const pickup = build({
      accountError: new AppError(ErrorCode.ACCOUNT_DISABLED),
      cart: cart({
        deliveryFee: Money.zero(),
        fulfilment: {
          method: 'pickup',
          addressId: null,
          date: '2026-11-28',
          window: null,
          pickupPoint: null,
        },
      }),
    });

    expect(ok.calls.slice(0, 2)).toEqual(['user', 'cart']);
    expect(await code(pickup.useCase.execute(USER, KEY, BODY))).toMatchObject({
      code: ErrorCode.ACCOUNT_DISABLED,
    });
    expect(pickup.calls).toEqual(['user']);
  });

  it('takes no capacity when a check before it refuses', async () => {
    const { useCase, reserved } = build({ isCovered: false });

    await code(useCase.execute(USER, KEY, BODY));

    expect(reserved).toHaveLength(0);
  });
});
