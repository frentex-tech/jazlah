import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { IdempotencyKey } from './idempotency-key.decorator';

const KEY = '3c1f8e2a-5b7d-4c9e-a1f0-6d2b8c4e7a90';

class Probe {
  place(@IdempotencyKey() key: string): string {
    return key;
  }
}

/** Runs the decorator's factory on a request with these headers. */
function keyOf(headers: Record<string, string | string[] | undefined>): string {
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    Probe,
    'place',
  ) as Record<
    string,
    { factory: (data: unknown, ctx: ExecutionContext) => string }
  >;
  const [entry] = Object.values(metadata);
  if (entry === undefined) {
    throw new Error('The decorator registered nothing');
  }
  const context = {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  } as unknown as ExecutionContext;
  return entry.factory(undefined, context);
}

function codeOf(run: () => unknown): unknown {
  try {
    run();
  } catch (error) {
    return error instanceof AppError
      ? { code: error.code, details: error.details }
      : error;
  }
  return 'no error';
}

describe('IdempotencyKey', () => {
  it('returns the key of the header', () => {
    expect(keyOf({ 'idempotency-key': KEY })).toBe(KEY);
  });

  it('returns it in lower case', () => {
    expect(keyOf({ 'idempotency-key': KEY.toUpperCase() })).toBe(KEY);
  });

  it.each([
    ['missing', {}],
    ['not a UUID', { 'idempotency-key': 'abc' }],
    ['empty', { 'idempotency-key': '' }],
    ['repeated', { 'idempotency-key': [KEY, KEY] }],
  ])(
    'refuses a key that is %s with VALIDATION_FAILED on the header',
    (_, headers) => {
      expect(codeOf(() => keyOf(headers))).toEqual({
        code: ErrorCode.VALIDATION_FAILED,
        details: [{ field: 'Idempotency-Key', constraints: ['isUuid'] }],
      });
    },
  );
});
