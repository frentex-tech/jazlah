import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
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
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

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
const _work = Address(id: 'a2', label: 'العمل', point: GeoPoint(24.69, 46.685), isDefault: false, city: 'الرياض');
const _farm = Address(
  id: 'a4',
  label: 'المزرعة',
  point: GeoPoint(26.33, 43.97),
  isDefault: false,
  city: 'بريدة',
  covered: false,
);

class _Addresses extends MockAddressRepository {
  _Addresses(List<Address> seed, {this.hangs = false}) : super(seed: [...seed]);

  final bool hangs;

  @override
  Future<List<Address>> list() => hangs ? Completer<List<Address>>().future : super.list();
}

/// Counts the days asked per method; [fail] makes every call fail.
class _Checkout extends MockCheckoutRepository {
  _Checkout(super.cart, {required super.addresses, super.paused = false, this.fail})
    : super(now: () => DateTime.utc(2026, 11, 10, 10), delay: Duration.zero); // 13:00 Riyadh

  ApiError? fail;
  final asked = <Fulfilment>[];

  /// Holds the delivery answers back until completed (a slow response).
  Completer<void>? deliveryGate;

  @override
  Future<List<CheckoutDay>> days(Fulfilment method) async {
    asked.add(method);
    if (method == Fulfilment.delivery) await deliveryGate?.future;
    return fail != null ? Future.error(fail!) : super.days(method);
  }
}

late MockCartRepository _cart;
final _launched = <Uri>[];
late _Checkout _checkout;

Future<ProviderContainer> _pump(
  WidgetTester t, {
  List<Address> addresses = const [_home, _work, _farm],
  bool hangs = false,
  bool paused = false,
  ApiError? fail,
  bool mocks = true,
  String lang = 'ar',
  Completer<void>? deliveryGate,
}) async {
  _cart = MockCartRepository(delay: Duration.zero);
  await _cart.add(kebab.withQuantity(3));
  final book = _Addresses(addresses, hangs: hangs);
  _checkout = _Checkout(_cart, addresses: book, paused: paused, fail: fail)..deliveryGate = deliveryGate;
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final c = await t.pumpScreen(
    const CheckoutScreen(),
    prefs: {'locale': lang, 'onboardingSeen': true},
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      cartRepositoryProvider.overrideWithValue(_cart),
      cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
      addressRepositoryProvider.overrideWithValue(book),
      checkoutRepositoryProvider.overrideWithValue(mocks ? _checkout : null),
      urlLauncherProvider.overrideWithValue((uri) async {
        _launched.add(uri);
        return true;
      }),
    ],
  );
  await _settle(t);
  return c;
}

/// The mock address book waits 400 ms; the days follow.
Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 4; i++) {
    await t.pump(const Duration(milliseconds: 250));
  }
}

VoidCallback? _continue(WidgetTester t) =>
    t.widget<JButton>(find.widgetWithText(JButton, 'متابعة إلى الدفع')).onPressed;

void main() {
  testWidgets('delivery (118-9638): covered address chosen, first open day, window, key', (t) async {
    await _pump(t);
    expect(find.text('الخطوة 1 من 3: الاستلام واليوم'), findsOneWidget);
    expect(find.text('المنزل · حي الملقا'), findsOneWidget);
    expect(find.text('خارج نطاق التغطية'), findsOneWidget);
    expect(find.text('يصل بين 4 و 10 مساءً'), findsOneWidget);
    expect(find.text('الأربعاء 11 نوفمبر · بتوقيت الرياض'), findsOneWidget);
    await t.scrollUntilVisible(find.text('دليل الأيام'), 200, scrollable: find.byType(Scrollable).first);
    expect(find.text('دليل الأيام'), findsOneWidget);
    expect(find.text('مكتمل: لا توجد سعة'), findsOneWidget);
    expect(_continue(t), isNotNull);
  });

  testWidgets('pickup (118-9741): pickup point, hours and the pickup window', (t) async {
    await _pump(t);
    await t.tap(find.text('استلام من المتجر'));
    await _settle(t);
    expect(find.text('موقع الاستلام'), findsOneWidget);
    expect(find.text('مجازر الفلاح · فرع العليا'), findsOneWidget);
    expect(find.text('الاستلام من 9 ص إلى 10 م'), findsOneWidget);
    expect(find.text('جاهز للاستلام بين 4 و 10 مساءً'), findsOneWidget);
    expect(find.byType(MapPicker), findsOneWidget);
    expect(_continue(t), isNotNull);
  });

  testWidgets('pickup: directions open maps at the pickup point; no call button without a store phone', (t) async {
    _launched.clear();
    await _pump(t);
    await t.tap(find.text('استلام من المتجر'));
    await _settle(t);
    expect(find.text('اتصال بالمتجر'), findsNothing);
    await t.ensureVisible(find.text('الاتجاهات'));
    await t.pump();
    await t.tap(find.text('الاتجاهات'));
    await t.pump();
    expect(_launched.single.host, 'www.google.com');
    expect(_launched.single.queryParameters['destination'], '24.695,46.683');
  });

  testWidgets('calendar (118-9829): picking a day in the month updates the window', (t) async {
    await _pump(t);
    await t.tap(find.text('التقويم'));
    await t.pumpAndSettle();
    expect(find.text('اختر يوم التوصيل'), findsOneWidget);
    expect(find.text('نوفمبر 2026'), findsOneWidget);
    await t.tap(find.text('17').last);
    await t.pump();
    await t.tap(find.text('تأكيد اليوم'));
    await t.pumpAndSettle();
    expect(find.text('الثلاثاء 17 نوفمبر · بتوقيت الرياض'), findsOneWidget);
  });

  testWidgets("paused (118-10052): the admin's message and no continue", (t) async {
    await _pump(t, paused: true);
    expect(find.text('الطلبات متوقفة مؤقتًا، سنعود قريبًا'), findsOneWidget);
    expect(find.text(MockCheckoutRepository.pauseMessage.messageAr), findsOneWidget);
    expect(find.text('دليل الأيام', skipOffstage: false), findsNothing);
    expect(_continue(t), isNull);
  });

  testWidgets('paused, in English: the English message', (t) async {
    await _pump(t, paused: true, lang: 'en');
    expect(find.text(MockCheckoutRepository.pauseMessage.messageEn), findsOneWidget);
  });

  testWidgets('loading (118-10144): skeleton rows, continue disabled', (t) async {
    await _pump(t, hangs: true);
    expect(find.byType(JSkeletonRow), findsNWidgets(4));
    expect(_continue(t), isNull);
  });

  testWidgets('no covered address (118-10199): empty state with add address', (t) async {
    await _pump(t, addresses: const [_farm]);
    expect(find.text('لا يوجد عنوان داخل التغطية'), findsOneWidget);
    expect(find.widgetWithText(JButton, 'إضافة عنوان'), findsOneWidget);
    expect(find.text('يوم التوصيل'), findsNothing);
    expect(_continue(t), isNull);
  });

  testWidgets('days error (118-10251): retry asks again', (t) async {
    await _pump(t, fail: const ApiError(code: ApiError.network));
    expect(find.text('تعذّر تحميل الأيام المتاحة'), findsOneWidget);
    expect(find.text('تحقق من الاتصال ثم أعد المحاولة.'), findsOneWidget);
    expect(_continue(t), isNull);
    _checkout.fail = null;
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    expect(find.text('يصل بين 4 و 10 مساءً'), findsOneWidget);
  });

  testWidgets('a refusal from the server says why (FULFILMENT_NOT_SUPPORTED)', (t) async {
    await _pump(t, fail: const ApiError(code: FulfilmentError.notSupported));
    expect(find.text('بعض منتجات سلتك لا تتوفر بطريقة الاستلام هذه.'), findsOneWidget);
  });

  for (final (node, day, text) in [
    ('118-10342', '13', 'مغلق: عطلة المتجر'),
    ('118-10426', '12', 'مكتمل: لا توجد سعة'),
    ('118-10510', '10', 'انتهى وقت الطلب لهذا اليوم'),
  ]) {
    testWidgets('disabled day ($node): tapping it explains why; no continue', (t) async {
      await _pump(t);
      await t.tap(find.text(day));
      await t.pump();
      expect(find.text(text), findsOneWidget);
      expect(find.textContaining('اختر يومًا آخر متاحًا'), findsOneWidget);
      expect(find.text('يصل بين 4 و 10 مساءً'), findsNothing);
      expect(_continue(t), isNull);
    });
  }

  testWidgets('days are asked again when the method or the address changes', (t) async {
    await _pump(t);
    expect(_checkout.asked, [Fulfilment.delivery]);
    await t.tap(find.text('استلام من المتجر'));
    await _settle(t);
    expect(_checkout.asked, [Fulfilment.delivery, Fulfilment.pickup]);
    await t.tap(find.text('توصيل للعنوان'));
    await t.pump();
    await t.tap(find.text('العمل'));
    await _settle(t);
    // Back to delivery (home), then the work address: each asks again.
    expect(_checkout.asked, [Fulfilment.delivery, Fulfilment.pickup, Fulfilment.delivery, Fulfilment.delivery]);
  });

  testWidgets('a late answer for the previous method does not replace the new days', (t) async {
    final slow = Completer<void>();
    await _pump(t, deliveryGate: slow);
    await t.tap(find.text('استلام من المتجر'));
    await _settle(t);
    expect(find.text('جاهز للاستلام بين 4 و 10 مساءً'), findsOneWidget);
    slow.complete(); // the delivery days arrive now
    await _settle(t);
    expect(find.text('جاهز للاستلام بين 4 و 10 مساءً'), findsOneWidget);
    expect(find.text('يصل بين 4 و 10 مساءً'), findsNothing);
  });

  testWidgets('a save refused because the address is gone reloads the book', (t) async {
    await _pump(t);
    final deleted = _checkout.addresses.delete('a1'); // on another device
    await t.pump(const Duration(milliseconds: 500));
    await deleted;
    await t.tap(find.text('متابعة إلى الدفع'));
    await _settle(t);
    expect(find.text('route:/checkout/review'), findsNothing);
    expect(find.text('المنزل · حي الملقا'), findsNothing);
  });

  testWidgets('continue saves the fulfilment: the cart counts the delivery fee, then the review step', (t) async {
    final c = await _pump(t);
    await t.tap(find.text('متابعة إلى الدفع'));
    await _settle(t);
    expect(find.text('route:/checkout/review'), findsOneWidget);
    expect(_cart.fulfilment?.addressId, 'a1');
    expect(_cart.fulfilment?.date, '2026-11-11');
    final cart = await c.read(cartProvider.future);
    expect(cart.delivery, isTrue);
    expect(cart.deliveryFee, 1500);
  });

  testWidgets('a refused save shows why and stays', (t) async {
    await _pump(t);
    _checkout.paused = true;
    await t.tap(find.text('متابعة إلى الدفع'));
    await _settle(t);
    expect(find.text('الطلبات متوقفة مؤقتًا، حاول لاحقًا.'), findsOneWidget);
    expect(find.text('route:/checkout/review'), findsNothing);
  });

  testWidgets('real build without the days route: the error state, never made-up days', (t) async {
    await _pump(t, mocks: false);
    expect(find.text('تعذّر تحميل الأيام المتاحة'), findsOneWidget);
    expect(find.text('يصل بين 4 و 10 مساءً'), findsNothing);
    expect(_continue(t), isNull);
  });

  test('clock text: Riyadh HH:mm as is', () {
    final l10n = lookupAppLocalizations(const Locale('ar'));
    expect(clockText(l10n, '16:00'), '4 مساءً');
    expect(clockText(l10n, '09:30', short: true), '9:30 ص');
    expect(clockText(l10n, '00:00'), '12 صباحًا');
  });
}
