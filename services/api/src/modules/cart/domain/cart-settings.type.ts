import type { Money } from '@common/money/money';

/** What the cart reads of the operations settings. */
export type CartSettings = Readonly<{
  minOrder: Money;
  deliveryFee: Money;
  /** The delivery window, Riyadh `HH:mm`. */
  deliveryWindow: Readonly<{ start: string; end: string }>;
  pause: Readonly<{
    isPaused: boolean;
    messageAr: string | null;
    messageEn: string | null;
  }>;
}>;
