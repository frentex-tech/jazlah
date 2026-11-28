import type { CodRules } from '../cod-rules.type';
import type { OrderingPause } from '../ordering-pause.type';
import type { CheckoutSettings } from '../ports/checkout-settings.port';

/** CheckoutSettings with values a test changes: open, cash on delivery on for ready meat, no cap. */
export class FakeCheckoutSettings implements CheckoutSettings {
  paused: OrderingPause = { isPaused: false, messageAr: null, messageEn: null };
  codRules: CodRules = {
    enabled: true,
    maxOrder: null,
    allowedOrderTypes: ['ready_meat'],
    autoConfirm: false,
  };

  pause(): Promise<OrderingPause> {
    return Promise.resolve(this.paused);
  }

  cod(): Promise<CodRules> {
    return Promise.resolve(this.codRules);
  }
}
