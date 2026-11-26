import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { assertMinimumReached } from './assert-minimum-reached';

describe('assertMinimumReached', () => {
  it('lets a cart that reached the minimum exactly through', () => {
    expect(() =>
      assertMinimumReached(Money.of(5_000), Money.zero()),
    ).not.toThrow();
  });

  it('refuses one halala short, naming the minimum and what is missing', () => {
    try {
      assertMinimumReached(Money.of(5_000), Money.of(1));
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        code: ErrorCode.MIN_ORDER_NOT_MET,
        details: { minOrderHalalas: 5_000, remainingHalalas: 1 },
      });
      return;
    }
    throw new Error('expected a refusal');
  });
});
