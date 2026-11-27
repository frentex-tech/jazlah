import { PAYMENT_METHOD_NAMES } from '@modules/payments';
import type { OrderSummary } from '../domain/order-summary.type';
import type { OrderSummaryResponseDto } from './dto/order-summary-response.dto';

/** An order as a list row (`OrderSummaryResponseDto`), from what was saved when it was placed. */
export function toOrderSummaryResponse(
  order: OrderSummary,
): OrderSummaryResponseDto {
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
  };
}

/** The payment method of the DTO's list; the domain's list is the same names (a mismatch fails here). */
function toPaymentMethod(
  method: OrderSummary['paymentMethod'],
): (typeof PAYMENT_METHOD_NAMES)[number] {
  return method;
}
