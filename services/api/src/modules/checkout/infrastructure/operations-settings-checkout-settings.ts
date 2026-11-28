import { Injectable } from '@nestjs/common';
import { Money } from '@common/money/money';
import { OperationsSettingsService } from '@modules/settings';
import type { CodRules } from '../domain/cod-rules.type';
import type { OrderingPause } from '../domain/ordering-pause.type';
import type { CheckoutSettings } from '../domain/ports/checkout-settings.port';

/** `CheckoutSettings` on the operations settings (SCH-API-1), read on every call. */
@Injectable()
export class OperationsSettingsCheckoutSettings implements CheckoutSettings {
  constructor(private readonly settings: OperationsSettingsService) {}

  async pause(): Promise<OrderingPause> {
    return (await this.settings.current()).paused;
  }

  async cod(): Promise<CodRules> {
    const { cod } = await this.settings.current();
    return {
      enabled: cod.enabled,
      maxOrder:
        cod.maxOrderHalalas === null ? null : Money.of(cod.maxOrderHalalas),
      allowedOrderTypes: cod.allowedOrderTypes,
      autoConfirm: cod.confirmation === 'auto',
    };
  }
}
