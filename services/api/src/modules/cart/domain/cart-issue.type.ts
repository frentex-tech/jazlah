import type { Money } from '@common/money/money';

/**
 * What blocks checkout on a line: PRICE_CHANGED (today's price differs from the accepted
 * one; both given) or ITEM_UNAVAILABLE (it can no longer be ordered as chosen).
 */
export type CartIssue = Readonly<
  | {
      code: 'PRICE_CHANGED';
      lineId: string;
      oldUnitPrice: Money;
      newUnitPrice: Money;
    }
  | { code: 'ITEM_UNAVAILABLE'; lineId: string }
>;
