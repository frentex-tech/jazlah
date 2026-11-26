import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';

/**
 * A line of the cart that blocks placing: ITEM_UNAVAILABLE (it can no longer be ordered
 * as chosen) or PRICE_CHANGED (its price moved since the customer accepted it).
 */
export type LineIssue = Readonly<{
  code: 'ITEM_UNAVAILABLE' | 'PRICE_CHANGED';
  lineId: string;
}>;

/**
 * Refuses a cart with a blocking line, naming the failing lines in `details.lineIds`:
 * ITEM_UNAVAILABLE first, then PRICE_CHANGED. Nothing is charged at a price the
 * customer did not see.
 */
export function assertLinesOrderable(issues: readonly LineIssue[]): void {
  for (const code of ['ITEM_UNAVAILABLE', 'PRICE_CHANGED'] as const) {
    const lineIds = issues
      .filter((issue) => issue.code === code)
      .map((issue) => issue.lineId);
    if (lineIds.length > 0) {
      throw new AppError(ErrorCode[code], { details: { lineIds } });
    }
  }
}
