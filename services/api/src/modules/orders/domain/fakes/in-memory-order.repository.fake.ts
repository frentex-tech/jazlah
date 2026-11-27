import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import { PAST_ORDER_STATUSES } from '../past-order-statuses.constants';
import type { Order } from '../order.type';
import type { OrderDraft } from '../order-draft.type';
import type { OrderListFilter } from '../order-list-filter.type';
import type { OrderSummary } from '../order-summary.type';
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

  findOfVendor(vendorId: string, id: string): Promise<Order | null> {
    return Promise.resolve(
      this.saved.find(
        (order) => order.id === id && order.vendorId === vendorId,
      ) ?? null,
    );
  }

  findById(id: string): Promise<Order | null> {
    return Promise.resolve(this.saved.find((order) => order.id === id) ?? null);
  }

  list(
    filter: OrderListFilter,
    page: PageRequest,
  ): Promise<Page<OrderSummary>> {
    const search = filter.search?.toLowerCase();
    const matching = this.saved.filter(
      (order) =>
        (filter.userId === undefined || order.userId === filter.userId) &&
        (filter.vendorId === undefined || order.vendorId === filter.vendorId) &&
        (filter.status === undefined || order.status === filter.status) &&
        (filter.paymentMethod === undefined ||
          order.paymentMethod === filter.paymentMethod) &&
        (filter.fulfilmentDate === undefined ||
          order.fulfilmentDate === filter.fulfilmentDate) &&
        (filter.scope === undefined ||
          PAST_ORDER_STATUSES.some((status) => status === order.status) ===
            (filter.scope === 'past')) &&
        (search === undefined ||
          order.number.toLowerCase().includes(search) ||
          order.customer.name.toLowerCase().includes(search) ||
          order.customer.phone.includes(search)),
    );
    const found = keysetPage(matching, page);
    return Promise.resolve({
      items: found.items.map((order): OrderSummary => ({
        id: order.id,
        number: order.number,
        userId: order.userId,
        customer: order.customer,
        vendorId: order.vendorId,
        vendor: order.vendor,
        status: order.status,
        orderType: order.orderType,
        fulfilment: order.fulfilment,
        fulfilmentDate: order.fulfilmentDate,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt,
      })),
      nextCursor: found.nextCursor,
    });
  }
}
