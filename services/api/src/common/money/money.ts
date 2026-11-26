import { BASIS_POINTS_WHOLE } from './basis-points.constants';

/**
 * An amount of money: a whole number of halalas (1 SAR = 100 halalas), immutable. All
 * arithmetic on amounts goes through this class (invariants.md, Money): no `/ 100`,
 * `* 100` or `Math.round` on an amount anywhere else.
 *
 * - Amounts may be negative (a difference), but never fractional or beyond
 *   Number.MAX_SAFE_INTEGER: every operation checks, and throws RangeError, a
 *   programming error, never a client error. Validate input with a DTO first.
 * - Rounding is half up: half a halala rounds up (to the larger amount).
 * - A split by basis points always sums back to the whole, to the halala.
 *
 * Formatting for display is the clients' job: send `halalas`.
 */
export class Money {
  private constructor(readonly halalas: number) {}

  /** `halalas` as an amount. Throws RangeError unless it is a safe whole number. */
  static of(halalas: number): Money {
    return new Money(Money.checked(halalas));
  }

  static zero(): Money {
    return new Money(0);
  }

  /** The total of `amounts`; zero for none. */
  static sum(amounts: readonly Money[]): Money {
    return amounts.reduce((total, amount) => total.add(amount), Money.zero());
  }

  /** The smallest of `amounts`, or null for none. */
  static min(amounts: readonly Money[]): Money | null {
    return amounts.reduce<Money | null>(
      (smallest, amount) =>
        smallest === null || amount.isLessThan(smallest) ? amount : smallest,
      null,
    );
  }

  add(other: Money): Money {
    return Money.of(this.halalas + other.halalas);
  }

  subtract(other: Money): Money {
    return Money.of(this.halalas - other.halalas);
  }

  /** The amount `quantity` times: a whole number, zero or more. */
  multiply(quantity: number): Money {
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      throw new RangeError(
        `A quantity is a whole number, zero or more: ${quantity}`,
      );
    }
    return Money.of(this.halalas * quantity);
  }

  /**
   * This amount × `numerator` / `denominator`, rounded half up to the halala: the VAT
   * inside a price that includes it is `total.multiplyByFraction(15, 115)`. Both are
   * whole numbers, the numerator zero or more and the denominator more than zero;
   * otherwise RangeError. Integer arithmetic only, so no halala is lost to a float.
   */
  multiplyByFraction(numerator: number, denominator: number): Money {
    if (
      !Number.isSafeInteger(numerator) ||
      numerator < 0 ||
      !Number.isSafeInteger(denominator) ||
      denominator <= 0
    ) {
      throw new RangeError(
        `A fraction is a whole numerator, zero or more, over a whole denominator above zero: ${numerator}/${denominator}`,
      );
    }
    const doubled = 2 * this.halalas * numerator + denominator;
    if (!Number.isSafeInteger(doubled)) {
      throw new RangeError(`Out of range: ${this.halalas} × ${numerator}`);
    }
    // floor(x + 1/2) of x = halalas × numerator / denominator: half rounds up.
    return Money.of(Math.floor(doubled / (2 * denominator)));
  }

  /** -1, 0 or 1 as this amount is less than, equal to or more than `other`. */
  compare(other: Money): -1 | 0 | 1 {
    if (this.halalas === other.halalas) {
      return 0;
    }
    return this.halalas < other.halalas ? -1 : 1;
  }

  equals(other: Money): boolean {
    return this.compare(other) === 0;
  }

  isLessThan(other: Money): boolean {
    return this.compare(other) < 0;
  }

  isGreaterThan(other: Money): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Splits this amount (zero or more) into one part per share, each share in basis
   * points (10000 = the whole), the shares summing to exactly 10000. Each part is the
   * rounded (half up) running total minus the previous rounded running total, so the
   * parts are never negative and always sum back to the whole: no halala is lost or
   * made. Throws RangeError for a negative amount, a share that is not a whole number
   * from 0 to 10000, or shares that do not sum to 10000.
   */
  splitByBasisPoints(shares: readonly number[]): Money[] {
    if (this.halalas < 0) {
      throw new RangeError(`Only an amount of zero or more is split`);
    }
    let total = 0;
    for (const share of shares) {
      if (
        !Number.isSafeInteger(share) ||
        share < 0 ||
        share > BASIS_POINTS_WHOLE
      ) {
        throw new RangeError(
          `A share is a whole number of basis points from 0 to 10000: ${share}`,
        );
      }
      total += share;
    }
    if (total !== BASIS_POINTS_WHOLE) {
      throw new RangeError(`Shares sum to ${total} basis points, not 10000`);
    }
    const parts: Money[] = [];
    let runningShare = 0;
    let previous = 0;
    for (const share of shares) {
      runningShare += share;
      const runningAmount = this.basisPointsHalfUp(runningShare);
      parts.push(Money.of(runningAmount - previous));
      previous = runningAmount;
    }
    return parts;
  }

  /** `basisPoints` of this amount (zero or more), rounded half up. */
  private basisPointsHalfUp(basisPoints: number): number {
    const scaled = Money.checked(this.halalas * basisPoints);
    const whole = Math.floor(scaled / BASIS_POINTS_WHOLE);
    const remainder = scaled - whole * BASIS_POINTS_WHOLE;
    return remainder * 2 >= BASIS_POINTS_WHOLE ? whole + 1 : whole;
  }

  private static checked(halalas: number): number {
    if (!Number.isSafeInteger(halalas)) {
      throw new RangeError(
        `An amount is a safe whole number of halalas: ${halalas}`,
      );
    }
    return halalas;
  }
}
