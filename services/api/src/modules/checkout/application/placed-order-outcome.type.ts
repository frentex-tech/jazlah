/** What placing an order leaves in the stored outcome of its key: the order and the hash of the request that made it. */
export type PlacedOrderOutcome = { orderId: string; bodyHash: string };
