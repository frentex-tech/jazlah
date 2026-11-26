import type { Money } from '@common/money/money';

/** What the cart reads of the operations settings. */
export type CartSettings = Readonly<{
  minOrder: Money;
  deliveryFee: Money;
  pause: Readonly<{
    isPaused: boolean;
    messageAr: string | null;
    messageEn: string | null;
  }>;
}>;
