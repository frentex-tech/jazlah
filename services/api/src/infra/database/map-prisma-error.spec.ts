import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { Prisma } from './generated/prisma/client';
import { mapPrismaError } from './map-prisma-error';

function knownError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError(`fake ${code}`, {
    code,
    clientVersion: 'test',
    meta,
  });
}

function mapped(error: unknown): unknown {
  try {
    mapPrismaError(error);
  } catch (thrown) {
    return thrown;
  }
  throw new Error('expected mapPrismaError to throw');
}

/** The metadata Prisma 7 sends through the pg adapter for a constraint violation. */
function adapterMeta(constraint: Record<string, unknown>) {
  return {
    modelName: 'AuditLog',
    driverAdapterError: {
      name: 'DriverAdapterError',
      cause: { kind: 'UniqueConstraintViolation', constraint },
    },
  };
}

describe('mapPrismaError', () => {
  it('maps a primary key violation (P2002) to CONFLICT with the id field', () => {
    const error = knownError(
      'P2002',
      adapterMeta({ index: 'audit_logs_pkey' }),
    );
    const result = mapped(error);
    expect(result).toBeInstanceOf(AppError);
    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      status: 409,
      details: { constraint: 'audit_logs_pkey', fields: ['id'] },
      cause: error,
    });
  });

  it('maps a unique violation with fields to CONFLICT with those fields', () => {
    const result = mapped(
      knownError('P2002', adapterMeta({ fields: ['email'] })),
    );
    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { fields: ['email'] },
    });
  });

  it('maps a unique violation reported with target (older engines)', () => {
    const result = mapped(knownError('P2002', { target: ['slug'] }));
    expect(result).toMatchObject({ details: { fields: ['slug'] } });
  });

  it('gives only the constraint name when the fields are unknown', () => {
    const result = mapped(
      knownError('P2002', adapterMeta({ index: 'vendors_slug_key' })),
    );
    expect(result).toMatchObject({
      details: { constraint: 'vendors_slug_key' },
    });
    expect((result as AppError).details).not.toHaveProperty('fields');
  });

  it('maps a foreign key violation (P2003) to CONFLICT', () => {
    const result = mapped(
      knownError('P2003', adapterMeta({ fields: ['vendor_id'] })),
    );
    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { fields: ['vendor_id'] },
    });
  });

  it('maps a missing record (P2025) to NOT_FOUND', () => {
    expect(mapped(knownError('P2025'))).toMatchObject({
      code: ErrorCode.NOT_FOUND,
      status: 404,
    });
  });

  it.each([
    ['P2000', 'value too long'],
    ['P2007', 'invalid value, such as a malformed UUID'],
    ['P2020', 'value out of range'],
  ])('maps %s (%s) to BAD_REQUEST', (code) => {
    expect(mapped(knownError(code))).toMatchObject({
      code: ErrorCode.BAD_REQUEST,
      status: 400,
    });
  });

  it('maps a write conflict or deadlock (P2034) to TRANSACTION_CONFLICT, 409', () => {
    expect(mapped(knownError('P2034'))).toMatchObject({
      code: ErrorCode.TRANSACTION_CONFLICT,
      status: 409,
    });
  });

  it.each([
    ['P2028', 'transaction timed out'],
    ['P1001', 'database unreachable'],
    ['P1008', 'socket timeout'],
    ['P1017', 'connection closed'],
    ['P2037', 'too many connections'],
  ])('maps %s (%s) to SERVICE_UNAVAILABLE, 503', (code) => {
    expect(mapped(knownError(code))).toMatchObject({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      status: 503,
    });
  });

  it('maps pg’s connection timeout (a plain Error) to SERVICE_UNAVAILABLE', () => {
    expect(
      mapped(new Error('Connection terminated due to connection timeout')),
    ).toMatchObject({ code: ErrorCode.SERVICE_UNAVAILABLE });
  });

  /** A raw query failure (P2010) as Prisma 7 reports it, with the driver error's kind. */
  function rawQueryError(cause: Record<string, unknown>) {
    return knownError('P2010', {
      driverAdapterError: { name: 'DriverAdapterError', cause },
    });
  }

  it('maps a unique violation in raw SQL (P2010) to CONFLICT like P2002', () => {
    const result = mapped(
      rawQueryError({
        originalCode: '23505',
        kind: 'UniqueConstraintViolation',
        constraint: { index: 'audit_logs_pkey' },
        table: 'audit_logs',
      }),
    );
    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { constraint: 'audit_logs_pkey', fields: ['id'] },
    });
  });

  it.each([
    ['InvalidInputValue', '22P02', ErrorCode.BAD_REQUEST],
    ['ForeignKeyConstraintViolation', '23503', ErrorCode.CONFLICT],
    ['TransactionWriteConflict', '40001', ErrorCode.TRANSACTION_CONFLICT],
    ['DatabaseNotReachable', undefined, ErrorCode.SERVICE_UNAVAILABLE],
  ])(
    'maps a raw query failure of kind %s by its kind',
    (kind, sqlState, code) => {
      expect(
        mapped(rawQueryError({ kind, originalCode: sqlState })),
      ).toMatchObject({ code });
    },
  );

  /** An unclassified database error (P2039), as Prisma reports a check violation. */
  function databaseError(sqlState: string, message: string) {
    return knownError('P2039', {
      driverAdapterError: {
        name: 'DriverAdapterError',
        cause: {
          originalCode: sqlState,
          originalMessage: message,
          kind: 'postgres',
          detail: 'Failing row contains (+966500000000, ...).',
        },
      },
    });
  }

  it('maps a check constraint violation (P2039, 23514) to CONFLICT with the constraint name only', () => {
    const result = mapped(
      databaseError(
        '23514',
        'new row for relation "orders" violates check constraint "orders_total_check"',
      ),
    );
    expect(result).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { constraint: 'orders_total_check' },
    });
    expect(JSON.stringify((result as AppError).details)).not.toContain('+966');
  });

  it('maps an exclusion constraint violation (23P01) to CONFLICT', () => {
    expect(
      mapped(
        databaseError(
          '23P01',
          'conflicting key value violates exclusion constraint "slots_no_overlap"',
        ),
      ),
    ).toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { constraint: 'slots_no_overlap' },
    });
  });

  it('rethrows any other unclassified database error (P2039) unchanged', () => {
    const error = databaseError('22012', 'division by zero');
    expect(mapped(error)).toBe(error);
  });

  it('rethrows an unknown Prisma error unchanged', () => {
    const error = knownError('P2011');
    expect(mapped(error)).toBe(error);
  });

  it('rethrows an error that is not from Prisma unchanged', () => {
    const error = new TypeError('boom');
    expect(mapped(error)).toBe(error);
  });
});
