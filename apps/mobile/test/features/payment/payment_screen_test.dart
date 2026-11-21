import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
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
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/order_placed_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/payment/presentation/payment_screen.dart';
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

late DateTime _clock;
late MockOrderRepository _orders;
late MockPaymentRepository _payments;

/// Counts the payment starts (each is one retry call to the server).
class _Payments extends MockPaymentRepository {
  _Payments(super.cart, super.orders, {this.none = false}) : super(delay: Duration.zero);

  /// No method can be used (Figma 170-29357).
  final bool none;
  int retries = 0;

  @override
  Future<PaymentMethods> methods({String? orderId}) async => none
      ? const PaymentMethods(
          options: [
            PaymentMethodOption(
              method: PaymentMethodCode.wallet,
              available: false,
              reason: PaymentMethodReason.walletInsufficient,
            ),
          ],
        )
      : super.methods(orderId: orderId);

  @override
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey}) {
    retries++;
    return super.retry(orderId: orderId, method: method, idempotencyKey: idempotencyKey);
  }
}

/// An order placed with mada (and [walletAmount] from the wallet), its payment screen opened with the placement's
/// answer (or, with [reopen], without it).
Future<ProviderContainer> _pump(
  WidgetTester t, {
  int walletAmount = 0,
  bool reopen = false,
  bool none = false,
  String lang = 'ar',
}) async {
  _clock = DateTime.utc(2026, 11, 10, 10);
  final cart = MockCartRepository(delay: Duration.zero);
  await cart.add(kebab.withQuantity(3));
  cart.fulfilment = const FulfilmentChoice(method: Fulfilment.delivery, date: '2026-11-11', addressId: 'a1');
  final book = MockAddressRepository(seed: [_home]);
  final checkout = MockCheckoutRepository(cart, addresses: book, now: () => _clock, delay: Duration.zero);
  _orders = MockOrderRepository(cart, checkout, addresses: book, now: () => _clock, delay: Duration.zero);
  _payments = _Payments(cart, _orders, none: none);
  // The mock address book waits on a real timer.
  final placed = (await t.runAsync(
    () => _orders.place(idempotencyKey: 'k', paymentMethod: PaymentMethodCode.mada, walletAmount: walletAmount),
  ))!;
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  final c = await t.pumpScreen(
    PaymentScreen(orderId: placed.order.id, placed: reopen ? null : placed),
    prefs: {'locale': lang, 'onboardingSeen': true},
    routes: [
      // With a Scaffold, so the cancelled order's toast can show.
      GoRoute(
        path: Routes.cart,
        builder: (_, _) => const Scaffold(body: Text('route:/cart')),
      ),
      GoRoute(
        path: Routes.orderPlaced,
        builder: (_, s) => OrderPlacedScreen(args: s.extra! as OrderPlacedArgs),
      ),
    ],
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      cartRepositoryProvider.overrideWithValue(cart),
      cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
      addressRepositoryProvider.overrideWithValue(book),
      checkoutRepositoryProvider.overrideWithValue(checkout),
      orderRepositoryProvider.overrideWithValue(_orders),
      paymentRepositoryProvider.overrideWithValue(_payments),
      paymentGatewayProvider.overrideWithValue(FakePaymentGateway(_orders.decide)),
    ],
  );
  await t.pump(const Duration(milliseconds: 100));
  await _settle(t);
  return c;
}

const _sheet = 'بوابة الدفع التجريبية';
const _declined = 'تم رفض الدفع من البنك، جرّب بطاقة أخرى أو وسيلة دفع مختلفة';

JButton _button(WidgetTester t) => t.widget<JButton>(find.byType(JButton).last);

Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 6; i++) {
    await t.pump(const Duration(milliseconds: 300));
  }
}

Future<void> _resume(WidgetTester t) async {
  [
    AppLifecycleState.inactive,
    AppLifecycleState.hidden,
    AppLifecycleState.paused,
    AppLifecycleState.hidden,
    AppLifecycleState.inactive,
    AppLifecycleState.resumed,
  ].forEach(t.binding.handleAppLifecycleStateChanged);
  await _settle(t);
}

void main() {
  testWidgets('processing (170-29134): the gateway step opens, the button is busy and back is refused', (t) async {
    await _pump(t);
    expect(find.text(_sheet), findsOneWidget);
    expect(find.text('تحقق 3DS لمبلغ 123.00 ر.س. هذه صفحة المزوّد التجريبي.'), findsOneWidget);
    final confirm = t.widget<JButton>(find.widgetWithText(JButton, 'تأكيد الطلب'));
    expect(confirm.loading, isTrue);
  });

  testWidgets('approved on the fake provider → the order placed screen (status read from the server)', (t) async {
    await _pump(t);
    await t.tap(find.text('موافقة'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('تم تأكيد طلبك.'), findsOneWidget);
    expect(find.text('مدى · تنتهي بـ 4821'), findsOneWidget);
    expect(_orders.orders.single.status, OrderStatus.confirmed);
  });

  testWidgets('declined (170-29244): toast, retry; another method on the same order, then paid', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    expect(find.text(_declined), findsOneWidget);
    expect(find.text('إعادة المحاولة'), findsOneWidget);
    await t.pump(const Duration(seconds: 5)); // the toast goes
    await t.tap(find.text('Apple Pay'));
    await t.pump();
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    expect(find.text(_sheet), findsOneWidget);
    await t.tap(find.text('موافقة'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('Apple Pay'), findsOneWidget);
    expect(_orders.orders, hasLength(1));
  });

  testWidgets('double tap on retry starts one payment', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('إعادة المحاولة'));
    await t.tap(find.text('إعادة المحاولة'), warnIfMissed: false);
    await _settle(t);
    expect((_payments as _Payments).retries, 1);
    expect(find.text(_sheet), findsOneWidget);
  });

  testWidgets('wallet part + a declined card: the wallet amount comes back and is shown', (t) async {
    await _pump(t, walletAmount: 5000);
    expect(find.text('تحقق 3DS لمبلغ 73.00 ر.س. هذه صفحة المزوّد التجريبي.'), findsOneWidget);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.scrollUntilVisible(
      find.text('أُعيد 50.00 ر.س إلى محفظتك.'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('أُعيد 50.00 ر.س إلى محفظتك.'), findsOneWidget);
    expect(_orders.wallet.balance, 5000);
  });

  testWidgets('closing the gateway step: the status is read once; not paid → retry', (t) async {
    await _pump(t);
    await t.tapAt(const Offset(195, 60)); // the scrim
    await _settle(t);
    expect(find.text(_sheet), findsNothing);
    expect(find.text('لم يكتمل الدفع، أعد المحاولة أو اختر وسيلة أخرى'), findsOneWidget);
    expect(_button(t).onPressed, isNotNull);
  });

  testWidgets('3DS interrupted, captured meanwhile, app resumed → the final state, gateway page closed', (t) async {
    await _pump(t);
    expect(find.text(_sheet), findsOneWidget);
    _orders.decide(_orders.orders.single.id == 'o-1' ? 'pay-o-1-1' : '', approve: true); // the webhook
    await _resume(t);
    expect(find.text(_sheet), findsNothing);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
  });

  testWidgets('3DS interrupted, declined meanwhile, app resumed → payment failed', (t) async {
    await _pump(t);
    _orders.decide('pay-o-1-1', approve: false);
    await _resume(t);
    expect(find.text(_sheet), findsNothing);
    expect(find.text(_declined), findsOneWidget);
  });

  testWidgets('unpaid after 15 minutes: resumed → the order was cancelled, back to the cart', (t) async {
    await _pump(t);
    _clock = _clock.add(const Duration(minutes: 15));
    await _resume(t);
    expect(find.text('route:/cart'), findsOneWidget);
    expect(find.text('أُلغي الطلب لانتهاء مهلة الدفع (15 دقيقة).'), findsOneWidget);
  });

  testWidgets('opened again without the placement: reads the status (paid → placed)', (t) async {
    _clock = DateTime.utc(2026, 11, 10, 10);
    await _pump(t, reopen: true);
    expect(find.text(_sheet), findsNothing); // nothing started on its own
    expect(_button(t).onPressed, isNotNull);
    _orders.decide('pay-o-1-1', approve: true);
    await _resume(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
  });

  testWidgets('no method can be used (170-29357): «اختر طريقة دفع للمتابعة», button disabled', (t) async {
    await _pump(t, reopen: true, none: true);
    await t.scrollUntilVisible(find.text('اختر طريقة دفع للمتابعة'), 200, scrollable: find.byType(Scrollable).first);
    expect(find.text('اختر طريقة دفع للمتابعة'), findsOneWidget);
    expect(_button(t).onPressed, isNull);
  });

  testWidgets('switching to COD on the unpaid order → placed, under review', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    await t.scrollUntilVisible(find.text('الدفع عند الاستلام'), 200, scrollable: find.byType(Scrollable).first);
    await t.tap(find.text('الدفع عند الاستلام'));
    await t.pump();
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('سنراجع طلبك ونؤكده قريبًا.'), findsOneWidget);
    expect(_orders.orders.single.status, OrderStatus.created);
  });
}
