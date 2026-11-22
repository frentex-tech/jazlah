import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
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

late DateTime _clock;
late MockOrderRepository _orders;
late MockPaymentRepository _payments;

/// Counts the payment starts (each is one retry call to the server).
class _Payments extends MockPaymentRepository {
  _Payments(super.cart, super.orders, {this.none = false}) : super(delay: Duration.zero);

  /// No method can be used (Figma 170-29357).
  final bool none;
  int retries = 0;
  final keys = <String>[];

  /// The next retry fails with a network error (no answer).
  bool failNetworkOnce = false;

  /// Holds the retry's answer back until completed.
  Completer<void>? gate;

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
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey}) async {
    retries++;
    keys.add(idempotencyKey);
    await gate?.future;
    if (failNetworkOnce) {
      failNetworkOnce = false;
      throw const ApiError(code: ApiError.network);
    }
    return super.retry(orderId: orderId, method: method, idempotencyKey: idempotencyKey);
  }
}

/// The gateway step ends but the provider has not decided yet (a slow bank).
class _Silent implements PaymentGateway {
  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async => GatewayResult.finished;
}

/// The app's start: the gate redirects a signed-in user like the router does.
class _ColdStart extends StatefulWidget {
  const _ColdStart();

  @override
  State<_ColdStart> createState() => _ColdStartState();
}

class _ColdStartState extends State<_ColdStart> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final prefs = ProviderScope.containerOf(context, listen: false).read(prefsProvider);
      final to = authRedirect(
        uri: Uri.parse(Routes.splash),
        session: SessionStatus.signedIn,
        onboardingSeen: true,
        pendingPayment: prefs.pendingPayment,
      );
      if (mounted) context.go(to!);
    });
  }

  @override
  Widget build(BuildContext context) => const SizedBox();
}

/// An order placed with mada (and [walletAmount] from the wallet), its payment screen opened with the placement's
/// answer (or, with [reopen], without it).
Future<ProviderContainer> _pump(
  WidgetTester t, {
  int walletAmount = 0,
  bool reopen = false,
  bool none = false,
  String lang = 'ar',
  bool coldStart = false,
  bool declineFirst = false,
  String? pendingId,
  PaymentGateway? gateway,
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
  if (coldStart) _orders.decide('pay-o-1-1', approve: true); // captured while the app was dead
  if (declineFirst) _orders.decide('pay-o-1-1', approve: false);
  final c = await t.pumpScreen(
    coldStart ? const _ColdStart() : PaymentScreen(orderId: placed.order.id, placed: reopen ? null : placed),
    prefs: {'locale': lang, 'onboardingSeen': true, if (coldStart) 'payment.pending': pendingId ?? placed.order.id},
    routes: [
      GoRoute(
        path: Routes.home,
        builder: (_, _) => const Scaffold(body: Text('route:/home')),
      ),
      GoRoute(
        path: '/checkout/pay/:orderId',
        builder: (_, s) => PaymentScreen(orderId: s.pathParameters['orderId']!),
      ),
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
      paymentGatewayProvider.overrideWithValue(gateway ?? MockHostedPageGateway(_orders.hostedPage)),
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

  testWidgets('closing the hosted page: the payment may still capture, so the button only checks the status', (
    t,
  ) async {
    await _pump(t);
    await t.tapAt(const Offset(195, 60)); // the scrim
    await _settle(t);
    expect(find.text(_sheet), findsNothing);
    expect(find.text('لم يكتمل الدفع، أعد المحاولة أو اختر وسيلة أخرى'), findsOneWidget);
    await t.pump(const Duration(seconds: 5));
    expect(find.text('تحقق من حالة الدفع'), findsOneWidget);
    await t.tap(find.text('تحقق من حالة الدفع'));
    await _settle(t);
    expect((_payments as _Payments).retries, 0); // never a second payment
    expect(find.text('لا يزال الدفع قيد المعالجة، سنحدّث حالة طلبك فور وصول النتيجة.'), findsOneWidget);
    _orders.decide('pay-o-1-1', approve: true); // it captured after all
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('تحقق من حالة الدفع'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(_orders.orders.single.status, OrderStatus.confirmed);
  });

  testWidgets('cancelled on the hosted page: over, the customer may pay again (a new payment)', (t) async {
    await _pump(t);
    await t.tap(find.text('إلغاء الدفع'));
    await _settle(t);
    expect(find.text('لم يكتمل الدفع، أعد المحاولة أو اختر وسيلة أخرى'), findsOneWidget);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    expect((_payments as _Payments).retries, 1);
    await t.tap(find.text('موافقة'));
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
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
    expect(find.text('تحقق من حالة الدفع'), findsOneWidget); // its payment is still open
    _orders.decide('pay-o-1-1', approve: true);
    await _resume(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
  });

  testWidgets('no method can be used (170-29357): «اختر طريقة دفع للمتابعة», button disabled', (t) async {
    await _pump(t, reopen: true, none: true, declineFirst: true);
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

  testWidgets('the order is kept while paying, so a cold start comes back', (t) async {
    final c = await _pump(t);
    expect(c.read(prefsProvider).pendingPayment, 'o-1');
  });

  testWidgets('cold start with a saved payment: the payment step opens and shows the final state', (t) async {
    final c = await _pump(t, coldStart: true);
    await _settle(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(c.read(prefsProvider).pendingPayment, isNull);
  });

  test('signing out clears the saved payment (account data)', () async {
    SharedPreferences.setMockInitialValues({'payment.pending': 'o-1', 'locale': 'ar'});
    final prefs = await Prefs.load();
    await prefs.clearAccountData();
    expect(prefs.pendingPayment, isNull);
    expect(prefs.languageCode, 'ar');
  });

  testWidgets('a resume while a retry is being asked for does not show the old decline again', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5)); // the toast goes
    final payments = _payments as _Payments..gate = Completer<void>();
    await t.tap(find.text('إعادة المحاولة'));
    await t.pump();
    await _resume(t);
    expect(find.text(_declined), findsNothing);
    expect(t.widget<JButton>(find.byType(JButton).last).loading, isTrue);
    payments.gate!.complete();
    await _settle(t);
    expect(find.text(_sheet), findsOneWidget);
  });

  testWidgets('no answer for about 60 s: stop waiting, say so; resume later reads the outcome', (t) async {
    await _pump(t, gateway: _Silent());
    await t.pump(const Duration(seconds: 30));
    expect(_button(t).loading, isTrue);
    await t.pump(const Duration(seconds: 32));
    await t.pump();
    expect(find.text('لا يزال الدفع قيد المعالجة، سنحدّث حالة طلبك فور وصول النتيجة.'), findsOneWidget);
    expect(_button(t).loading, isFalse);
    // Still open: «تحقق من حالة الدفع» re-reads instead of starting another payment.
    expect(find.text('تحقق من حالة الدفع'), findsOneWidget);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('تحقق من حالة الدفع'));
    await _settle(t);
    expect((_payments as _Payments).retries, 0);
    _orders.decide('pay-o-1-1', approve: true);
    await _resume(t);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
  });

  testWidgets('a retry after a network error sends the same payment key; after an answer a new one', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    final payments = _payments as _Payments..failNetworkOnce = true;
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.byType(JButton).last);
    await _settle(t);
    expect(payments.keys, hasLength(2));
    expect(payments.keys[0], payments.keys[1]);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    expect(payments.keys, hasLength(3));
    expect(payments.keys[2], isNot(payments.keys[1]));
  });

  testWidgets('a resume after a decline does not show the toast again', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    expect(find.text(_declined), findsNothing);
    await _resume(t);
    expect(find.text(_declined), findsNothing);
    expect(find.text('إعادة المحاولة'), findsOneWidget);
  });

  testWidgets('cold start with an order that is gone (mock orders die with the app): home, id cleared', (t) async {
    final c = await _pump(t, coldStart: true, pendingId: 'o-9'); // settles about 2 s: the toast still shows
    expect(find.text('route:/home'), findsOneWidget);
    expect(find.text('هذا الطلب لم يعد متاحًا.'), findsOneWidget);
    expect(c.read(prefsProvider).pendingPayment, isNull);
  });

  testWidgets('leaving after the 60 s stop keeps the order (still in flight); after a decline it does not', (t) async {
    var c = await _pump(t, gateway: _Silent());
    await t.pump(const Duration(seconds: 62));
    await t.pump();
    GoRouter.of(t.element(find.byType(PaymentScreen))).go(Routes.home);
    await _settle(t);
    expect(c.read(prefsProvider).pendingPayment, 'o-1');

    c = await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    GoRouter.of(t.element(find.byType(PaymentScreen))).go(Routes.home);
    await _settle(t);
    expect(c.read(prefsProvider).pendingPayment, isNull);
  });

  testWidgets('after a network error the methods are frozen: the retry sends the same key and method', (t) async {
    await _pump(t);
    await t.tap(find.text('رفض'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    final payments = _payments as _Payments..failNetworkOnce = true;
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('Apple Pay'), warnIfMissed: false); // ignored: the payment may exist
    await t.pump();
    expect(t.widget<JRadio>(find.widgetWithText(JRadio, 'Apple Pay')).checked, isFalse);
    await t.tap(find.byType(JButton).last);
    await _settle(t);
    expect(payments.keys, hasLength(2));
    expect(payments.keys[1], payments.keys[0]);
    expect(find.text(_sheet), findsOneWidget);
    expect(find.text('تحقق 3DS لمبلغ 123.00 ر.س. هذه صفحة المزوّد التجريبي.'), findsOneWidget); // mada, as before
  });
}
