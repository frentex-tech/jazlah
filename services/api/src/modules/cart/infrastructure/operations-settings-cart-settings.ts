import { Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import { OperationsSettingsService } from '@modules/settings';
import type { CartSettings } from '../domain/cart-settings.type';
import type { CartSettingsSource } from '../domain/ports/cart-settings.port';

/** `CartSettingsSource` on the operations settings (SCH-API-1), read on every call. */
@Injectable()
export class OperationsSettingsCartSettings implements CartSettingsSource {
  constructor(private readonly settings: OperationsSettingsService) {}

  async current(): Promise<CartSettings> {
    const saved = await this.settings.current();
    return {
      minOrder: Money.of(saved.minOrderHalalas),
      deliveryFee: Money.of(saved.deliveryFeeHalalas),
      deliveryWindow: saved.deliveryWindow,
      pause: saved.paused,
    };
  }
}
