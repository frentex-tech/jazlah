import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/cart/data/api_cart_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// Orders on the API: placing (ORD-API-1, `POST /v1/customer/orders` with `Idempotency-Key`) and the customer's
/// list and detail (ORD-API-3, `GET /v1/customer/orders`, `GET /v1/customer/orders/{id}`).
class ApiOrderRepository implements OrderRepository, OrdersRepository {
  ApiOrderRepository(this._api);

  final JazlaApi _api;

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<PlacedOrder> place({required String idempotencyKey, required String paymentMethod, int walletAmount = 0}) =>
      _call(() async {
        final res = (await _api.getCustomerCheckoutApi().customerPlaceOrder(
          idempotencyKey: idempotencyKey,
          placeOrderDto: PlaceOrderDto(
            paymentMethod: paymentMethodFrom(paymentMethod),
            // With wallet only the whole total is taken: the part is left out.
            walletAmountHalalas: walletAmount > 0 && paymentMethod != PaymentMethodCode.wallet ? walletAmount : null,
          ),
        )).data!;
        return placedFrom(res);
      });

  @override
  Future<List<Order>> list({OrderScope? scope}) => _call(() async {
    final res = (await _api.getCustomerOrdersApi().customerListOrders(scope: scope?.name)).data!;
    return [for (final o in res.items) orderFromSummary(o)];
  });

  @override
  Future<OrderDetail> detail(String id) => _call(() async {
    final o = (await _api.getCustomerOrdersApi().customerGetOrder(id: id)).data!;
    return OrderDetail(
      order: orderFrom(o),
      history: [for (final h in o.history) OrderStatusChange(h.to.value, h.at.toUtc())],
      paymentStatus: o.payment.status?.value,
      // Cancelling is Sprint 4 (CAN-API-1) and complaints Sprint 5: the contract answers neither yet.
    );
  });
}

PaymentMethod paymentMethodFrom(String method) =>
    PaymentMethod.values.firstWhere((m) => m.value == method, orElse: () => PaymentMethod.unknownDefaultOpenApi);

/// `{order, payment}`: the next action is the payment's `nextAction` (null for COD and wallet only).
PlacedOrder placedFrom(OrderWithPaymentResponseDto d) {
  final p = d.payment;
  final next = p?.nextAction;
  return PlacedOrder(
    order: orderFrom(d.order),
    nextAction: p == null || next == null
        ? null
        : PaymentAction(
            paymentId: p.id,
            method: p.method.value,
            amount: p.amountHalalas,
            type: next.type.value,
            redirectUrl: next.redirectUrl,
            returnUrl: next.returnUrl,
          ),
  );
}

/// `OrderResponseDto` as the app's [Order].
Order orderFrom(OrderResponseDto o) {
  final pickup = pickupFrom(o.pickupPoint);
  final window = o.window ?? o.pickupPoint?.hours;
  final a = o.address;
  return Order(
    id: o.id,
    number: o.number,
    status: o.status.value,
    vendorId: o.vendor.id,
    vendorName: text(o.vendor.name),
    vendorPhone: o.vendor.phone,
    vendorPoint: point(o.vendor.location),
    fulfilment: fulfilmentFrom(o.fulfilment),
    addressSnapshot: a == null
        ? null
        : Address(
            id: '',
            label: a.label,
            point: point(a.location)!,
            isDefault: false,
            city: a.city,
            district: a.district,
            street: a.street,
            building: a.building,
            driverInstructions: a.driverInstructions,
          ),
    pickupSnapshot: pickup,
    deliveryDate: o.fulfilmentDate,
    window: window == null ? null : TimeWindow(window.start, window.end),
    subtotal: o.subtotalHalalas,
    discount: o.discountHalalas,
    deliveryFee: o.deliveryFeeHalalas,
    total: o.totalHalalas,
    vatAmount: o.vatHalalas,
    paymentMethod: o.paymentMethod.value,
    couponCode: o.couponCode,
    notes: o.notes,
    walletAmount: o.payment.walletHalalas,
    cardLast4: o.payment.cardLast4,
    expiresAt: o.expiresAt?.toUtc(),
    createdAt: o.createdAt.toUtc(),
    items: [
      for (final i in o.items)
        OrderItem(
          productId: i.productId,
          sizeId: i.size.id,
          name: text(i.name),
          sizeGrams: i.size.approxWeightGrams,
          cutId: i.cutting?.id,
          cutName: i.cutting == null ? null : text(i.cutting!.name),
          packagingId: i.packaging?.value,
          exclusionIds: [for (final e in i.exclusions) e.id],
          notes: i.notes ?? '',
          quantity: i.quantity,
          unitPrice: i.unitPriceHalalas,
          lineTotal: i.totalHalalas,
          image: i.imageUrl,
        ),
    ],
  );
}

/// A list row (`OrderSummaryResponseDto`): only these fields come; the money parts, lines and window are not in a
/// summary, so they stay empty here.
// shortcut: the card's items line, thumbnail and «اليوم، 4:00 م» time are hidden until a summary carries the lines'
// names and image and the window, an ask for ORD-API-3 #83 (not-built-yet.md).
Order orderFromSummary(OrderSummaryResponseDto o) => Order(
  id: o.id,
  number: o.number,
  status: o.status.value,
  vendorId: o.vendor.id,
  vendorName: text(o.vendor.name),
  vendorPhone: o.vendor.phone,
  vendorPoint: point(o.vendor.location),
  fulfilment: fulfilmentFrom(o.fulfilment),
  deliveryDate: o.fulfilmentDate,
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  total: o.totalHalalas,
  vatAmount: 0,
  paymentMethod: o.paymentMethod.value,
  createdAt: o.createdAt.toUtc(),
  items: const [],
);

/// The order and its latest payment as `GET /v1/customer/orders/{id}` answers them.
OrderPayment orderPaymentFrom(OrderResponseDto o) => OrderPayment(
  order: orderFrom(o),
  paymentId: o.payment.paymentId,
  paymentStatus: o.payment.status?.value,
  walletRestored: o.payment.walletRestoredHalalas,
);
