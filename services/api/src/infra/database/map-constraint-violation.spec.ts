import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Prisma } from './generated/prisma/client';
import { mapConstraintViolation } from './map-constraint-violation';

/** A unique violation as Prisma 7 reports it through the pg adapter: by index name. */
function uniqueViolation(index: string) {
  return new Prisma.PrismaClientKnownRequestError('fake P2002', {
    code: 'P2002',
    clientVersion: 'test',
    meta: {
      modelName: 'VendorApplication',
      driverAdapterError: {
        name: 'DriverAdapterError',
        cause: { kind: 'UniqueConstraintViolation', constraint: { index } },
      },
    },
  });
}

function thrownBy(work: () => never): unknown {
  try {
    work();
  } catch (error) {
    return error;
  }
  throw new Error('expected it to throw');
}

const CODES = {
  vendor_applications_applicant_id_pending_key:
    ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
};

describe('mapConstraintViolation', () => {
  it('translates a known constraint into its code, keeping the cause', () => {
    const error = uniqueViolation(
      'vendor_applications_applicant_id_pending_key',
    );

    const result = thrownBy(() => mapConstraintViolation(error, CODES));

    expect(result).toBeInstanceOf(AppError);
    expect(result).toMatchObject({
      code: ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
      cause: error,
    });
  });

  it('maps another constraint as mapPrismaError does', () => {
    const result = thrownBy(() =>
      mapConstraintViolation(uniqueViolation('vendors_pkey'), CODES),
    );

    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { constraint: 'vendors_pkey' },
    });
  });

  it('rethrows an unknown error unchanged', () => {
    const error = new Error('not a database error');

    expect(thrownBy(() => mapConstraintViolation(error, CODES))).toBe(error);
  });

  it('ignores names inherited from Object', () => {
    const result = thrownBy(() =>
      mapConstraintViolation(uniqueViolation('toString'), CODES),
    );

    expect(result).toMatchObject({ code: ErrorCode.CONFLICT });
  });
});
