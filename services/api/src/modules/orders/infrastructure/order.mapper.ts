import { Money } from '@common/money/money';
import type { Prisma } from '@infra/database/generated/prisma/client';
import { ProductPackaging } from '@infra/database/generated/prisma/enums';
import type { Order } from '../domain/order.type';
import type { OrderDraft } from '../domain/order-draft.type';
import type { NewOrderLine } from '../domain/new-order-line.type';
import {
  ORDER_ADDRESS_SNAPSHOT_SCHEMA,
  ORDER_ITEM_NAMES_SCHEMA,
  ORDER_PICKUP_SNAPSHOT_SCHEMA,
  ORDER_VENDOR_SNAPSHOT_SCHEMA,
} from './order-snapshots.schema';
import type { OrderWithDetailsRow } from './order-row.type';

/** Rows of `orders`, `order_items` and `order_status_history` to the `Order` and back. */
export const OrderMapper = {
  toOrder(row: OrderWithDetailsRow): Order {
    return {
      id: row.id,
      number: row.number,
      userId: row.userId,
      customer: { name: row.customerName, phone: row.customerPhone },
      vendorId: row.vendorId,
      vendor: ORDER_VENDOR_SNAPSHOT_SCHEMA.parse(row.vendorSnapshot),
      commissionBasisPoints: row.commissionBasisPoints,
      status: row.status,
      orderType: row.orderType,
      fulfilment: row.fulfilmentMethod,
      // A DATE column comes back as UTC midnight of that calendar day.
      fulfilmentDate: row.fulfilmentDate.toISOString().slice(0, 10),
      window:
        row.windowStart === null || row.windowEnd === null
          ? null
          : { start: row.windowStart, end: row.windowEnd },
      address:
        row.addressSnapshot === null
          ? null
          : ORDER_ADDRESS_SNAPSHOT_SCHEMA.parse(row.addressSnapshot),
      pickupPoint:
        row.pickupSnapshot === null
          ? null
          : ORDER_PICKUP_SNAPSHOT_SCHEMA.parse(row.pickupSnapshot),
      paymentMethod: row.paymentMethod,
      subtotal: Money.of(Number(row.subtotalHalalas)),
      discount: Money.of(Number(row.discountHalalas)),
      deliveryFee: Money.of(row.deliveryFeeHalalas),
      vat: Money.of(Number(row.vatHalalas)),
      total: Money.of(Number(row.totalHalalas)),
      carcasses: row.carcasses,
      notes: row.notes,
      items: [...row.items]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
          id: item.id,
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: item.quantity,
          unitPrice: Money.of(item.unitPriceHalalas),
          total: Money.of(Number(item.totalHalalas)),
          packaging: item.packaging,
          notes: item.notes,
          imageUrl: item.imageUrl,
          names: ORDER_ITEM_NAMES_SCHEMA.parse(item.snapshot),
        })),
      history: [...row.history]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((entry) => ({
          from: entry.fromStatus,
          to: entry.toStatus,
          actorType: entry.actorType,
          actorId: entry.actorId,
          note: entry.note,
          at: entry.createdAt,
        })),
      createdAt: row.createdAt,
    };
  },

  /** The columns of a new order, with its lines and its first history row. */
  toCreateData(draft: OrderDraft): Prisma.OrderUncheckedCreateInput {
    const { request, pricing } = draft;
    return {
      number: draft.number,
      userId: request.userId,
      vendorId: request.vendorId,
      status: draft.status,
      orderType: request.orderType,
      fulfilmentMethod: request.fulfilment,
      fulfilmentDate: new Date(`${request.fulfilmentDate}T00:00:00Z`),
      windowStart: request.window?.start ?? null,
      windowEnd: request.window?.end ?? null,
      paymentMethod: request.paymentMethod,
      subtotalHalalas: BigInt(pricing.subtotal.halalas),
      discountHalalas: BigInt(pricing.discount.halalas),
      deliveryFeeHalalas: pricing.deliveryFee.halalas,
      vatHalalas: BigInt(pricing.vat.halalas),
      totalHalalas: BigInt(pricing.total.halalas),
      commissionBasisPoints: request.commissionBasisPoints,
      carcasses: request.carcasses,
      notes: request.notes,
      customerName: request.customer.name,
      customerPhone: request.customer.phone,
      vendorSnapshot: request.vendor,
      addressSnapshot: request.address ?? undefined,
      pickupSnapshot: request.pickupPoint ?? undefined,
      items: {
        create: request.lines.map((line, position) =>
          OrderMapper.toItemData(line, position),
        ),
      },
      history: {
        create: {
          fromStatus: draft.firstEntry.from,
          toStatus: draft.firstEntry.to,
          actorType: draft.firstEntry.actorType,
          actorId: draft.firstEntry.actorId,
          note: draft.firstEntry.note,
          createdAt: draft.firstEntry.at,
        },
      },
    };
  },

  toItemData(
    line: NewOrderLine,
    position: number,
  ): Omit<Prisma.OrderItemUncheckedCreateInput, 'orderId'> {
    return {
      position,
      productId: line.productId,
      sizeId: line.sizeId,
      quantity: line.quantity,
      unitPriceHalalas: line.unitPrice.halalas,
      totalHalalas: BigInt(line.unitPrice.multiply(line.quantity).halalas),
      packaging: OrderMapper.toPackaging(line.packaging),
      notes: line.notes,
      imageUrl: line.imageUrl,
      snapshot: line.names,
    };
  },

  /** The enum value of a packaging name the catalog allowed; null for none. */
  toPackaging(name: string | null): ProductPackaging | null {
    if (name === null) {
      return null;
    }
    const found = Object.values(ProductPackaging).find(
      (packaging) => packaging === name,
    );
    if (found === undefined) {
      throw new RangeError(`Not a packaging: ${name}`);
    }
    return found;
  },
};
