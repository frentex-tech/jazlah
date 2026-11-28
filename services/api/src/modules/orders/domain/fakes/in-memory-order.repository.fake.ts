import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { keysetPage } from '@common/pagination/keyset-page.fake';
import { PAST_ORDER_STATUSES } from '../past-order-statuses.constants';
import { FINAL_ORDER_STATUSES } from '../final-order-statuses.constants';
import type { Order } from '../order.type';
import type { OrderDraft } from '../order-draft.type';
import type { OrderListFilter } from '../order-list-filter.type';
import type { OrderSummary } from '../order-summary.type';
import type { OrderStatusChange } from '../order-status-change.type';
import type { ActiveOrderLookup } from '../ports/active-order-lookup.port';
import type { OrderAddressUsage } from '../ports/order-address-usage.port';
import type { OrderRepository } from '../ports/order.repository.port';

/** `OrderRepository` in memory, for unit tests: sequences per day, orders by id. */
export class InMemoryOrderRepository
  implements OrderRepository, OrderAddressUsage, ActiveOrderLookup
{
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
      savedAddressId: request.savedAddressId,
      cancelReason: null,
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

  lockForWrite(id: string, vendorId?: string): Promise<Order | null> {
    return Promise.resolve(
      this.saved.find(
        (order) =>
          order.id === id &&
          (vendorId === undefined || order.vendorId === vendorId),
      ) ?? null,
    );
  }

  transition(change: OrderStatusChange): Promise<Order> {
    const index = this.saved.findIndex((order) => order.id === change.orderId);
    const order = this.saved[index];
    if (order === undefined) {
      return Promise.reject(new AppError(ErrorCode.NOT_FOUND));
    }
    const updated: Order = {
      ...order,
      status: change.to,
      cancelReason:
        change.to === 'cancelled' ? change.note : order.cancelReason,
      history: [
        ...order.history,
        {
          from: change.from,
          to: change.to,
          actorType: change.actorType,
          actorId: change.actorId,
          note: change.note,
          at: change.at,
        },
      ],
    };
    this.saved[index] = updated;
    return Promise.resolve(updated);
  }

  isLocked(userId: string, addressId: string): Promise<boolean> {
    return Promise.resolve(
      this.saved.some(
        (order) =>
          order.userId === userId &&
          order.savedAddressId === addressId &&
          !FINAL_ORDER_STATUSES.includes(order.status),
      ),
    );
  }

  hasActiveOrders(userId: string): Promise<boolean> {
    return Promise.resolve(
      this.saved.some(
        (order) =>
          order.userId === userId &&
          !FINAL_ORDER_STATUSES.includes(order.status),
      ),
    );
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
