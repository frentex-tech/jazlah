import type { Money } from '@common/money/money';
import type { PricedFulfilment } from './priced-fulfilment.type';

/** The amounts the operations settings give a cart. */
export type CartPricingRules = Readonly<{
  minOrder: Money;
  /** Zero unless the cart's fulfilment is delivery. */
  deliveryFee: Money;
  /** The chosen fulfilment as shown; null until chosen. */
  fulfilment: PricedFulfilment | null;
}>;
