import { LINE_REFUSALS } from './line-refusals.constants';
import type { LineRefusal } from './line-refusal.type';

/** The refusal reported first, in the contract's order (`LINE_REFUSALS`); null when none. */
export function firstRefusal(
  refusals: readonly LineRefusal[],
): LineRefusal | null {
  return LINE_REFUSALS.find((refusal) => refusals.includes(refusal)) ?? null;
}
