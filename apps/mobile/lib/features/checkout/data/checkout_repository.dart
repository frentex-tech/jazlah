import 'dart:math';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Checkout step 1 routes (SCH-API-1 / SCH-API-2). The server computes the days; the app only shows them.
abstract interface class CheckoutRepository {
  /// `paused` of `GET /v1/public/settings/client`.
  Future<OrderingPause> pause();

  /// `GET /v1/customer/checkout/days?method=` for the caller's cart. Throws FULFILMENT_NOT_SUPPORTED when an
  /// item (or the store) does not offer [method].
  Future<List<CheckoutDay>> days(Fulfilment method);

  /// `PATCH /v1/customer/cart/fulfilment`; answers the cart. Throws one of [FulfilmentError].
  Future<Cart> save(FulfilmentChoice choice);
}

/// `ops.cutoffs` of one order type: ordering for a day closes [leadDays] before it, at [time] (Riyadh `HH:mm`).
class Cutoff {
  const Cutoff({required this.leadDays, this.time});

  final int leadDays;
  final String? time;
}

/// The SCH-API-1 defaults and SCH-API-2 day rules in memory, for USE_MOCKS and tests, on top of the mock cart.
/// "Now" is Riyadh (UTC+3, no daylight saving) from the injectable [now].
// shortcut: mock settings and scheduling until SCH-API-1 #68 and SCH-API-2 #69 land (not-built-yet.md).
class MockCheckoutRepository implements CheckoutRepository {
  MockCheckoutRepository(
    this.cart, {
    required this.addresses,
    DateTime Function()? now,
    this.paused = pausedByDefine,
    this.closed = const {3: null, 5: Fulfilment.delivery},
    this.full = const {2},
    this.pickupClosedWeekdays = const {DateTime.friday},
    this.delay = const Duration(milliseconds: 300),
  }) : now = now ?? DateTime.now;

  final MockCartRepository cart;
  final AddressRepository addresses;
  final DateTime Function() now;
  final Duration delay;

  /// The QA pause switch: `--dart-define=MOCK_PAUSED=true`.
  static const pausedByDefine = bool.fromEnvironment('MOCK_PAUSED');
  bool paused;

  /// `ops.closedDays` as days after today → scope (null = delivery and pickup).
  final Map<int, Fulfilment?> closed;

  /// Days after today whose capacity is used up.
  final Set<int> full;

  /// The store's pickup hours skip these weekdays (VENDOR_CLOSED, pickup only).
  final Set<int> pickupClosedWeekdays;

  /// `ops.cutoffs` defaults (adha comes with its own task).
  static const cutoffs = {
    'ready_meat': Cutoff(time: '12:00', leadDays: 0),
    'carcass': Cutoff(time: '20:00', leadDays: 1),
    'cooked': Cutoff(time: '18:00', leadDays: 1),
    'occasion': Cutoff(leadDays: 3),
  };
  static const horizonDays = 14;
  static const window = TimeWindow('16:00', '22:00');
  static const pauseMessage = OrderingPause(
    isPaused: true,
    messageAr: 'يمكنك تصفّح المتجر وإكمال الطلب عند استئناف الاستقبال.',
    messageEn: 'You can keep browsing and finish your order once we resume.',
  );

  Future<void> _wait() => delay > Duration.zero ? Future<void>.delayed(delay) : Future.value();

  static String _date(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  /// The mock catalog has no cooked or occasion products: carcasses and ready meat.
  static String orderType(String productId) => MockProductRepository.isCarcass(productId) ? 'carcass' : 'ready_meat';

  @override
  Future<OrderingPause> pause() async {
    await _wait();
    return paused ? pauseMessage : const OrderingPause();
  }

  @override
  Future<List<CheckoutDay>> days(Fulfilment method) async {
    await _wait();
    final current = await cart.get();
    final ids = current.lines.map((l) => l.item.productId);
    for (final p in (await cart.products(ids)).values) {
      final f = p?.fulfilment;
      if (f != null && f != Fulfilment.both && f != method) throw const ApiError(code: FulfilmentError.notSupported);
    }
    if (method == Fulfilment.pickup && current.lines.isNotEmpty && current.pickup == null) {
      throw const ApiError(code: FulfilmentError.notSupported); // the store has no pickup
    }

    final riyadh = now().toUtc().add(const Duration(hours: 3));
    final today = DateTime.utc(riyadh.year, riyadh.month, riyadh.day);
    // The earliest day is the strictest order type's: today + leadDays, one more once its cutoff has passed.
    final types = {...ids.map(orderType)};
    var lead = 0;
    for (final type in types.isEmpty ? {'ready_meat'} : types) {
      final c = cutoffs[type]!;
      final [h, m] = [for (final p in (c.time ?? '24:00').split(':')) int.parse(p)];
      lead = max(lead, c.leadDays + (riyadh.isAfter(today.add(Duration(hours: h, minutes: m))) ? 1 : 0));
    }
    CheckoutDay at(int i) {
      final date = today.add(Duration(days: i));
      final String? reason;
      if (i >= horizonDays) {
        reason = DayReason.outsideHorizon; // the horizon counts from today
      } else if (i < lead) {
        reason = DayReason.pastCutoff;
      } else if (closed.containsKey(i) && (closed[i] == null || closed[i] == method)) {
        reason = DayReason.closed;
      } else if (method == Fulfilment.pickup && pickupClosedWeekdays.contains(date.weekday)) {
        reason = DayReason.vendorClosed;
      } else {
        reason = full.contains(i) ? DayReason.full : null;
      }
      return CheckoutDay(date: _date(date), available: reason == null, reason: reason, window: window);
    }

    return [for (var i = 0; i <= horizonDays; i++) at(i)];
  }

  @override
  Future<Cart> save(FulfilmentChoice choice) async {
    if (paused) {
      await _wait();
      throw const ApiError(code: FulfilmentError.orderingPaused);
    }
    final day = (await days(choice.method)).where((d) => d.date == choice.date).firstOrNull;
    if (choice.method == Fulfilment.delivery) {
      final address = (await addresses.list()).where((a) => a.id == choice.addressId).firstOrNull;
      if (address == null) throw const ApiError(code: 'NOT_FOUND');
      if (!address.covered) throw const ApiError(code: FulfilmentError.addressNotCovered);
    }
    if (day == null || !day.available) {
      throw ApiError(code: day?.reason == DayReason.full ? FulfilmentError.dayFull : 'VALIDATION_FAILED');
    }
    cart.fulfilment = choice;
    return cart.get();
  }
}
