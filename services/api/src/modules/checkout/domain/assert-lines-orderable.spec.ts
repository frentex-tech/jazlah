import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { assertLinesOrderable } from './assert-lines-orderable';

function refusal(run: () => void): unknown {
  try {
    run();
  } catch (error) {
    return error instanceof AppError
      ? { code: error.code, details: error.details }
      : error;
  }
  return 'no error';
}

describe('assertLinesOrderable', () => {
  it('lets a cart without issues through', () => {
    expect(refusal(() => assertLinesOrderable([]))).toBe('no error');
  });

  it('names every unavailable line', () => {
    expect(
      refusal(() =>
        assertLinesOrderable([
          { code: 'ITEM_UNAVAILABLE', lineId: 'a' },
          { code: 'ITEM_UNAVAILABLE', lineId: 'b' },
        ]),
      ),
    ).toEqual({
      code: ErrorCode.ITEM_UNAVAILABLE,
      details: { lineIds: ['a', 'b'] },
    });
  });

  it('names the lines whose price moved', () => {
    expect(
      refusal(() =>
        assertLinesOrderable([{ code: 'PRICE_CHANGED', lineId: 'a' }]),
      ),
    ).toEqual({ code: ErrorCode.PRICE_CHANGED, details: { lineIds: ['a'] } });
  });

  it('reports unavailable lines before moved prices', () => {
    expect(
      refusal(() =>
        assertLinesOrderable([
          { code: 'PRICE_CHANGED', lineId: 'a' },
          { code: 'ITEM_UNAVAILABLE', lineId: 'b' },
        ]),
      ),
    ).toMatchObject({ code: ErrorCode.ITEM_UNAVAILABLE });
  });
});
