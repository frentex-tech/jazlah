import type { PRICE_LINE_ERRORS } from './price-line-errors.constants';

/** One of `PRICE_LINE_ERRORS`. */
export type PriceLineError = (typeof PRICE_LINE_ERRORS)[number];
