/// A placed order in the shapes of ORD-API-1 / ORD-API-2 (sprint-3.md). Money is integer halalas (VAT included);
/// [Order.deliveryDate] and [Order.window] are Riyadh values as the server sends them.
library;

import 'package:flutter/foundation.dart';

import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
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
  });

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
  final int vatAmount;

  /// One of `PaymentMethodCode`.
  final String paymentMethod;
  final String? couponCode;
  final String? notes;
  final List<OrderItem> items;
  final DateTime createdAt;
}

/// `{order, payment: {nextAction}}` of `POST /v1/customer/orders`.
@immutable
class PlacedOrder {
  const PlacedOrder({required this.order, this.nextAction});

  final Order order;

  /// [pay] when the order waits for the payment step; null when nothing is left to pay (COD, wallet only).
  // shortcut: the shape of next action is the app's until ORD-API-1 #81 defines it (not-built-yet.md).
  final String? nextAction;

  static const pay = 'pay';
}
