import 'dart:math';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Placing an order (ORD-API-1). ORD-MOB-2 #85 adds the order list and detail.
// ignore: one_member_abstracts, the seam between the API and the USE_MOCKS data.
abstract interface class OrderRepository {
  /// `POST /v1/customer/orders` with the header `Idempotency-Key: [idempotencyKey]`: the caller's cart (with its
  /// fulfilment) becomes an order and the server clears the cart. The same key answers the same order.
  /// [walletAmount] halalas are paid from the wallet (the tender plan); [paymentMethod] pays the rest.
  /// Throws ORDERING_PAUSED, DAY_FULL, ADDRESS_NOT_COVERED, FULFILMENT_NOT_SUPPORTED, PRICE_CHANGED, a COUPON_*
  /// code or one of [OrderError].
  Future<PlacedOrder> place({required String idempotencyKey, required String paymentMethod, int walletAmount = 0});
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
/// It is also the mock payment server (PAY-API-1, ORD-API-2): it debits the [wallet], keeps each order's
/// payments, captures or fails them on the fake provider's decision, and cancels an unpaid order after
/// [paymentTimeout] (giving the wallet part back).
// shortcut: mock orders and payments until ORD-API-1 #81, ORD-API-2 #82 and PAY-API-1 #76 land (not-built-yet.md).
class MockOrderRepository implements OrderRepository {
  MockOrderRepository(
    this.cart,
    this.checkout, {
    required this.addresses,
    MockWallet? wallet,
    DateTime Function()? now,
    this.codAutoConfirm = false,
    this.delay = const Duration(milliseconds: 600),
  }) : wallet = wallet ?? MockWallet(),
       now = now ?? DateTime.now;

  final MockCartRepository cart;
  final MockCheckoutRepository checkout;
  final AddressRepository addresses;
  final MockWallet wallet;
  final DateTime Function() now;
  final Duration delay;

  /// `ops.cod.confirmation`: auto confirms a COD order, review leaves it `new` for the admin.
  bool codAutoConfirm;

  /// ORD-API-2: an unpaid order is cancelled after 15 minutes.
  static const paymentTimeout = Duration(minutes: 15);

  /// The orders created, in order.
  final List<Order> orders = [];

  /// For tests and QA: the next placement finds the first line's price changed (PRICE_CHANGED, and the cart
  /// then shows its price banner).
  bool changePriceNext = false;

  final _byKey = <String, Future<PlacedOrder>>{};

  @override
  Future<PlacedOrder> place({
    required String idempotencyKey,
    required String paymentMethod,
    int walletAmount = 0,
  }) async {
    final placing = _byKey[idempotencyKey] ??= _place(paymentMethod, walletAmount);
    try {
      return await placing;
    } on Object {
      // A refusal saves nothing, so the same key may try again.
      if (identical(_byKey[idempotencyKey], placing)) _byKey.remove(idempotencyKey)?.ignore();
      rethrow;
    }
  }

  Future<PlacedOrder> _place(String paymentMethod, int walletAmount) async {
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

    final walletOnly = paymentMethod == PaymentMethodCode.wallet;
    final fromWallet = walletOnly ? c.total : walletAmount;
    if (fromWallet < 0 || fromWallet > wallet.balance || (!walletOnly && fromWallet >= c.total)) {
      throw const ApiError(code: 'VALIDATION_FAILED');
    }

    final created = now().toUtc();
    final riyadh = created.add(const Duration(hours: 3));
    String two(int n) => n.toString().padLeft(2, '0');
    // Numbered across all days, not per Riyadh day like the server.
    final number =
        'JZ-${two(riyadh.year % 100)}${two(riyadh.month)}${two(riyadh.day)}-'
        '${(orders.length + 1).toString().padLeft(4, '0')}';
    final order = Order(
      id: 'o-${orders.length + 1}',
      number: number,
      status: OrderStatus.pendingPayment,
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
      walletAmount: fromWallet,
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
    wallet.balance -= fromWallet; // debited in the order transaction
    // The server clears the cart in the order transaction.
    await cart.write(const []);
    cart.onCleared();
    return _tender(order, paymentMethod, 'k-${order.id}');
  }

  final _payments = <String, List<_Payment>>{};
  final _paymentByKey = <String, PlacedOrder>{};
  final _restored = <String, int>{};

  Order _order(String id) {
    final o = orders.where((o) => o.id == id).firstOrNull;
    if (o == null) throw const ApiError(code: 'NOT_FOUND');
    return o;
  }

  void _save(Order o) => orders[orders.indexWhere((x) => x.id == o.id)] = o;

  /// What is left to pay goes to [method]: COD and wallet settle at once (ORD-API-2 confirmation rules), a
  /// gateway method gets a new initiated payment and a next action.
  PlacedOrder _tender(Order order, String method, String key) {
    var o = order.copyWith(paymentMethod: method);
    PaymentAction? action;
    if (method == PaymentMethodCode.cod) {
      o = o.copyWith(status: codAutoConfirm ? OrderStatus.confirmed : OrderStatus.created);
    } else if (method == PaymentMethodCode.wallet) {
      // Wallet only: captured without the gateway, so the order is confirmed.
      o = o.copyWith(status: OrderStatus.confirmed);
    } else {
      final p = _Payment('pay-${o.id}-${(_payments[o.id]?.length ?? 0) + 1}', method, o.total - o.walletAmount, key);
      _payments.putIfAbsent(o.id, () => []).add(p);
      action = PaymentAction(paymentId: p.id, method: method, amount: p.amount);
    }
    _save(o);
    return PlacedOrder(order: o, nextAction: action);
  }

  /// The payment timeout job: an unpaid order past [paymentTimeout] is cancelled and its wallet part comes back.
  void _expire(Order o) {
    if (o.status != OrderStatus.pendingPayment || now().toUtc().difference(o.createdAt) < paymentTimeout) return;
    for (final p in _payments[o.id] ?? const <_Payment>[]) {
      if (p.status == PaymentStatus.initiated) p.status = PaymentStatus.cancelled;
    }
    _giveBack(o);
    _save(_order(o.id).copyWith(status: OrderStatus.cancelled));
  }

  void _giveBack(Order o) {
    if (o.walletAmount == 0) return;
    wallet.balance += o.walletAmount;
    _restored[o.id] = (_restored[o.id] ?? 0) + o.walletAmount;
    _save(o.copyWith(walletAmount: 0));
  }

  /// `GET /v1/customer/orders/:id` with its latest payment.
  Future<OrderPayment> status(String orderId) async {
    _expire(_order(orderId));
    final o = _order(orderId);
    return OrderPayment(
      order: o,
      paymentId: _payments[orderId]?.lastOrNull?.id,
      paymentStatus: _payments[orderId]?.lastOrNull?.status,
      walletRestored: _restored[orderId] ?? 0,
    );
  }

  /// A new payment for an unpaid order (a retry or another method), one per idempotency key.
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey}) async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
    final known = _paymentByKey[idempotencyKey];
    if (known != null) return known;
    _expire(_order(orderId));
    final o = _order(orderId);
    if (o.status != OrderStatus.pendingPayment) throw const ApiError(code: PaymentError.orderNotPayable);
    final last = _payments[orderId]?.lastOrNull;
    if (last != null && last.status == PaymentStatus.captured) throw const ApiError(code: PaymentError.orderNotPayable);
    if (last != null && last.status == PaymentStatus.initiated) last.status = PaymentStatus.cancelled;
    if (method == PaymentMethodCode.wallet) {
      if (wallet.balance < o.total - o.walletAmount) throw const ApiError(code: 'VALIDATION_FAILED');
      wallet.balance -= o.total - o.walletAmount;
      _save(o.copyWith(walletAmount: o.total));
    }
    return _paymentByKey[idempotencyKey] = _tender(_order(orderId), method, idempotencyKey);
  }

  /// The fake provider's webhook: approves or declines [paymentId]. Amounts ending in 13 halalas are always
  /// declined, like the PAY-API-1 fake provider's test amounts. A decline gives the wallet part back.
  void decide(String paymentId, {required bool approve}) {
    for (final MapEntry(key: orderId, value: list) in _payments.entries) {
      final p = list.where((p) => p.id == paymentId).firstOrNull;
      if (p == null) continue;
      _expire(_order(orderId));
      if (p.status != PaymentStatus.initiated) return; // late, cancelled or already decided
      final ok = approve && p.amount % 100 != 13;
      p.status = ok ? PaymentStatus.captured : PaymentStatus.failed;
      if (ok) {
        _save(_order(orderId).copyWith(status: OrderStatus.confirmed)); // ORD-API-2: captured → confirmed
      } else {
        _giveBack(_order(orderId));
      }
      return;
    }
  }
}

class _Payment {
  _Payment(this.id, this.method, this.amount, this.key);

  final String id;
  final String method;
  final int amount;
  final String key;
  String status = PaymentStatus.initiated;
}
