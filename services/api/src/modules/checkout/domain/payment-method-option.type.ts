import type { PAYMENT_METHOD_UNAVAILABLE_REASONS } from './payment-method-unavailable-reasons.constants';

/** A payment method the customer may see. */
export type PaymentMethodOption = Readonly<{
  method: 'mada' | 'card' | 'applepay' | 'cod' | 'wallet';
  isAvailable: boolean;
  reason: (typeof PAYMENT_METHOD_UNAVAILABLE_REASONS)[number] | null;
}>;
