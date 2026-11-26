import type { CutoffRule } from './cutoff-rule.type';

/** The cut-off rule of each kind of order (a mixed order takes the strictest of its lines). */
export type Cutoffs = Readonly<{
  readyMeat: CutoffRule;
  carcass: CutoffRule;
  cooked: CutoffRule;
  occasion: CutoffRule;
  adha: CutoffRule;
}>;
