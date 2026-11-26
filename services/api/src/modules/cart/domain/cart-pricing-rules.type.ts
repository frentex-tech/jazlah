import type { Money } from '@common/money/money';

/** The amounts the operations settings give a cart. */
export type CartPricingRules = Readonly<{
  minOrder: Money;
  /** Zero unless the cart's fulfilment is delivery. */
  deliveryFee: Money;
}>;
