// Operations settings (SCH-API-1) and per-vendor capacity (SCH-API-2), as the generated client types them
// (docs/frontend/orders.md). Type-only imports: the unit tests run under plain node.
import type { Schemas } from '../../api/client.ts';

/** The order types the page edits (cutoff, COD); `adha` (Sprint 6) and `mixed` are kept as received, never shown. */
export const ORDER_TYPES = ['ready_meat', 'carcass', 'cooked', 'occasion'] as const satisfies readonly Schemas['OrderType'][];
export type OrderType = (typeof ORDER_TYPES)[number];
/** The cutoff key of an order type (`ready_meat` → `readyMeat`). */
export const CUTOFF_KEY = { ready_meat: 'readyMeat', carcass: 'carcass', cooked: 'cooked', occasion: 'occasion' } as const satisfies Record<OrderType, keyof Schemas['CutoffsDto']>;
export const SCOPES = ['both', 'delivery', 'pickup'] as const satisfies readonly Schemas['ClosedDayDto']['scope'][];
export type ClosedScope = (typeof SCOPES)[number];

export type ClosedDay = Schemas['ClosedDayDto'];
/** The pause as read: the messages are null while not paused. */
export type Paused = Schemas['OrderingPauseResponseDto'];
/** The pause as sent: the messages are required when pausing, ignored when resuming. */
export type SetPause = Schemas['SetOrderingPauseDto'];
export type OperationsSettings = Schemas['OperationsSettingsResponseDto'];
/** What the page saves: every key but the pause (its own route) and `updatedAt`. */
export type OperationsPage = Required<Schemas['UpdateOperationsSettingsDto']>;
export type OperationsPatch = Schemas['UpdateOperationsSettingsDto'];

export type DayCapacity = Schemas['VendorCapacityDayResponseDto'];
export type VendorCapacity = Schemas['VendorCapacityResponseDto'];
export type VendorDefault = Schemas['SetVendorCapacityDto'];
export type DayLimit = Schemas['SetVendorDayCapacityDto'];
