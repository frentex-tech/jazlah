// lint-rule: R8 conforms
// Where unit tests get an in-memory port: domain/fakes/, beside the port, plain
// TypeScript under R8, excluded from the build by its .fake.ts suffix.
import type { Order } from '../order.entity';
import type { OrderRepository } from '../ports/order.repository.port';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  findById(id: string): Promise<Order | null> {
    return Promise.resolve(this.orders.get(id) ?? null);
  }

  save(id: string, order: Order): Promise<void> {
    this.orders.set(id, order);
    return Promise.resolve();
  }
}
