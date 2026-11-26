import type { ORDER_ACTOR_TYPES } from './order-actor-types.constants';

/** Who moved an order. */
export type OrderActorType = (typeof ORDER_ACTOR_TYPES)[number];
