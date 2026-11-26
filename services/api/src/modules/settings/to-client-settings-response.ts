import type { ClientSettingsResponseDto } from './dto/client-settings-response.dto';
import type { OperationsSettings } from './operations-settings.type';

/** What the apps may read of the settings: no capacity, cut-offs or closed days. */
export function toClientSettingsResponse(
  settings: OperationsSettings,
): ClientSettingsResponseDto {
  return {
    deliveryWindow: { ...settings.deliveryWindow },
    bookingHorizonDays: settings.bookingHorizonDays,
    minOrderHalalas: settings.minOrderHalalas,
    deliveryFeeHalalas: settings.deliveryFeeHalalas,
    codEnabled: settings.cod.enabled,
    codMaxOrderHalalas: settings.cod.maxOrderHalalas,
    paused: { ...settings.paused },
  };
}
