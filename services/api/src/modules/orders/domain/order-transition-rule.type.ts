import type { OrderActorType } from './order-actor-type.type';
import type { FulfilmentMethod } from './fulfilment-method.type';
import type { OrderStatus } from './order-status.type';

/** A row of the single transition table used by authorization and API affordances. */
export type OrderTransitionRule = Readonly<{
  from: OrderStatus;
  to: OrderStatus;
  actors: readonly OrderActorType[];
  fulfilment?: FulfilmentMethod;
  /** Whether this transition gives the order's capacity reservation back. */
  releaseCapacity?: boolean;
}>;
