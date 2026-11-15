import { ErrorCode } from '@common/errors/error-code.enum';
import { VendorApplicationReviewMachine } from './vendor-application-review.state-machine';
import type { VendorApplicationStatus } from './vendor-application-status.type';

function refusal(work: () => void): unknown {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
}

describe('VendorApplicationReviewMachine', () => {
  it.each<VendorApplicationStatus>(['approved', 'rejected'])(
    'lets a pending application become %s',
    (to) => {
      expect(
        refusal(() =>
          VendorApplicationReviewMachine.assertCanMove('pending', to),
        ),
      ).toBeNull();
    },
  );

  it.each<[VendorApplicationStatus, VendorApplicationStatus]>([
    ['approved', 'rejected'],
    ['approved', 'approved'],
    ['rejected', 'approved'],
    ['rejected', 'rejected'],
    ['pending', 'pending'],
  ])('refuses %s to %s with VENDOR_APPLICATION_NOT_PENDING', (from, to) => {
    expect(
      refusal(() => VendorApplicationReviewMachine.assertCanMove(from, to)),
    ).toMatchObject({ code: ErrorCode.VENDOR_APPLICATION_NOT_PENDING });
  });
});
