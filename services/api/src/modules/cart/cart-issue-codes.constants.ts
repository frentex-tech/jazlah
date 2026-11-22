/** What blocks checkout on a line: its price changed since it was added (PATCH the line to accept the new price), or it can no longer be ordered (remove it). */
export const CART_ISSUE_CODES = ['PRICE_CHANGED', 'ITEM_UNAVAILABLE'] as const;
