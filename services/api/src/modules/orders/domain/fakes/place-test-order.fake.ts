import { Money } from '@common/money/money';
import type { NewOrder } from '../new-order.type';
import type { Order } from '../order.type';
import type { OrderPaymentMethod } from '../order-payment-method.type';
import type { OrderStatus } from '../order-status.type';
import type { InMemoryOrderRepository } from './in-memory-order.repository.fake';

/** What a test changes about the order it places; the rest is one pickup order of one line. */
export type TestOrderOptions = Readonly<{
  number: string;
  userId?: string;
  vendorId?: string;
  status?: OrderStatus;
  paymentMethod?: OrderPaymentMethod;
  fulfilmentDate?: string;
  customerName?: string;
  customerPhone?: string;
  at: Date;
}>;

/** Saves one order in the fake repository, for unit tests. */
export function placeTestOrder(
  orders: InMemoryOrderRepository,
  options: TestOrderOptions,
): Promise<Order> {
  const userId = options.userId ?? 'user-1';
  const request: NewOrder = {
    userId,
    customer: {
      name: options.customerName ?? 'Abdullah',
      phone: options.customerPhone ?? '+966500000001',
    },
    vendorId: options.vendorId ?? 'vendor-1',
    vendor: {
      name: { ar: 'م', en: 'S' },
      phone: null,
      location: null,
      city: null,
    },
    commissionBasisPoints: 1250,
    orderType: 'ready_meat',
    lines: [
      {
        productId: 'p1',
        sizeId: 's1',
        quantity: 1,
        unitPrice: Money.of(97_000),
        packaging: null,
        notes: null,
        imageUrl: null,
        names: {
          name: { ar: 'نعيمي', en: 'Naimi' },
          size: { id: 's1', approxWeightGrams: 8000, tag: null },
          cutting: null,
          exclusions: [],
        },
      },
    ],
    fulfilment: 'pickup',
    fulfilmentDate: options.fulfilmentDate ?? '2026-11-28',
    window: null,
    address: null,
    pickupPoint: {
      name: { ar: 'م', en: 'S' },
      address: null,
      location: null,
      phone: null,
      hours: null,
    },
    deliveryFee: Money.zero(),
    paymentMethod: options.paymentMethod ?? 'cod',
    notes: null,
    carcasses: 0,
  };
  const status = options.status ?? 'new';
  return orders.create({
    number: options.number,
    request,
    pricing: {
      subtotal: Money.of(97_000),
      discount: Money.zero(),
      deliveryFee: Money.zero(),
      total: Money.of(97_000),
      vat: Money.of(12_652),
    },
    status,
    firstEntry: {
      from: null,
      to: status,
      actorType: 'customer',
      actorId: userId,
      note: null,
      at: options.at,
    },
  });
}
