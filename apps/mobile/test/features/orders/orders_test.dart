import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';
import 'package:jazlah/features/orders/presentation/order_detail_screen.dart';
import 'package:jazlah/features/orders/presentation/orders_providers.dart';
import 'package:jazlah/features/orders/presentation/orders_screen.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/cart_fakes.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

const _home = Address(
  id: 'a1',
  label: 'المنزل',
  point: GeoPoint(24.8168, 46.6195),
  isDefault: true,
  city: 'الرياض',
  district: 'حي الملقا',
);

/// 13:00 Riyadh on Tuesday 10 November 2026; the placed order is delivered tomorrow.
final _now = DateTime.utc(2026, 11, 10, 10);

late MockOrderRepository _orders;

/// The server fails every read.
class _Failing extends MockOrderRepository {
  _Failing(super.cart, super.checkout, {required super.addresses}) : super(delay: Duration.zero);

  int details = 0;

  @override
  Future<List<Order>> list({OrderScope? scope}) async => throw const ApiError(code: 'SERVICE_UNAVAILABLE');

  @override
  Future<OrderDetail> detail(String id) async {
    details++;
    throw const ApiError(code: 'SERVICE_UNAVAILABLE');
  }
}

/// Counts the detail reads.
class _Counting extends MockOrderRepository {
  _Counting(super.cart, super.checkout, {required super.addresses, super.now})
    : super(delay: Duration.zero, seedPast: true);

  int details = 0;

  @override
  Future<OrderDetail> detail(String id) {
    details++;
    return super.detail(id);
  }
}

class _Hanging extends MockOrderRepository {
  _Hanging(super.cart, super.checkout, {required super.addresses});

  @override
  Future<List<Order>> list({OrderScope? scope}) => Completer<List<Order>>().future;

  @override
  Future<OrderDetail> detail(String id) => Completer<OrderDetail>().future;
}

/// [place]: a method to place one order with (the seeded past orders are always there unless [seed] is off).
Future<ProviderContainer> _pump(
  WidgetTester t,
  Widget screen, {
  String? place = PaymentMethodCode.cod,
  bool pickup = false,
  bool seed = true,
  bool signedIn = true,
  bool mocks = true,
  bool hang = false,
  bool fail = false,
  bool count = false,
  bool realtime = true,
  DateTime? today,
  String lang = 'ar',
}) async {
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(kebab.withQuantity(3));
  cart.fulfilment = pickup
      ? const FulfilmentChoice(method: Fulfilment.pickup, date: '2026-11-11')
      : const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: () => _now, delay: Duration.zero);
  _orders = hang
      ? _Hanging(cart, checkout, addresses: book)
      : fail
      ? _Failing(cart, checkout, addresses: book)
      : count
      ? _Counting(cart, checkout, addresses: book, now: () => _now)
      : MockOrderRepository(cart, checkout, addresses: book, now: () => _now, seedPast: seed, delay: Duration.zero);
  if (place != null) {
    // The mock address book waits on a real timer.
    await t.runAsync(() => _orders.place(idempotencyKey: 'k', paymentMethod: place));
  }
  final tokens = MemoryTokens(signedIn ? const AuthTokens(accessToken: 'a', refreshToken: 'r') : null);
  final c = await t.pumpScreen(
    screen,
    prefs: {'locale': lang, 'onboardingSeen': true},
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      cartRepositoryProvider.overrideWithValue(cart),
      addressRepositoryProvider.overrideWithValue(book),
      checkoutRepositoryProvider.overrideWithValue(checkout),
      orderRepositoryProvider.overrideWithValue(_orders),
      ordersRepositoryProvider.overrideWithValue(mocks ? _orders : null),
      orderRealtimeProvider.overrideWithValue(mocks && realtime ? _orders : null),
      ordersClockProvider.overrideWithValue(() => today ?? _now),
    ],
  );
  await _settle(t);
  return c;
}

Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 4; i++) {
    await t.pump(const Duration(milliseconds: 250));
  }
}

void main() {
  group('list', () {
    testWidgets('135-63663: tabs, newest first, badges, «اليوم» on the delivery day', (t) async {
      final c = await _pump(t, const OrdersScreen(), today: DateTime.utc(2026, 11, 11, 10));
      _orders.transition('o-3', OrderStatus.outForDelivery);
      c.invalidate(ordersProvider(null));
      await _settle(t);
      expect(find.text('الكل'), findsOneWidget);
      expect(find.text('طلب JZ-261110-0003'), findsOneWidget);
      expect(find.text('في الطريق'), findsOneWidget);
      expect(find.text('اليوم، 4:00 م'), findsOneWidget);
      expect(find.text('123.00 ر.س'), findsOneWidget);
      expect(find.text('تم التسليم'), findsOneWidget);
      expect(find.text('ملغي'), findsOneWidget);
      expect(find.text('3 نوفمبر 2026'), findsOneWidget); // delivered a week before
      final top = t.getTopLeft(find.text('طلب JZ-261110-0003')).dy;
      expect(top, lessThan(t.getTopLeft(find.text('تم التسليم')).dy));
    });

    testWidgets('the scope tabs: current and completed', (t) async {
      await _pump(t, const OrdersScreen());
      await t.tap(find.text('الجارية'));
      await _settle(t);
      expect(find.text('بانتظار التأكيد'), findsOneWidget);
      expect(find.text('تم التسليم'), findsNothing);
      await t.tap(find.text('المكتملة'));
      await _settle(t);
      expect(find.text('بانتظار التأكيد'), findsNothing);
      expect(find.text('تم التسليم'), findsOneWidget);
      expect(find.text('ملغي'), findsOneWidget);
    });

    testWidgets('a card opens the order', (t) async {
      await _pump(t, const OrdersScreen());
      await t.tap(find.text('طلب JZ-261110-0003'));
      await _settle(t);
      expect(find.text('route:/orders/o-3'), findsOneWidget);
    });

    testWidgets('loading (135-63749): skeleton cards', (t) async {
      await _pump(t, const OrdersScreen(), place: null, hang: true);
      expect(find.byType(JSkeletonRow), findsNWidgets(3));
      expect(find.byType(CartCard), findsNothing); // the skeleton is its own card
      expect(find.text('الكل'), findsNothing); // no tabs while loading
    });

    testWidgets('empty (135-63826): start a first order', (t) async {
      await _pump(t, const OrdersScreen(), place: null, seed: false);
      expect(find.text('لا توجد طلبات بعد'), findsOneWidget);
      expect(find.text('الكل'), findsNothing);
      await t.tap(find.text('ابدأ أول طلب'));
      await _settle(t);
      expect(find.text('route:/home'), findsOneWidget);
    });

    testWidgets('error (135-63940): retry', (t) async {
      await _pump(t, const OrdersScreen(), place: null, fail: true);
      expect(find.text('تعذّر تحميل الطلبات'), findsOneWidget);
      expect(find.text('الكل'), findsNothing); // no tabs on the error
      expect(find.text('إعادة المحاولة'), findsOneWidget);
    });

    testWidgets('real builds without the route: the coming-soon tab, never made-up orders or a dead retry', (t) async {
      await _pump(t, const OrdersScreen(), mocks: false);
      expect(find.text('قريبًا'), findsOneWidget);
      expect(find.text('إعادة المحاولة'), findsNothing);
    });

    testWidgets('a status change elsewhere reaches the list (order.updated)', (t) async {
      await _pump(t, const OrdersScreen());
      expect(find.text('بانتظار التأكيد'), findsOneWidget);
      _orders.transition('o-3', OrderStatus.preparing);
      await _settle(t);
      expect(find.text('قيد التجهيز'), findsOneWidget);
      expect(find.text('بانتظار التأكيد'), findsNothing);
    });

    testWidgets('not signed in (135-64028): sign in, back to the orders', (t) async {
      await _pump(t, const OrdersScreen(), signedIn: false);
      expect(find.text('سجّل دخولك لعرض الطلبات'), findsOneWidget);
      await t.tap(find.text('تسجيل الدخول'));
      await _settle(t);
      expect(find.text('route:/login'), findsOneWidget);
    });

    testWidgets('English', (t) async {
      await _pump(t, const OrdersScreen(), lang: 'en');
      expect(find.text('My orders'), findsOneWidget);
      expect(find.text('Order JZ-261110-0003'), findsOneWidget);
      expect(find.text('Awaiting confirmation'), findsOneWidget);
    });
  });

  group('detail', () {
    testWidgets('before shipping (135-64189): header, timeline, the two reserved slots, items, totals, payment', (
      t,
    ) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'));
      expect(find.text('تفاصيل الطلب'), findsOneWidget);
      expect(find.text('طلب JZ-261110-0003'), findsOneWidget);
      expect(find.text('بانتظار التأكيد'), findsOneWidget);
      expect(
        find.text('مجازر الفلاح · توصيل الأربعاء 11 نوفمبر بين 4:00 و10:00 م إلى حي الملقا، الرياض'),
        findsOneWidget,
      );
      expect(find.text('تم استلام الطلب'), findsOneWidget);
      expect(find.text('1:00 م'), findsOneWidget); // placed at 13:00 Riyadh
      expect(find.text('لم يبدأ التوصيل بعد'), findsOneWidget);
      expect(find.text('بانتظار الذبح والتجهيز'), findsOneWidget);
      // The drawn cards first (header, tracking, freshness), then the added ones, titles inside their cards.
      double y(String text) => t.getTopLeft(find.text(text)).dy;
      expect(y('شهادة الطزاجة'), lessThan(y('حالة الطلب')));
      expect(find.ancestor(of: find.text('حالة الطلب'), matching: find.byType(JStatusTimeline)), findsOneWidget);
      expect(find.text('إلغاء الطلب'), findsNothing);
      expect(find.text('الإبلاغ عن مشكلة'), findsNothing);
      await t.scrollUntilVisible(find.text('الدفع'), 300, scrollable: find.byType(Scrollable).first);
      expect(find.text('108.00 ر.س'), findsWidgets);
      expect(find.text('الدفع عند الاستلام'), findsOneWidget);
    });

    testWidgets('a status change arrives (order.updated): the open detail updates without a refresh', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'));
      _orders.transition('o-3', OrderStatus.preparing); // from the dashboard
      await _settle(t);
      expect(find.text('قيد التجهيز'), findsOneWidget);
      _orders.transition('o-3', OrderStatus.outForDelivery);
      await _settle(t);
      expect(find.text('في الطريق'), findsOneWidget);
      expect(find.text('لم يبدأ التوصيل بعد'), findsNothing); // the slot steps aside, no fake driver
    });

    testWidgets('no socket: the 30 s polling picks the change up', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'), realtime: false);
      _orders.transition('o-3', OrderStatus.preparing);
      await _settle(t);
      expect(find.text('قيد التجهيز'), findsNothing);
      await t.pump(OrderDetailScreen.pollEvery);
      await _settle(t);
      expect(find.text('قيد التجهيز'), findsOneWidget);
    });

    testWidgets('an unpaid order opens the payment step', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'), place: PaymentMethodCode.mada);
      expect(find.text('بانتظار الدفع'), findsWidgets);
      await t.tap(find.text('إكمال الدفع'));
      await _settle(t);
      expect(find.text('route:/checkout/pay/o-3'), findsOneWidget);
    });

    testWidgets('delivered: the whole timeline, no reserved slots, paid', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-2'));
      expect(find.text('تم التسليم'), findsWidgets);
      expect(find.text('لم يبدأ التوصيل بعد'), findsNothing);
      expect(find.text('بانتظار الذبح والتجهيز'), findsNothing);
      await t.scrollUntilVisible(find.textContaining('مدفوع'), 300, scrollable: find.byType(Scrollable).first);
      expect(find.text('مدى · مدفوع'), findsOneWidget);
    });

    testWidgets('pickup: the pickup point and its hours, no tracking slot', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'), pickup: true);
      expect(find.text('لم يبدأ التوصيل بعد'), findsNothing);
      await t.scrollUntilVisible(find.text('موقع الاستلام'), 300, scrollable: find.byType(Scrollable).first);
      expect(find.text('مجازر الفلاح · فرع العليا'), findsWidgets);
    });

    testWidgets('loading (135-64272)', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-1'), place: null, hang: true);
      expect(find.byType(JSkeletonRow), findsNWidgets(3));
    });

    testWidgets('error (135-64339): retry', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-1'), place: null, fail: true);
      expect(find.text('تعذّر تحميل الطلب'), findsOneWidget);
      expect(find.text('إعادة المحاولة'), findsOneWidget);
    });

    testWidgets('real builds without the route: coming soon', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-1'), mocks: false);
      expect(find.text('قريبًا'), findsOneWidget);
      expect(find.text('إعادة المحاولة'), findsNothing);
    });

    testWidgets("another account's order: the 30 s polling stops", (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-99'), count: true, realtime: false);
      final reads = (_orders as _Counting).details;
      await t.pump(OrderDetailScreen.pollEvery * 3);
      await _settle(t);
      expect((_orders as _Counting).details, reads);
    });

    testWidgets('a readable order keeps polling', (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-3'), count: true, realtime: false);
      expect(find.text('بانتظار التأكيد'), findsOneWidget);
      final reads = (_orders as _Counting).details;
      await t.pump(OrderDetailScreen.pollEvery);
      await _settle(t);
      expect((_orders as _Counting).details, reads + 1);
    });

    testWidgets("another account's order (135-64401)", (t) async {
      await _pump(t, const OrderDetailScreen(id: 'o-99'));
      expect(find.text('لا يمكنك عرض هذا الطلب'), findsOneWidget);
      expect(find.text('رجوع'), findsOneWidget);
    });
  });

  test('sign-out: the next account does not see the orders', () async {
    SharedPreferences.setMockInitialValues({});
    final c = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(await Prefs.load()),
        cartMocksProvider.overrideWithValue(true),
        addressRepositoryProvider.overrideWithValue(MockAddressRepository(seed: [_home])),
      ],
    );
    addTearDown(c.dispose);
    final cart = c.read(cartRepositoryProvider)! as MockCartRepository;
    await cart.add(kebab.withQuantity(3));
    final day = (await c.read(checkoutRepositoryProvider)!.days(Fulfilment.delivery)).firstWhere((d) => d.available);
    cart.fulfilment = FulfilmentChoice(method: Fulfilment.delivery, date: day.date, addressId: 'a1');
    final placed = await c.read(orderRepositoryProvider)!.place(idempotencyKey: 'k', paymentMethod: 'cod');
    final sub = c.listen(ordersProvider(null), (_, _) {});
    expect((await c.read(ordersProvider(null).future)).map((o) => o.id), contains(placed.order.id));
    c.read(accountDataClearedProvider.notifier).fire();
    final after = await c.read(ordersProvider(null).future);
    expect(after.map((o) => o.number), isNot(contains(placed.order.number)));
    expect(after.every((o) => pastOrderStatuses.contains(o.status)), isTrue); // only the seeds
    sub.close();
  });
}
