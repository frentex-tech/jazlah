import type { FULFILMENT_METHODS } from './fulfilment-methods.constants';

/** Delivered or picked up. */
export type FulfilmentMethod = (typeof FULFILMENT_METHODS)[number];
