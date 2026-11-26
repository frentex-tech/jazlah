import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { FakeCheckoutCartSource } from '../domain/fakes/fake-checkout-cart-source.fake';
import { FakeCheckoutScheduling } from '../domain/fakes/fake-checkout-scheduling.fake';
import { FakeCheckoutSettings } from '../domain/fakes/fake-checkout-settings.fake';
import { ListCheckoutDaysUseCase } from './list-checkout-days.use-case';

function setUp() {
  const carts = new FakeCheckoutCartSource();
  const scheduling = new FakeCheckoutScheduling();
  const settings = new FakeCheckoutSettings();
  carts.cart = {
    vendorId: 'v1',
    lineFulfilments: ['both', 'delivery'],
    orderTypes: ['ready_meat'],
    total: Money.of(10_000),
  };
  scheduling.days = [
    { date: '2026-11-26', isAvailable: true, reason: null, window: null },
  ];
  return {
    carts,
    scheduling,
    settings,
    useCase: new ListCheckoutDaysUseCase(carts, scheduling, settings),
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

describe('ListCheckoutDaysUseCase', () => {
  it('asks the scheduling engine for the vendor, the method and the kinds of the cart', async () => {
    const { scheduling, useCase } = setUp();

    const days = await useCase.execute('user-1', 'delivery');

    expect(days).toEqual(scheduling.days);
    expect(scheduling.requests).toEqual([
      { vendorId: 'v1', method: 'delivery', orderTypes: ['ready_meat'] },
    ]);
  });

  it('is FULFILMENT_NOT_SUPPORTED when a product does not allow the method', async () => {
    const { useCase } = setUp();

    expect((await failure(useCase.execute('user-1', 'pickup')))?.code).toBe(
      ErrorCode.FULFILMENT_NOT_SUPPORTED,
    );
  });

  it('is FULFILMENT_NOT_SUPPORTED for a line the public cannot see', async () => {
    const { carts, useCase } = setUp();
    carts.cart = { ...carts.cart, lineFulfilments: ['both', null] };

    expect((await failure(useCase.execute('user-1', 'delivery')))?.code).toBe(
      ErrorCode.FULFILMENT_NOT_SUPPORTED,
    );
  });

  it('is CART_EMPTY for an empty cart', async () => {
    const { carts, useCase } = setUp();
    carts.cart = { ...carts.cart, vendorId: null, lineFulfilments: [] };

    expect((await failure(useCase.execute('user-1', 'delivery')))?.code).toBe(
      ErrorCode.CART_EMPTY,
    );
  });

  it('is ORDERING_PAUSED while paused, with the message', async () => {
    const { settings, scheduling, useCase } = setUp();
    settings.paused = {
      isPaused: true,
      messageAr: 'متوقف',
      messageEn: 'Paused',
    };

    const error = await failure(useCase.execute('user-1', 'delivery'));

    expect(error?.code).toBe(ErrorCode.ORDERING_PAUSED);
    expect(error?.details).toEqual({ messageAr: 'متوقف', messageEn: 'Paused' });
    expect(scheduling.requests).toEqual([]);
  });
});
