import { PAYMENT_METHOD_NAMES } from '@modules/payments';
import { PRODUCT_PACKAGINGS } from '@modules/catalog';
import { allowedOrderTransitions } from '../domain/order-state-machine';
import type { OrderActorType } from '../domain/order-actor-type.type';
import type { Order } from '../domain/order.type';
import type { OrderItem } from '../domain/order-item.type';
import type { OrderResponseDto } from './dto/order-response.dto';
import type { OrderItemResponseDto } from './dto/order-item-response.dto';

/**
 * An order as the apps read it (`OrderResponseDto`), from what was saved when it was
 * placed. Sprint 3 holds no payment record (cash on delivery makes none), no coupon, no
 * expiry and no refund, so those parts are empty; the moves a caller may make
 * (`allowedTransitions`) come with the state machine (ORD-API-2).
 */
export function toOrderResponse(
  order: Order,
  actorType: OrderActorType = 'customer',
): OrderResponseDto {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    orderType: order.orderType,
    fulfilment: order.fulfilment,
    fulfilmentDate: order.fulfilmentDate,
    vendor: {
      id: order.vendorId,
      name: order.vendor.name,
      phone: order.vendor.phone,
      location: order.vendor.location,
      city: order.vendor.city,
    },
    customer: {
      id: order.userId,
      name: order.customer.name,
      phone: order.customer.phone,
    },
    paymentMethod: toPaymentMethod(order.paymentMethod),
    totalHalalas: order.total.halalas,
    createdAt: order.createdAt,
    items: order.items.map(toItem),
    address: order.address,
    pickupPoint: order.pickupPoint,
    window: order.window,
    subtotalHalalas: order.subtotal.halalas,
    discountHalalas: order.discount.halalas,
    deliveryFeeHalalas: order.deliveryFee.halalas,
    vatHalalas: order.vat.halalas,
    couponCode: null,
    notes: order.notes,
    cancelReason: order.cancelReason,
    expiresAt: null,
    payment: {
      method: toPaymentMethod(order.paymentMethod),
      status: null,
      paymentId: null,
      walletHalalas: 0,
      walletRestoredHalalas: 0,
      cardLast4: null,
    },
    refunds: [],
    history: order.history.map((entry) => ({
      from: entry.from,
      to: entry.to,
      actorType: entry.actorType,
      note: entry.note,
      at: entry.at,
    })),
    allowedTransitions: allowedOrderTransitions(
      order.status,
      order.fulfilment,
      actorType,
    ),
  };
}

function toItem(item: OrderItem): OrderItemResponseDto {
  return {
    id: item.id,
    productId: item.productId,
    name: item.names.name,
    imageUrl: item.imageUrl,
    size: item.names.size,
    cutting: item.names.cutting,
    packaging: toPackaging(item.packaging),
    exclusions: [...item.names.exclusions],
    notes: item.notes,
    quantity: item.quantity,
    unitPriceHalalas: item.unitPrice.halalas,
    totalHalalas: item.total.halalas,
  };
}

/** The payment method of the DTO's list; the domain's list is the same names (a mismatch fails here). */
function toPaymentMethod(
  method: Order['paymentMethod'],
): (typeof PAYMENT_METHOD_NAMES)[number] {
  return method;
}

function toPackaging(
  name: string | null,
): (typeof PRODUCT_PACKAGINGS)[number] | null {
  if (name === null) {
    return null;
  }
  const found = PRODUCT_PACKAGINGS.find((packaging) => packaging === name);
  if (found === undefined) {
    throw new RangeError(`Not a packaging: ${name}`);
  }
  return found;
}
