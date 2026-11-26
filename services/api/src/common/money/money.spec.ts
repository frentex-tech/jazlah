import { Money } from './money';

const halalas = (amounts: readonly Money[]) =>
  amounts.map((amount) => amount.halalas);

describe('Money', () => {
  describe('of', () => {
    it('holds zero, one halala and large whole amounts', () => {
      expect(Money.of(0).halalas).toBe(0);
      expect(Money.zero().halalas).toBe(0);
      expect(Money.of(1).halalas).toBe(1);
      expect(Money.of(250_000_000).halalas).toBe(250_000_000);
      expect(Money.of(-5).halalas).toBe(-5);
    });

    it.each([0.5, 1.01, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
      'refuses %p',
      (value) => {
        expect(() => Money.of(value)).toThrow(RangeError);
      },
    );
  });

  describe('arithmetic', () => {
    it('adds, subtracts and multiplies by a whole quantity, leaving the operands unchanged', () => {
      const price = Money.of(4_550);
      const extra = Money.of(1);

      expect(price.add(extra).halalas).toBe(4_551);
      expect(price.subtract(extra).halalas).toBe(4_549);
      expect(extra.subtract(price).halalas).toBe(-4_549);
      expect(price.multiply(3).halalas).toBe(13_650);
      expect(price.multiply(0).halalas).toBe(0);
      expect(price.halalas).toBe(4_550);
    });

    it.each([1.5, -1, Number.NaN])('refuses the quantity %p', (quantity) => {
      expect(() => Money.of(100).multiply(quantity)).toThrow(RangeError);
    });

    it('refuses a result beyond a safe whole number', () => {
      expect(() => Money.of(Number.MAX_SAFE_INTEGER).add(Money.of(1))).toThrow(
        RangeError,
      );
    });

    it('sums a list, zero for none, and finds the smallest, null for none', () => {
      const amounts = [Money.of(300), Money.of(1), Money.of(299)];

      expect(Money.sum(amounts).halalas).toBe(600);
      expect(Money.sum([]).halalas).toBe(0);
      expect(Money.min(amounts)?.halalas).toBe(1);
      expect(Money.min([])).toBeNull();
    });

    it('compares', () => {
      expect(Money.of(1).compare(Money.of(2))).toBe(-1);
      expect(Money.of(2).compare(Money.of(2))).toBe(0);
      expect(Money.of(3).compare(Money.of(2))).toBe(1);
      expect(Money.of(2).equals(Money.of(2))).toBe(true);
      expect(Money.of(1).isLessThan(Money.of(2))).toBe(true);
      expect(Money.of(1).isGreaterThan(Money.of(2))).toBe(false);
    });
  });

  describe('multiplyByFraction', () => {
    it('is zero for zero, and for one halala below half', () => {
      expect(Money.zero().multiplyByFraction(15, 115).halalas).toBe(0);
      // 1 × 15 / 115 = 0.13
      expect(Money.of(1).multiplyByFraction(15, 115).halalas).toBe(0);
    });

    it('rounds half up, and exact values stay exact', () => {
      // 23 × 15 / 115 = 3 exactly; 4 × 1 / 8 = 0.5 rounds up to 1; 3 × 1 / 8 = 0.375 down.
      expect(Money.of(23).multiplyByFraction(15, 115).halalas).toBe(3);
      expect(Money.of(4).multiplyByFraction(1, 8).halalas).toBe(1);
      expect(Money.of(3).multiplyByFraction(1, 8).halalas).toBe(0);
      // 11500 × 15 / 115 = 1500; 10001 × 15 / 115 = 1304.478… → 1304; 10005 → 1305.
      expect(Money.of(11_500).multiplyByFraction(15, 115).halalas).toBe(1500);
      expect(Money.of(10_001).multiplyByFraction(15, 115).halalas).toBe(1304);
      expect(Money.of(10_005).multiplyByFraction(15, 115).halalas).toBe(1305);
    });

    it('rounds a negative half toward the larger amount', () => {
      expect(Money.of(-4).multiplyByFraction(1, 8).halalas).toBe(0);
    });

    it('refuses a fraction that is not whole, negative or over zero', () => {
      expect(() => Money.of(1).multiplyByFraction(1.5, 2)).toThrow(RangeError);
      expect(() => Money.of(1).multiplyByFraction(-1, 2)).toThrow(RangeError);
      expect(() => Money.of(1).multiplyByFraction(1, 0)).toThrow(RangeError);
    });
  });

  describe('splitByBasisPoints', () => {
    it('splits evenly when it divides', () => {
      expect(
        halalas(Money.of(1_000).splitByBasisPoints([2_500, 7_500])),
      ).toEqual([250, 750]);
    });

    it('rounds half a halala up and still sums back to the whole', () => {
      const parts = Money.of(1).splitByBasisPoints([5_000, 5_000]);

      expect(halalas(parts)).toEqual([1, 0]);
      expect(Money.sum(parts).halalas).toBe(1);
    });

    it('splits an amount that does not divide evenly, no halala lost or made', () => {
      const parts = Money.of(100).splitByBasisPoints([3_333, 3_333, 3_334]);

      expect(halalas(parts)).toEqual([33, 34, 33]);
      expect(Money.sum(parts).halalas).toBe(100);
    });

    it('never gives a negative part, even with many small shares', () => {
      const shares = [...Array.from({ length: 9 }, () => 1_111), 1];
      const parts = Money.of(7).splitByBasisPoints(shares);

      expect(parts.every((part) => part.halalas >= 0)).toBe(true);
      expect(Money.sum(parts).halalas).toBe(7);
    });

    it('splits zero into zeros', () => {
      expect(halalas(Money.zero().splitByBasisPoints([1_000, 9_000]))).toEqual([
        0, 0,
      ]);
    });

    it.each([
      ['shares not summing to the whole', [5_000, 4_999]],
      ['a fractional share', [5_000.5, 4_999.5]],
      ['a negative share', [-1, 10_001]],
      ['no shares', []],
    ])('refuses %s', (_label, shares) => {
      expect(() => Money.of(100).splitByBasisPoints(shares)).toThrow(
        RangeError,
      );
    });

    it('refuses to split a negative amount', () => {
      expect(() => Money.of(-1).splitByBasisPoints([10_000])).toThrow(
        RangeError,
      );
    });
  });
});
