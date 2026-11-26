import type { ClosedDay } from './closed-day.type';
import type { CodSettings } from './cod-settings.type';
import type { Cutoffs } from './cutoffs.type';
import type { DailyCapacity } from './daily-capacity.type';
import type { OrderingPause } from './ordering-pause.type';
import type { TimeWindow } from './time-window.type';

/** The platform's operating rules as saved (`OperationsSettingsService.current`). Money in halalas, VAT included. */
export type OperationsSettings = Readonly<{
  deliveryWindow: TimeWindow;
  cutoffs: Cutoffs;
  defaultCapacity: DailyCapacity;
  cod: CodSettings;
  bookingHorizonDays: number;
  minOrderHalalas: number;
  deliveryFeeHalalas: number;
  complaintWindowHours: number;
  /** In date order, past days included. */
  closedDays: readonly ClosedDay[];
  paused: OrderingPause;
  updatedAt: Date;
}>;
