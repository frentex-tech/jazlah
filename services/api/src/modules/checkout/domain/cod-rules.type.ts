import type { Money } from '@common/money/money';

/** The cash-on-delivery rules of the operations settings. */
export type CodRules = Readonly<{
  enabled: boolean;
  /** Null: no cap. */
  maxOrder: Money | null;
  allowedOrderTypes: readonly string[];
}>;
