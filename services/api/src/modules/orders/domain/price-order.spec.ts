import { Money } from '@common/money/money';
import type { NewOrderLine } from './new-order-line.type';
import { priceOrder } from './price-order';

function line(unitHalalas: number, quantity: number): NewOrderLine {
  return {
    productId: 'p',
    sizeId: 's',
    quantity,
    unitPrice: Money.of(unitHalalas),
    packaging: null,
    notes: null,
    imageUrl: null,
    names: {
      name: { ar: 'x', en: 'x' },
      size: { id: 's', approxWeightGrams: 1000, tag: null },
      cutting: null,
      exclusions: [],
    },
  };
}

describe('priceOrder', () => {
  it('sums the lines, adds the delivery fee, and takes the VAT out of the total', () => {
    const priced = priceOrder(
      [line(97_000, 2), line(1_050, 1)],
      Money.of(2_500),
    );

    expect(priced.subtotal.halalas).toBe(195_050);
    expect(priced.discount.halalas).toBe(0);
    expect(priced.total.halalas).toBe(197_550);
    // 197550 x 15 / 115 = 25767.39..., rounded half up
    expect(priced.vat.halalas).toBe(25_767);
  });

  it('rounds the VAT half up at exactly half a halala', () => {
    // 23 x 15 / 115 = 3 exactly; 46 x 15 / 115 = 6; 10 x 15 / 115 = 1.304
    expect(priceOrder([line(10, 1)], Money.zero()).vat.halalas).toBe(1);
    // 100 x 15 / 115 = 13.04 -> 13; 115 x 15 / 115 = 15
    expect(priceOrder([line(115, 1)], Money.zero()).vat.halalas).toBe(15);
  });

  it('is zero for one halala of nothing and keeps one halala exact', () => {
    expect(priceOrder([line(1, 1)], Money.zero()).total.halalas).toBe(1);
    expect(priceOrder([line(1, 1)], Money.zero()).vat.halalas).toBe(0);
  });

  it('charges no delivery fee for pickup (a zero fee)', () => {
    expect(priceOrder([line(5_000, 3)], Money.zero()).total.halalas).toBe(
      15_000,
    );
  });
});
