import type { OperationsSettingsResponseDto } from './dto/operations-settings-response.dto';
import type { OperationsSettings } from './operations-settings.type';

/** The admin's view of the settings: everything saved. */
export function toOperationsSettingsResponse(
  settings: OperationsSettings,
): OperationsSettingsResponseDto {
  return {
    deliveryWindow: { ...settings.deliveryWindow },
    cutoffs: {
      readyMeat: { ...settings.cutoffs.readyMeat },
      carcass: { ...settings.cutoffs.carcass },
      cooked: { ...settings.cutoffs.cooked },
      occasion: { ...settings.cutoffs.occasion },
      adha: { ...settings.cutoffs.adha },
    },
    defaultCapacity: { ...settings.defaultCapacity },
    cod: {
      ...settings.cod,
      allowedOrderTypes: [...settings.cod.allowedOrderTypes],
    },
    bookingHorizonDays: settings.bookingHorizonDays,
    minOrderHalalas: settings.minOrderHalalas,
    deliveryFeeHalalas: settings.deliveryFeeHalalas,
    complaintWindowHours: settings.complaintWindowHours,
    closedDays: settings.closedDays.map((day) => ({ ...day })),
    paused: { ...settings.paused },
    updatedAt: settings.updatedAt,
  };
}
