import { ErrorCode } from '@common/errors/error-code.enum';
import { Vendor } from './vendor.entity';

function refusal(work: () => void): unknown {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
}

describe('Vendor.assertCommission', () => {
  it.each([0, 1, 1250, 10_000])('accepts %d basis points', (basisPoints) => {
    expect(refusal(() => Vendor.assertCommission(basisPoints))).toBeNull();
  });

  it.each([-1, 10_001, 12.5, Number.NaN])(
    'refuses %d basis points',
    (basisPoints) => {
      expect(refusal(() => Vendor.assertCommission(basisPoints))).toMatchObject(
        {
          code: ErrorCode.VALIDATION_FAILED,
          details: [{ field: 'commissionBasisPoints' }],
        },
      );
    },
  );
});
