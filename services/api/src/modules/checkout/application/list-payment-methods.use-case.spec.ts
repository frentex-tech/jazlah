import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { FakeCheckoutCartSource } from '../domain/fakes/fake-checkout-cart-source.fake';
import { FakeCheckoutSettings } from '../domain/fakes/fake-checkout-settings.fake';
import { ListPaymentMethodsUseCase } from './list-payment-methods.use-case';

function setUp() {
  const carts = new FakeCheckoutCartSource();
  const settings = new FakeCheckoutSettings();
  carts.cart = {
    vendorId: 'v1',
    lineFulfilments: ['both'],
    orderTypes: ['ready_meat'],
    total: Money.of(20_000),
  };
  return {
    carts,
    settings,
    useCase: new ListPaymentMethodsUseCase(carts, settings),
  };
}

const COD = [{ method: 'cod', isAvailable: true, reason: null }];

describe('ListPaymentMethodsUseCase', () => {
  it('lists cash on delivery with the total and a wallet balance of 0', async () => {
    const { useCase } = setUp();

    const list = await useCase.execute('user-1');

    expect(list.items).toEqual(COD);
    expect(list.total.halalas).toBe(20_000);
    expect(list.walletBalance.halalas).toBe(0);
  });

  it('keeps cash on delivery at exactly its cap, and leaves it out one halala over', async () => {
    const { settings, useCase } = setUp();
    settings.codRules = { ...settings.codRules, maxOrder: Money.of(20_000) };
    expect((await useCase.execute('user-1')).items).toEqual(COD);

    settings.codRules = { ...settings.codRules, maxOrder: Money.of(19_999) };
    expect((await useCase.execute('user-1')).items).toEqual([]);
  });

  it('leaves cash on delivery out when it is off', async () => {
    const { settings, useCase } = setUp();
    settings.codRules = { ...settings.codRules, enabled: false };

    expect((await useCase.execute('user-1')).items).toEqual([]);
  });

  it('leaves cash on delivery out when a kind of order of the cart does not allow it', async () => {
    const { carts, useCase } = setUp();
    carts.cart = { ...carts.cart, orderTypes: ['ready_meat', 'adha'] };

    expect((await useCase.execute('user-1')).items).toEqual([]);
  });

  it('is CART_EMPTY for an empty cart', async () => {
    const { carts, useCase } = setUp();
    carts.cart = { ...carts.cart, vendorId: null, lineFulfilments: [] };

    const error: unknown = await useCase
      .execute('user-1')
      .catch((caught: unknown) => caught);

    expect(error instanceof AppError ? error.code : error).toBe(
      ErrorCode.CART_EMPTY,
    );
  });
});
