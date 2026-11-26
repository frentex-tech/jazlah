import type { Order } from '../order.type';
import type { OrderDraft } from '../order-draft.type';
import type { OrderRepository } from '../ports/order.repository.port';

/** `OrderRepository` in memory, for unit tests: sequences per day, orders by id. */
export class InMemoryOrderRepository implements OrderRepository {
  readonly saved: Order[] = [];
  private readonly counters = new Map<string, number>();

  nextSequence(day: string): Promise<number> {
    const next = (this.counters.get(day) ?? 0) + 1;
    this.counters.set(day, next);
    return Promise.resolve(next);
  }

  create(draft: OrderDraft): Promise<Order> {
    const { request, pricing } = draft;
    const order: Order = {
      id: `order-${this.saved.length + 1}`,
      number: draft.number,
      userId: request.userId,
      customer: request.customer,
      vendorId: request.vendorId,
      vendor: request.vendor,
      commissionBasisPoints: request.commissionBasisPoints,
      status: draft.status,
      orderType: request.orderType,
      fulfilment: request.fulfilment,
      fulfilmentDate: request.fulfilmentDate,
      window: request.window,
      address: request.address,
      pickupPoint: request.pickupPoint,
      paymentMethod: request.paymentMethod,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      deliveryFee: pricing.deliveryFee,
      vat: pricing.vat,
      total: pricing.total,
      carcasses: request.carcasses,
      notes: request.notes,
      items: request.lines.map((line, index) => ({
        id: `item-${index + 1}`,
        productId: line.productId,
        sizeId: line.sizeId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        total: line.unitPrice.multiply(line.quantity),
        packaging: line.packaging,
        notes: line.notes,
        imageUrl: line.imageUrl,
        names: line.names,
      })),
      history: [draft.firstEntry],
      createdAt: draft.firstEntry.at,
    };
    this.saved.push(order);
    return Promise.resolve(order);
  }

  findOfCustomer(userId: string, id: string): Promise<Order | null> {
    return Promise.resolve(
      this.saved.find((order) => order.id === id && order.userId === userId) ??
        null,
    );
  }
}
