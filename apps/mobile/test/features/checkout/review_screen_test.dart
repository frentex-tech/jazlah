import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
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
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/checkout/presentation/order_placed_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

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

/// 13:00 Riyadh, Tuesday 10 November 2026.
DateTime _now() => DateTime.utc(2026, 11, 10, 10);

/// Refuses every placement with [code] (or, with [then], only the first one), and records the keys sent.
class _Orders implements OrderRepository {
  _Orders(this.inner, {this.code, this.then = false});

  final MockOrderRepository inner;
  final String? code;
  final bool then;
  final keys = <String>[];
  final wallets = <int>[];

  @override
  Future<PlacedOrder> place({
    required String idempotencyKey,
    required String paymentMethod,
    int walletAmount = 0,
  }) async {
    keys.add(idempotencyKey);
    wallets.add(walletAmount);
    if (code != null && (!then || keys.length == 1)) throw ApiError(code: code!);
    return inner.place(idempotencyKey: idempotencyKey, paymentMethod: paymentMethod, walletAmount: walletAmount);
  }
}

late MockCartRepository _cart;
late MockCheckoutRepository _checkout;
late MockOrderRepository _orders;
late _Orders _fake;

final _routes = [
  GoRoute(path: Routes.checkoutReview, builder: (_, _) => const ReviewScreen()),
  GoRoute(
    path: Routes.orderPlaced,
    builder: (_, s) => OrderPlacedScreen(args: s.extra! as OrderPlacedArgs),
  ),
];

/// [screen] at the root: the review alone, or checkout step 1 to go through both steps.
Future<ProviderContainer> _pump(
  WidgetTester t, {
  Widget screen = const ReviewScreen(),
  String? code,
  bool then = false,
  String lang = 'ar',
}) async {
  _cart = MockCartRepository(delay: Duration.zero);
  await _cart.add(kebab.withQuantity(3));
  _cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  _checkout = MockCheckoutRepository(_cart, addresses: book, now: _now, delay: Duration.zero);
  _orders = MockOrderRepository(_cart, _checkout, addresses: book, now: _now, delay: const Duration(milliseconds: 300));
  _fake = _Orders(_orders, code: code, then: then);
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final c = await t.pumpScreen(
    screen,
    prefs: {'locale': lang, 'onboardingSeen': true},
    routes: _routes,
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      cartRepositoryProvider.overrideWithValue(_cart),
      cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
      addressRepositoryProvider.overrideWithValue(book),
      checkoutRepositoryProvider.overrideWithValue(_checkout),
      paymentRepositoryProvider.overrideWithValue(MockPaymentRepository(_cart, _orders, delay: Duration.zero)),
      orderRepositoryProvider.overrideWithValue(_fake),
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

JRadio _radio(WidgetTester t, String label) => t.widget<JRadio>(find.widgetWithText(JRadio, label));
VoidCallback? _confirm(WidgetTester t) => t.widget<JButton>(find.widgetWithText(JButton, 'تأكيد الطلب')).onPressed;

/// Picks the saved mada card (nothing is preselected).
Future<void> _pickMada(WidgetTester t) async {
  await t.tap(find.text('بطاقة مدى · تنتهي بـ 4821'));
  await t.pump();
}

void main() {
  testWidgets('default (170-28952): items, fulfilment, totals, methods; nothing preselected (170-29357)', (t) async {
    await _pump(t);
    expect(find.text('الدفع والمراجعة'), findsOneWidget);
    expect(find.text('منتج واحد من مجازر الفلاح'), findsOneWidget);
    expect(find.textContaining('× 3'), findsOneWidget);
    expect(find.text('الأربعاء 11 نوفمبر · 4:00 – 10:00 م'), findsOneWidget);
    expect(find.text('توصيل إلى حي الملقا، الرياض'), findsOneWidget);
    expect(find.text('108.00 ر.س'), findsOneWidget);
    expect(find.text('15.00 ر.س'), findsOneWidget);
    expect(find.text('123.00 ر.س'), findsOneWidget);
    expect(_radio(t, 'بطاقة مدى · تنتهي بـ 4821').checked, isFalse);
    expect(_radio(t, 'محفظة جزلة · الرصيد غير كافٍ').onTap, isNull);
    expect(find.text('اختر طريقة دفع للمتابعة'), findsOneWidget);
    expect(_confirm(t), isNull);
    expect(find.text('استخدام رصيد المحفظة · 50.00 ر.س'), findsOneWidget); // the tender plan's wallet part
    const terms = 'بتأكيد الطلب فأنت توافق على الشروط والأحكام وسياسة الإلغاء.';
    await t.scrollUntilVisible(find.text(terms), 200, scrollable: find.byType(Scrollable).first);
    expect(find.text(terms), findsOneWidget);
    await _pickMada(t);
    expect(find.text('اختر طريقة دفع للمتابعة'), findsNothing);
    expect(_confirm(t), isNotNull);
  });

  testWidgets('method chosen (170-29025): tapping another method checks it', (t) async {
    await _pump(t);
    await t.tap(find.text('الدفع عند الاستلام'));
    await t.pump();
    expect(_radio(t, 'الدفع عند الاستلام').checked, isTrue);
    expect(_radio(t, 'بطاقة مدى · تنتهي بـ 4821').checked, isFalse);
  });

  testWidgets('English: names and labels in English', (t) async {
    await _pump(t, lang: 'en');
    expect(find.text('Payment and review'), findsOneWidget);
    expect(find.text('1 product from Al Falah Butchers'), findsOneWidget);
    expect(find.text('JAZLA wallet · insufficient balance'), findsOneWidget);
  });

  testWidgets('COD → order placed (170-29472), cart cleared, track and home', (t) async {
    final c = await _pump(t);
    await t.tap(find.text('الدفع عند الاستلام'));
    await t.pump();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('رقم الطلب JZ-261110-0001'), findsOneWidget);
    expect(find.text('ذبح وتجهيز طازج صباح الأربعاء'), findsOneWidget);
    expect(find.text('11 نوفمبر 2026 · بإشراف مجازر الفلاح'), findsOneWidget);
    expect(find.text('توصيل بين 4:00 و10:00 م'), findsOneWidget);
    expect(find.text('حي الملقا، الرياض'), findsOneWidget);
    expect(find.text('123.00 ر.س شامل الضريبة'), findsOneWidget);
    expect(find.text('الدفع عند الاستلام'), findsOneWidget);
    expect(c.read(cartCountProvider), 0);
    await t.tap(find.text('تتبع الطلب'));
    await t.pumpAndSettle();
    expect(find.text('route:/orders/o-1'), findsOneWidget);
  });

  testWidgets('order placed: home goes home', (t) async {
    await _pump(t);
    await t.tap(find.text('الدفع عند الاستلام'));
    await t.pump();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    await t.tap(find.text('العودة للرئيسية'));
    await t.pumpAndSettle();
    expect(find.text('route:/home'), findsOneWidget);
  });

  testWidgets('a card method → the payment step', (t) async {
    await _pump(t);
    await _pickMada(t);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('route:/checkout/pay/o-1'), findsOneWidget);
    expect(_orders.orders.single.status, OrderStatus.pendingPayment);
  });

  testWidgets('the wallet part (tender plan): the switch sends it at placement, the card pays the rest', (t) async {
    await _pump(t);
    final wallet = find.text('استخدام رصيد المحفظة · 50.00 ر.س');
    await t.ensureVisible(wallet);
    await t.pump();
    await t.tap(wallet);
    await t.pump();
    await t.ensureVisible(find.text('بطاقة مدى · تنتهي بـ 4821'));
    await t.pump();
    await _pickMada(t);
    await t.ensureVisible(find.textContaining('المتبقي'));
    await t.pump();
    expect(find.text('المتبقي 73.00 ر.س بطريقة الدفع المختارة'), findsOneWidget);
    expect(find.text('محفظة جزلة · الرصيد غير كافٍ'), findsNothing); // the wallet-only row steps aside
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('route:/checkout/pay/o-1'), findsOneWidget);
    expect(_orders.orders.single.walletAmount, 5000);
    expect(_orders.wallet.balance, 0);
  });

  testWidgets('double tap on «تأكيد الطلب» creates one order', (t) async {
    await _pump(t);
    await _pickMada(t);
    // Two taps in the same frame: the second runs before any rebuild.
    await t.tap(find.text('تأكيد الطلب'));
    await t.tap(find.text('تأكيد الطلب'), warnIfMissed: false);
    await t.pump(const Duration(milliseconds: 50));
    await _settle(t);
    expect(_orders.orders, hasLength(1));
    expect(_fake.keys.toSet(), hasLength(1));
  });

  testWidgets('a retry after a failure sends the same idempotency key', (t) async {
    await _pump(t, code: ApiError.network, then: true);
    await _pickMada(t);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.'), findsOneWidget);
    expect(find.text('الدفع والمراجعة'), findsOneWidget); // stays
    await t.pump(const Duration(seconds: 4)); // the toast over the button goes
    await t.pumpAndSettle();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(_fake.keys, hasLength(2));
    expect(_fake.keys[0], _fake.keys[1]);
    expect(_orders.orders, hasLength(1));
  });

  testWidgets("after a failure that keeps the key the method is locked; placed shows the order's method", (t) async {
    await _pump(t, code: ApiError.network, then: true);
    await t.tap(find.text('الدفع عند الاستلام'));
    await t.pump();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    await t.pump(const Duration(seconds: 4));
    await t.pumpAndSettle();
    await t.tap(find.text('بطاقة مدى · تنتهي بـ 4821'), warnIfMissed: false);
    await t.pump();
    expect(_radio(t, 'الدفع عند الاستلام').checked, isTrue);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('الدفع عند الاستلام'), findsOneWidget);
  });

  testWidgets('a retry with the kept key sends the same wallet part, even if the balance changed', (t) async {
    final c = await _pump(t, code: ApiError.network, then: true);
    final wallet = find.text('استخدام رصيد المحفظة · 50.00 ر.س');
    await t.ensureVisible(wallet);
    await t.pump();
    await t.tap(wallet);
    await t.pump();
    await t.ensureVisible(find.text('بطاقة مدى · تنتهي بـ 4821'));
    await t.pump();
    await _pickMada(t);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    _orders.wallet.balance = 3000; // the balance moved; the tender plan would now say 30.00
    c.invalidate(paymentMethodsProvider(null));
    await _settle(t);
    await t.pump(const Duration(seconds: 4));
    await t.pumpAndSettle();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(_fake.keys[0], _fake.keys[1]);
    expect(_fake.wallets, [5000, 5000]);
  });

  testWidgets('while placing the methods are frozen, not drawn disabled', (t) async {
    await _pump(t);
    await _pickMada(t);
    await t.tap(find.text('تأكيد الطلب'));
    await t.pump(const Duration(milliseconds: 50));
    expect(_radio(t, 'Apple Pay').onTap, isNotNull);
    await t.tap(find.text('Apple Pay'), warnIfMissed: false);
    await t.pump();
    expect(_radio(t, 'Apple Pay').checked, isFalse);
    await _settle(t);
  });

  testWidgets('WALLET_INSUFFICIENT: stays, the wallet part is switched off and the methods are read again', (t) async {
    await _pump(t, code: 'WALLET_INSUFFICIENT', then: true);
    final wallet = find.text('استخدام رصيد المحفظة · 50.00 ر.س');
    await t.ensureVisible(wallet);
    await t.pump();
    await t.tap(wallet);
    await t.pump();
    await t.ensureVisible(find.text('بطاقة مدى · تنتهي بـ 4821'));
    await t.pump();
    await _pickMada(t);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect(find.text('الدفع والمراجعة'), findsOneWidget);
    expect(find.text('رصيد محفظتك لم يعد يكفي، اختر طريقة الدفع من جديد.'), findsOneWidget);
    expect(find.textContaining('المتبقي'), findsNothing); // switched off
    await t.pump(const Duration(seconds: 4));
    await t.pumpAndSettle();
    await t.tap(find.text('تأكيد الطلب')); // a definite refusal: not locked, mada still chosen
    await _settle(t);
    expect(_orders.orders.single.walletAmount, 0);
  });

  test('every refusal code has its step', () {
    for (final code in [
      'DAY_FULL',
      'DAY_NOT_AVAILABLE',
      'FULFILMENT_REQUIRED',
      'ADDRESS_NOT_COVERED',
      'ORDERING_PAUSED',
      'FULFILMENT_NOT_SUPPORTED',
    ]) {
      expect(reviewExit(code), ReviewExit.fulfilment, reason: code);
    }
    for (final code in [
      'PRICE_CHANGED',
      'ITEM_UNAVAILABLE',
      'MIN_ORDER_NOT_MET',
      'CART_EMPTY',
      'COUPON_NOT_FOUND',
      'COUPON_EXPIRED',
      'COUPON_MIN_ORDER',
      'COUPON_NOT_APPLICABLE',
      'COUPON_LIMIT_REACHED',
    ]) {
      expect(reviewExit(code), ReviewExit.cart, reason: code);
    }
    expect(reviewExit(ApiError.network), isNull);
    expect(reviewExit('WALLET_INSUFFICIENT'), isNull); // stays; the methods are read again
    expect(reviewExit('VALIDATION_FAILED'), isNull); // the validation pipe only, never a business refusal
  });

  group('through checkout step 1', () {
    Future<void> toReview(WidgetTester t) async {
      await t.tap(find.text('متابعة إلى الدفع'));
      await _settle(t);
      expect(find.text('الدفع والمراجعة'), findsOneWidget);
    }

    Future<void> confirm(WidgetTester t) async {
      await _pickMada(t);
      await t.tap(find.text('تأكيد الطلب'));
      await _settle(t);
    }

    testWidgets('DAY_FULL → back to the day step, days asked again', (t) async {
      await _pump(t, screen: const CheckoutScreen(), code: FulfilmentError.dayFull);
      await toReview(t);
      final container = ProviderScope.containerOf(t.element(find.byType(ReviewScreen)));
      var asked = 0;
      container.listen(checkoutDaysProvider((method: Fulfilment.delivery, addressId: 'a1')), (_, _) => asked++);
      await confirm(t);
      expect(find.text('الخطوة 1 من 3: الاستلام واليوم'), findsOneWidget);
      expect(find.text('اكتمل هذا اليوم، اختر يومًا آخر.'), findsOneWidget);
      expect(asked, greaterThan(0));
    });

    testWidgets('ADDRESS_NOT_COVERED → back to the address step', (t) async {
      await _pump(t, screen: const CheckoutScreen(), code: FulfilmentError.addressNotCovered);
      await toReview(t);
      await confirm(t);
      expect(find.text('الخطوة 1 من 3: الاستلام واليوم'), findsOneWidget);
      expect(find.text('هذا العنوان خارج نطاق التوصيل.'), findsOneWidget);
    });

    testWidgets('ORDERING_PAUSED → checkout shows the pause', (t) async {
      await _pump(t, screen: const CheckoutScreen(), code: FulfilmentError.orderingPaused);
      await toReview(t);
      _checkout.paused = true;
      await confirm(t);
      expect(find.text('الطلبات متوقفة مؤقتًا، سنعود قريبًا'), findsOneWidget);
    });

    for (final code in ['DAY_NOT_AVAILABLE', 'FULFILMENT_REQUIRED']) {
      testWidgets('$code → the day step', (t) async {
        await _pump(t, screen: const CheckoutScreen(), code: code);
        await toReview(t);
        await confirm(t);
        expect(find.text('الخطوة 1 من 3: الاستلام واليوم'), findsOneWidget);
        expect(find.text('الدفع والمراجعة'), findsNothing);
      });
    }

    for (final code in ['CART_EMPTY', 'ITEM_UNAVAILABLE', 'MIN_ORDER_NOT_MET']) {
      testWidgets('$code → the cart', (t) async {
        await _pump(t, screen: const CheckoutScreen(), code: code);
        await toReview(t);
        await confirm(t);
        expect(find.text('route:/cart'), findsOneWidget);
      });
    }

    testWidgets('system back is refused while placing; the order then shows and the cart is re-read', (t) async {
      final c = await _pump(t, screen: const CheckoutScreen());
      await toReview(t);
      await t.tap(find.text('الدفع عند الاستلام'));
      await t.pump();
      await t.tap(find.text('تأكيد الطلب'));
      await t.pump(const Duration(milliseconds: 50));
      await t.binding.handlePopRoute(); // Android back
      await t.pump();
      expect(find.text('الدفع والمراجعة'), findsOneWidget);
      await _settle(t);
      expect(find.text('تم استلام طلبك'), findsOneWidget);
      expect(_orders.orders, hasLength(1));
      expect((await c.read(cartProvider.future)).lines, isEmpty);
    });

    for (final code in ['PRICE_CHANGED', 'COUPON_EXPIRED']) {
      testWidgets('$code → the cart', (t) async {
        await _pump(t, screen: const CheckoutScreen(), code: code);
        await toReview(t);
        await confirm(t);
        expect(find.text('route:/cart'), findsOneWidget);
      });
    }
  });
}
