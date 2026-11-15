import { ErrorCode } from '@common/errors/error-code.enum';
import { VendorStatusMachine } from './vendor-status.state-machine';
import type { VendorStatus } from './vendor-status.type';

function refusal(work: () => void): unknown {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
}

describe('VendorStatusMachine', () => {
  it('suspends an active vendor and reinstates a suspended one', () => {
    expect(
      refusal(() => VendorStatusMachine.assertCanMove('active', 'suspended')),
    ).toBeNull();
    expect(
      refusal(() => VendorStatusMachine.assertCanMove('suspended', 'active')),
    ).toBeNull();
  });

  it.each<[VendorStatus, string]>([
    ['suspended', 'VENDOR_ALREADY_SUSPENDED'],
    ['active', 'VENDOR_NOT_SUSPENDED'],
  ])(
    'refuses to move a %s vendor to the same status, with CONFLICT %s',
    (status, reason) => {
      expect(
        refusal(() => VendorStatusMachine.assertCanMove(status, status)),
      ).toMatchObject({ code: ErrorCode.CONFLICT, details: { reason } });
    },
  );
});
