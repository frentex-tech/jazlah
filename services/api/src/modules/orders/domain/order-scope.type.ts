import type { ORDER_SCOPES } from './order-scopes.constants';

/** A customer's order tab. */
export type OrderScope = (typeof ORDER_SCOPES)[number];
