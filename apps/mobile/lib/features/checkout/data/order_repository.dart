import 'dart:math';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Placing an order (ORD-API-1). ORD-MOB-2 #85 adds the order list and detail.
// ignore: one_member_abstracts, the seam between the API and the USE_MOCKS data.
abstract interface class OrderRepository {
  /// `POST /v1/customer/orders` with the header `Idempotency-Key: [idempotencyKey]`: the caller's cart (with its
  /// fulfilment) becomes an order and the server clears the cart. The same key answers the same order.
  /// Throws ORDERING_PAUSED, DAY_FULL, ADDRESS_NOT_COVERED, FULFILMENT_NOT_SUPPORTED, PRICE_CHANGED, a COUPON_*
  /// code or one of [OrderError].
  Future<PlacedOrder> place({required String idempotencyKey, required String paymentMethod});
}

/// A random UUID v4: one per checkout attempt.
String newIdempotencyKey([Random? random]) {
  final r = random ?? Random.secure();
  final b = [for (var i = 0; i < 16; i++) r.nextInt(256)];
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  final h = [for (final x in b) x.toRadixString(16).padLeft(2, '0')].join();
  return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}';
}

/// ORD-API-1's placement in memory, for USE_MOCKS and tests, on the mock cart and scheduler: it re-checks the
/// pause, the prices, the minimum order, coverage and the day, snapshots the lines, numbers the order in Riyadh
/// time ([now] is injectable) and clears the cart. One order per idempotency key, also for parallel calls.
// shortcut: mock orders until ORD-API-1 #81 lands (not-built-yet.md).
class MockOrderRepository implements OrderRepository {
  MockOrderRepository(
    this.cart,
    this.checkout, {
    required this.addresses,
    DateTime Function()? now,
    this.delay = const Duration(milliseconds: 600),
  }) : now = now ?? DateTime.now;

  final MockCartRepository cart;
  final MockCheckoutRepository checkout;
  final AddressRepository addresses;
  final DateTime Function() now;
  final Duration delay;

  /// The orders created, in order.
  final List<Order> orders = [];

  /// For tests and QA: the next placement finds the first line's price changed (PRICE_CHANGED, and the cart
  /// then shows its price banner).
  bool changePriceNext = false;

  final _byKey = <String, Future<PlacedOrder>>{};

  @override
  Future<PlacedOrder> place({required String idempotencyKey, required String paymentMethod}) async {
    final placing = _byKey[idempotencyKey] ??= _place(paymentMethod);
    try {
      return await placing;
    } on Object {
      // A refusal saves nothing, so the same key may try again.
      if (identical(_byKey[idempotencyKey], placing)) _byKey.remove(idempotencyKey)?.ignore();
      rethrow;
    }
  }

  Future<PlacedOrder> _place(String paymentMethod) async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
    if (checkout.paused) throw const ApiError(code: FulfilmentError.orderingPaused);
    if (changePriceNext) {
      changePriceNext = false;
      final entries = await cart.read();
      if (entries.isNotEmpty) {
        final first = entries.first;
        await cart.write([first.copyWith(unitPriceSnapshot: first.unitPriceSnapshot - 500), ...entries.skip(1)]);
      }
    }
    final c = await cart.get(); // re-priced
    if (c.lines.isEmpty) throw const ApiError(code: 'VALIDATION_FAILED');
    if (c.issues.any((i) => i.code == CartIssueCode.priceChanged)) throw const ApiError(code: OrderError.priceChanged);
    if (c.issues.isNotEmpty) throw const ApiError(code: OrderError.itemUnavailable);
    if ((c.minOrderRemaining ?? 0) > 0) throw const ApiError(code: OrderError.minOrderNotMet);
    final f = c.fulfilment;
    if (f == null) throw const ApiError(code: 'VALIDATION_FAILED');
    final address = f.method == Fulfilment.delivery
        ? (await addresses.list()).where((a) => a.id == f.addressId).firstOrNull
        : null;
    if (f.method == Fulfilment.delivery) {
      if (address == null) throw const ApiError(code: 'NOT_FOUND');
      if (!address.covered) throw const ApiError(code: FulfilmentError.addressNotCovered);
    }
    final day = (await checkout.days(f.method)).where((d) => d.date == f.date).firstOrNull;
    if (day == null || !day.available) {
      throw ApiError(code: day?.reason == DayReason.full ? FulfilmentError.dayFull : 'VALIDATION_FAILED');
    }

    final created = now().toUtc();
    final riyadh = created.add(const Duration(hours: 3));
    String two(int n) => n.toString().padLeft(2, '0');
    // Numbered across all days, not per Riyadh day like the server.
    final number =
        'JZ-${two(riyadh.year % 100)}${two(riyadh.month)}${two(riyadh.day)}-'
        '${(orders.length + 1).toString().padLeft(4, '0')}';
    final gateway = PaymentMethodCode.gateway.contains(paymentMethod);
    final order = Order(
      id: 'o-${orders.length + 1}',
      number: number,
      status: gateway ? OrderStatus.pendingPayment : OrderStatus.created,
      vendorId: c.vendorId!,
      vendorName: c.vendorName!,
      fulfilment: f.method,
      addressSnapshot: address,
      pickupSnapshot: f.method == Fulfilment.pickup ? c.pickup : null,
      deliveryDate: f.date,
      window: day.window,
      subtotal: c.subtotal,
      discount: c.discount,
      deliveryFee: c.deliveryFee,
      total: c.total,
      vatAmount: c.vatIncluded,
      paymentMethod: paymentMethod,
      couponCode: c.couponCode,
      createdAt: created,
      items: [
        for (final l in c.lines)
          OrderItem(
            productId: l.item.productId,
            sizeId: l.item.sizeId,
            name: l.name!,
            sizeGrams: l.sizeGrams,
            cutId: l.item.cutId,
            cutName: l.cutName,
            packagingId: l.item.packagingId,
            exclusionIds: l.item.exclusionIds,
            notes: l.item.notes,
            quantity: l.item.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          ),
      ],
    );
    orders.add(order);
    // The server clears the cart in the order transaction.
    await cart.write(const []);
    cart.onCleared();
    return PlacedOrder(order: order, nextAction: gateway ? PlacedOrder.pay : null);
  }
}
