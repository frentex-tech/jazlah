// lint-rule: R8 conforms
import type { Order } from '../order.entity';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(id: string, order: Order): Promise<void>;
}
