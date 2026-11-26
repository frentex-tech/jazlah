import type { LineSelection } from './line-selection.type';

/** One line to quote: the product and what was chosen of it. */
export type LineQuoteRequest = Readonly<{ productId: string }> & LineSelection;
