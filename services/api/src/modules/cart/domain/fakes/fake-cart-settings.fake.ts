import { Money } from '@common/money/money';
import type { CartSettings } from '../cart-settings.type';
import type { CartSettingsSource } from '../ports/cart-settings.port';

/** CartSettingsSource with values a test changes; open, no minimum, no fee by default. */
export class FakeCartSettings implements CartSettingsSource {
  settings: CartSettings = {
    minOrder: Money.zero(),
    deliveryFee: Money.zero(),
    pause: { isPaused: false, messageAr: null, messageEn: null },
  };

  pause(): void {
    this.settings = {
      ...this.settings,
      pause: { isPaused: true, messageAr: 'متوقف', messageEn: 'Paused' },
    };
  }

  current(): Promise<CartSettings> {
    return Promise.resolve(this.settings);
  }
}
