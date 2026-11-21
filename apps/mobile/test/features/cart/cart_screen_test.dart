import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:jazlah/features/product/presentation/product_screen.dart';

import '../../helpers/cart_fakes.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// mode: hang (first load never ends) or error.
class _Server extends MockCartRepository {
  _Server([this.mode]) : super(delay: Duration.zero);

  final String? mode;

  @override
  Future<Cart> get() => switch (mode) {
    'hang' => Completer<Cart>().future,
    'error' => Future.error(const ApiError(code: 'UNKNOWN')),
    _ => super.get(),
  };
}

/// Signed in with the mock account cart and ops settings, unless [server] is null (a real build: the cart
/// stays on the device and nothing about fees or minimums is known).
List<dynamic> _overrides(MockCartRepository? server, {bool guest = false}) {
  final tokens = MemoryTokens(guest ? null : const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
    cartRepositoryProvider.overrideWithValue(server),
    cartSettingsProvider.overrideWithValue(server == null ? null : MockCartRepository.opsSettings),
  ];
}

Future<ProviderContainer> _pump(WidgetTester t, MockCartRepository? server) async {
  final c = await t.pumpScreen(const CartScreen(), overrides: _overrides(server));
  for (var i = 0; i < 3; i++) {
    await t.pump();
  }
  return c;
}

/// Settles without waiting for the add button's spinner to stop.
Future<void> _settle(WidgetTester t) async {
  await t.pump();
  await t.pump(const Duration(milliseconds: 500));
}

JButton _checkout(WidgetTester t) => t.widget<JButton>(find.widgetWithText(JButton, 'متابعة إلى الدفع'));

void main() {
  testWidgets('loading (170-28708): line placeholders and a disabled checkout', (t) async {
    await _pump(t, _Server('hang'));
    expect(find.byType(JSkeletonRow), findsNWidgets(3));
    expect(_checkout(t).onPressed, isNull);
  });

  testWidgets('error (170-28782): message and retry', (t) async {
    await _pump(t, _Server('error'));
    expect(find.text('تعذّر تحميل السلة'), findsOneWidget);
    expect(find.text('إعادة المحاولة'), findsOneWidget);
    expect(find.text('متابعة إلى الدفع'), findsNothing);
  });

  testWidgets('empty (170-28643): browse goes home', (t) async {
    await _pump(t, _Server());
    expect(find.text('سلتك فارغة'), findsOneWidget);
    await t.tap(find.text('تصفّح المنتجات'));
    await t.pumpAndSettle();
    expect(find.text('route:/home'), findsOneWidget);
  });

  testWidgets('cart (170-28564): lines, totals, coupon, checkout', (t) async {
    final server = _Server();
    await server.add(kebab.withQuantity(3));
    await _pump(t, server);
    expect(find.text('كباب لحم غنم'), findsOneWidget);
    expect(find.text('500 جم'), findsOneWidget);
    expect(find.text('108.00 ر.س'), findsNWidgets(3)); // line, subtotal, total
    expect(find.text('منها ضريبة القيمة المضافة 15%'), findsOneWidget);
    expect(find.text('رسوم التوصيل'), findsNothing); // fulfilment not chosen yet
    expect(find.text('الحد الأدنى للطلب 100.00 ر.س'), findsNothing);

    await t.enterText(find.byType(TextField), 'EID25');
    await t.tap(find.text('تطبيق'));
    await t.pump();
    expect(find.text('انتهت صلاحية رمز الخصم.'), findsOneWidget);

    await t.enterText(find.byType(TextField), 'jazla10');
    await t.tap(find.text('تطبيق'));
    await t.pump();
    expect(find.text('الخصم (JAZLA10)'), findsOneWidget);
    expect(find.text('-10.80 ر.س'), findsOneWidget);
    expect(find.text('97.20 ر.س'), findsOneWidget);

    await t.tap(find.text('متابعة إلى الدفع'));
    await t.pumpAndSettle();
    expect(find.text('route:/checkout'), findsOneWidget);
  });

  testWidgets('acceptance (170-28847): below the minimum, checkout is disabled and the rest is shown', (t) async {
    final server = _Server();
    await server.add(kebab);
    await _pump(t, server);
    expect(find.text('الحد الأدنى للطلب 100.00 ر.س'), findsOneWidget);
    expect(find.text('أضف 64.00 ر.س من المنتجات لإكمال طلبك.'), findsOneWidget);
    expect(find.byType(LinearProgressIndicator), findsOneWidget);
    expect(_checkout(t).onPressed, isNull);

    // The stepper brings it over the minimum.
    for (var i = 0; i < 2; i++) {
      await t.tap(find.bySemanticsLabel('زيادة الكمية'));
      await t.pump();
      await t.pump();
    }
    expect(find.text('الحد الأدنى للطلب 100.00 ر.س'), findsNothing);
    expect(_checkout(t).onPressed, isNotNull);
  });

  testWidgets('an unavailable line blocks checkout until removed', (t) async {
    var gone = false;
    final server = MockCartRepository(
      delay: Duration.zero,
      products: (id) async => gone ? null : MockCartRepository.catalogProduct(id),
    );
    await server.add(kebab.withQuantity(3));
    gone = true;
    await _pump(t, server);
    expect(find.text('«منتج لم يعد متوفرًا» لم يعد متوفرًا. احذفه لإكمال طلبك.'), findsOneWidget);
    expect(find.text('غير متوفر'), findsOneWidget);
    expect(_checkout(t).onPressed, isNull);
    await t.tap(find.widgetWithText(JButton, 'حذف'));
    await t.pump();
    await t.pump();
    expect(find.text('سلتك فارغة'), findsOneWidget);
  });

  testWidgets('a real build without the cart API: the device cart, no coupon, no invented fees', (t) async {
    final c = await _pump(t, null);
    await c.read(cartProvider.notifier).add(kebab.withQuantity(5));
    await t.pump();
    expect(find.text('كباب لحم غنم'), findsOneWidget);
    expect(find.text('رمز الخصم · اختياري'), findsNothing);
    expect(find.textContaining('الحد الأدنى'), findsNothing);
    expect(find.text('الدفع من التطبيق قادم قريبًا، وسلتك محفوظة على هذا الجهاز.'), findsOneWidget);
    expect(_checkout(t).onPressed, isNull);
  });

  testWidgets('a guest checking out signs in first', (t) async {
    final c = await t.pumpScreen(
      const CartScreen(),
      prefs: const {'locale': 'ar', 'onboardingSeen': true, 'guest': true},
      overrides: _overrides(_Server(), guest: true),
    );
    await t.pump();
    expect(c.read(sessionProvider), SessionStatus.guest);
    await c.read(cartProvider.notifier).add(kebab.withQuantity(3));
    await t.pump();
    await t.tap(find.text('متابعة إلى الدفع'));
    await t.pumpAndSettle();
    expect(find.text('route:/login?from=%2Fcart'), findsNothing); // matchedLocation has no query
    expect(find.text('route:/login'), findsOneWidget);
  });

  testWidgets('product page: another store asks «استبدال السلة؟», confirm replaces; the badge counts', (t) async {
    final server = _Server();
    await server.add(kebab.withQuantity(2));
    final c = await t.pumpScreen(const ProductScreen(id: 'p-nukhba-lamb-kebab'), overrides: _overrides(server));
    await t.pump();
    await t.pump();
    expect(find.bySemanticsLabel('السلة 2'), findsOneWidget);

    await t.tap(find.text('أضف إلى السلة'));
    await _settle(t);
    expect(find.text('استبدال السلة؟'), findsOneWidget);
    expect(find.textContaining('مجازر الفلاح'), findsOneWidget);
    await t.tap(find.text('إلغاء'));
    await _settle(t);
    expect((await server.get()).vendorId, 'v-falah');

    await t.tap(find.text('أضف إلى السلة'));
    await _settle(t);
    await t.tap(find.text('استبدال'));
    await t.pump();
    await t.pump();
    expect(find.text('أُضيفت القطعة إلى السلة'), findsOneWidget);
    expect((await server.get()).vendorId, 'v-nukhba');
    expect(c.read(cartCountProvider), 1);
    await _settle(t); // the dialog has closed
    expect(find.bySemanticsLabel('السلة 1'), findsOneWidget);
  });
}
