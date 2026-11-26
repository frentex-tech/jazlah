import type { Order } from '../order.type';
import type { OrderDraft } from '../order-draft.type';

/** Injection token of the OrderRepository. */
export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

/** Where orders are kept (tables `orders`, `order_items`, `order_status_history`, `order_number_counters`). */
export interface OrderRepository {
  /**
   * The next order sequence of the Riyadh day, from 1: one atomic upsert, so two
   * concurrent orders never get one number. Call inside `TransactionRunner.run`: the
   * counter row stays locked until the order commits, so numbers have no gaps.
   */
  nextSequence(day: string): Promise<number>;

  /** Saves the order with its lines and its first history row. Call inside the placing transaction. */
  create(draft: OrderDraft): Promise<Order>;

  /** The order of this customer, or null (the order of another customer is not found either). */
  findOfCustomer(userId: string, id: string): Promise<Order | null>;
}
