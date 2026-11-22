/// A placed order in the shapes of ORD-API-1 / ORD-API-2 (sprint-3.md). Money is integer halalas (VAT included);
/// [Order.deliveryDate] and [Order.window] are Riyadh values as the server sends them.
library;

import 'package:flutter/foundation.dart';

import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// ORD-API-2 statuses.
abstract final class OrderStatus {
  static const pendingPayment = 'pending_payment';
  static const created = 'new';
  static const confirmed = 'confirmed';
  static const preparing = 'preparing';
  static const ready = 'ready';
  static const pickedUp = 'picked_up';
  static const outForDelivery = 'out_for_delivery';
  static const delivered = 'delivered';
  static const collected = 'collected';
  static const cancelled = 'cancelled';
  static const deliveryFailed = 'delivery_failed';
  static const returned = 'returned';
}

/// Placement refusals besides the fulfilment and coupon codes.
abstract final class OrderError {
  static const String priceChanged = CartIssueCode.priceChanged;

  /// The app's names until ORD-API-1 #81 fixes them (not-built-yet.md).
  static const String itemUnavailable = CartIssueCode.unavailable;
  static const minOrderNotMet = 'MIN_ORDER_NOT_MET';

  /// Lead review A6 proposals until ORD-API-1 #81 names them (not-built-yet.md).
  static const cartEmpty = 'CART_EMPTY';
  static const fulfilmentRequired = 'FULFILMENT_REQUIRED';

  /// The wallet part (or wallet only) is above the balance: stay on the review and read the methods again.
  static const walletInsufficient = 'WALLET_INSUFFICIENT';
}

/// An `OrderItem`: product, size and options as they were when ordered, names AR/EN and prices.
@immutable
class OrderItem {
  const OrderItem({
    required this.productId,
    required this.sizeId,
    required this.name,
    required this.quantity,
    required this.unitPrice,
    required this.lineTotal,
    this.cutId,
    this.cutName,
    this.sizeGrams,
    this.packagingId,
    this.exclusionIds = const [],
    this.notes = '',
    this.image,
  });

  /// The product's picture when ordered (the order list thumbnail).
  final String? image;

  final String productId;
  final String sizeId;
  final LocalizedText name;
  final int? sizeGrams;
  final String? cutId;
  final LocalizedText? cutName;
  final String? packagingId;
  final List<String> exclusionIds;
  final String notes;
  final int quantity;
  final int unitPrice;
  final int lineTotal;
}

@immutable
class Order {
  const Order({
    required this.id,
    required this.number,
    required this.status,
    required this.vendorId,
    required this.vendorName,
    required this.fulfilment,
    required this.deliveryDate,
    required this.window,
    required this.subtotal,
    required this.discount,
    required this.deliveryFee,
    required this.total,
    required this.vatAmount,
    required this.paymentMethod,
    required this.items,
    required this.createdAt,
    this.addressSnapshot,
    this.pickupSnapshot,
    this.couponCode,
    this.notes,
    this.walletAmount = 0,
  });

  final String id;

  /// `JZ-YYMMDD-XXXX`.
  final String number;

  /// One of [OrderStatus].
  final String status;
  final String vendorId;
  final LocalizedText vendorName;

  /// Delivery or pickup.
  final Fulfilment fulfilment;
  final Address? addressSnapshot;
  final PickupInfo? pickupSnapshot;

  /// Riyadh `yyyy-MM-dd`.
  final String deliveryDate;
  final TimeWindow window;
  final int subtotal;
  final int discount;
  final int deliveryFee;
  final int total;

  /// From the order answer as is: an API repository never recomputes it (lead review M9).
  final int vatAmount;

  /// One of `PaymentMethodCode`.
  final String paymentMethod;
  final String? couponCode;
  final String? notes;
  final List<OrderItem> items;
  final DateTime createdAt;

  /// Halalas paid from the wallet (PAY-API-1 tender); the rest is paid with [paymentMethod].
  final int walletAmount;

  Order copyWith({String? status, String? paymentMethod, int? walletAmount}) => Order(
    id: id,
    number: number,
    status: status ?? this.status,
    vendorId: vendorId,
    vendorName: vendorName,
    fulfilment: fulfilment,
    addressSnapshot: addressSnapshot,
    pickupSnapshot: pickupSnapshot,
    deliveryDate: deliveryDate,
    window: window,
    subtotal: subtotal,
    discount: discount,
    deliveryFee: deliveryFee,
    total: total,
    vatAmount: vatAmount,
    paymentMethod: paymentMethod ?? this.paymentMethod,
    couponCode: couponCode,
    notes: notes,
    items: items,
    createdAt: createdAt,
    walletAmount: walletAmount ?? this.walletAmount,
  );
}

/// `{order, payment: {nextAction}}` of `POST /v1/customer/orders` (and of a new payment on the order).
@immutable
class PlacedOrder {
  const PlacedOrder({required this.order, this.nextAction});

  final Order order;

  /// Set when the order waits for the gateway step; null when nothing is left to pay (COD, wallet only).
  final PaymentAction? nextAction;
}

/// An order and its latest payment, as the server knows them (the only source of a payment's outcome).
@immutable
class OrderPayment {
  const OrderPayment({required this.order, this.paymentId, this.paymentStatus, this.walletRestored = 0});

  final Order order;

  /// The latest payment; null when the order has no gateway payment.
  final String? paymentId;

  /// One of [PaymentStatus]; null when the order has no gateway payment.
  final String? paymentStatus;

  /// Halalas given back to the wallet because the gateway part failed or the order expired.
  final int walletRestored;
}

/// One `OrderStatusHistory` row (ORD-API-2): the status reached and when (UTC; shown in Riyadh time).
@immutable
class OrderStatusChange {
  const OrderStatusChange(this.to, this.at);

  final String to;
  final DateTime at;
}

/// `GET /v1/customer/orders/:id` (ORD-API-3): the order with its payment, status timeline and what the
/// customer may do. The tracking block (Sprint 4) and the invoice link (Sprint 6) are not read yet.
@immutable
class OrderDetail {
  const OrderDetail({
    required this.order,
    required this.history,
    this.paymentStatus,
    this.canCancel = false,
    this.canComplain = false,
  });

  final Order order;
  final List<OrderStatusChange> history;

  /// One of `PaymentStatus`; null without a gateway payment.
  final String? paymentStatus;
  final bool canCancel;
  final bool canComplain;
}

/// Statuses a customer sees as done (the «المكتملة» tab, ORD-API-3 scope past).
const Set<String> pastOrderStatuses = {
  OrderStatus.delivered,
  OrderStatus.collected,
  OrderStatus.cancelled,
  OrderStatus.deliveryFailed,
  OrderStatus.returned,
};
