import type { ORDER_TYPES } from '@modules/orders';
import type { CodConfirmationMode } from './cod-confirmation-mode.type';

/** Cash on delivery: whether it is offered, up to which total, for which orders, and how it is confirmed. */
export type CodSettings = Readonly<{
  enabled: boolean;
  /** Null: no cap. */
  maxOrderHalalas: number | null;
  allowedOrderTypes: readonly (typeof ORDER_TYPES)[number][];
  confirmation: CodConfirmationMode;
}>;
