// Operations settings (SCH-API-1 `ops.*` keys) and per-vendor capacity (SCH-API-2 `DayCapacity`), as sprint-3.md
// describes them. Not in openapi.json yet: the mock follows these shapes (docs/frontend/not-built-yet.md).

/** Order types with a cutoff; `adha` (`{…}` in the sprint file, no field in the frame) is left out until it is defined. */
export const ORDER_TYPES = ['ready_meat', 'carcass', 'cooked', 'occasion'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];
export const SCOPES = ['both', 'delivery', 'pickup'] as const;
export type ClosedScope = (typeof SCOPES)[number];
/** Saturday first, as the frame's weekly hours and calendar. */
export const WEEKDAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type ClosedDay = { date: string; scope: ClosedScope; reasonAr: string; reasonEn: string };
export type Paused = { isPaused: boolean; messageAr: string; messageEn: string };

export type OperationsSettings = {
  deliveryWindow: { start: string; end: string };
  /**
   * `occasion` has no time in the sprint file (optional here; the frame shows one). Other keys (`adha`, `{…}` in the
   * sprint file) are kept as received, so a save never drops them.
   */
  cutoffs: { [K in OrderType]: { time?: string; leadDays: number } } & Record<string, unknown>;
  bookingHorizonDays: number;
  closedDays: ClosedDay[];
  capacity: { ordersPerDay: number; carcassesPerDay: number };
  minOrderHalalas: number;
  deliveryFeeHalalas: number;
  cod: { enabled: boolean; maxOrderHalalas: number | null; allowedOrderTypes: OrderType[]; confirmation: 'auto' | 'review' };
  paused: Paused;
  complaintWindowHours: number;
  /** The frame's weekly hours (118:11181); not an `ops.*` key in the sprint file (API gap): the section shows only when present. */
  workingHours?: { day: Weekday; open: boolean; start: string; end: string }[];
};

/** A vendor's capacity: its default override (null = the platform default) and its specific dates. */
export type DayCapacity = { date: string; ordersLimit: number | null; carcassesLimit: number | null; ordersBooked: number; carcassesBooked: number };
export type VendorCapacity = { ordersPerDay: number | null; carcassesPerDay: number | null; days: DayCapacity[] };
