import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/order_placed_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/payment/presentation/payment_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// PAY-MOB-1 #78 on the real wiring, against a fake provider behind the contract: the order is placed with a payment
/// whose next action is a redirect; the hosted page (a stand-in for the webview) reaches the return url; the outcome
/// is read from GET /v1/customer/orders/{id}. A retry is POST /v1/customer/orders/{id}/payments with its own key.

const Map<String, Object?> _fulfilment = {
  'method': 'delivery',
  'addressId': 'a1',
  'date': '2026-11-11',
  'window': null,
  'pickupPoint': null,
};

/// The fake provider on the server: approve or decline a payment (its webhook), the order's status follows.
class _Provider {
  String status = 'pending_payment';
  String? paymentStatus = 'initiated';
  String paymentId = 'pay1';
  int payments = 1;
  String method = 'mada';

  void decide(String id, {required bool approve}) {
    if (id != paymentId) return;
    paymentStatus = approve ? 'captured' : 'failed';
    if (approve) status = 'confirmed';
  }

  Object order() =>
      orderJson('o1', status: status, paymentMethod: method, paymentStatus: paymentStatus, paymentId: paymentId);
}

FakeHttp _server(_Provider p) => FakeHttp((r) {
  switch (r.path) {
    case '/v1/customer/cart':
      return cartJson(lines: [cartLineJson('l1', quantity: 2)], deliveryFee: 1500, fulfilment: _fulfilment);
    case '/v1/customer/addresses':
      return {
        'items': [addressJson('a1')],
      };
    case '/v1/customer/checkout/days':
      return {
        'items': [dayJson('2026-11-11')],
      };
    case '/v1/customer/checkout/payment-methods':
      return paymentMethodsJson();
    case '/v1/customer/orders':
      return HttpAnswer(201, {'order': p.order(), 'payment': paymentJson(p.paymentId)});
    case '/v1/customer/orders/o1':
      return p.order();
    case '/v1/customer/orders/o1/payments':
      p.payments += 1;
      p
        ..method = jsonBody(r)['paymentMethod'] as String
        ..paymentId = 'pay${p.payments}'
        ..paymentStatus = 'initiated';
      return HttpAnswer(201, {
        'order': p.order(),
        'payment': paymentJson(p.paymentId, method: p.method),
      });
  }
  return null;
});

/// The hosted page: checks the redirect, lets the provider decide, then navigates to the return url.
class _HostedPage implements PaymentGateway {
  _HostedPage(this.provider);

  final _Provider provider;
  final List<PaymentAction> opened = [];
  bool approve = true;

  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async {
    opened.add(action);
    provider.decide(action.paymentId, approve: approve);
    var back = false;
    hostedNavigation('${action.returnUrl}?payment=${action.paymentId}', action, () => back = true);
    return back ? GatewayResult.finished : GatewayResult.cancelled;
  }
}

List<GoRoute> get _routes => [
  GoRoute(
    path: '/checkout/pay/:orderId',
    builder: (_, s) => PaymentScreen(orderId: s.pathParameters['orderId']!, placed: s.extra as PlacedOrder?),
  ),
  GoRoute(
    path: Routes.orderPlaced,
    builder: (_, s) => OrderPlacedScreen(args: s.extra! as OrderPlacedArgs),
  ),
];

Future<void> _settle(WidgetTester t, [int times = 6]) async {
  for (var i = 0; i < times; i++) {
    await t.pump(const Duration(milliseconds: 500));
  }
}

List<dynamic> _overrides(FakeHttp http, PaymentGateway gateway) {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    apiOn(http),
    paymentGatewayProvider.overrideWithValue(gateway),
  ];
}

void main() {
  testWidgets('end to end on the fake provider: place, redirect, return, read the order, the outcome', (t) async {
    final provider = _Provider();
    final http = _server(provider);
    final page = _HostedPage(provider)..approve = false; // the first card is declined
    await t.pumpScreen(const ReviewScreen(), overrides: _overrides(http, page), routes: _routes);
    await _settle(t);
    await t.tap(find.text('بطاقة مدى'));
    await t.pump();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);

    // The redirect of the payment made with the order; declined: read from the order, retry offered.
    expect(page.opened.single.redirectUrl, 'https://pay.fake.test/hosted/pay1');
    expect(page.opened.single.returnUrl, 'jazlah://checkout/pay/return');
    expect(http.to('/v1/customer/orders/o1'), isNotEmpty);
    expect(find.text('تم رفض الدفع من البنك، جرّب بطاقة أخرى أو وسيلة دفع مختلفة'), findsOneWidget);

    // A retry with another method: a new payment on the same order, with its own Idempotency-Key.
    page.approve = true;
    await t.pump(const Duration(seconds: 5));
    await t.tap(find.text('Apple Pay'));
    await t.pump();
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    final retry = http.to('/v1/customer/orders/o1/payments').single;
    final placeKey = http.to('/v1/customer/orders').single.headers['Idempotency-Key'];
    expect(retry.headers['Idempotency-Key'], isNot(placeKey));
    expect(jsonBody(retry), {'paymentMethod': 'applepay'});
    expect(page.opened.last.paymentId, 'pay2');

    // Paid: the status read from the server, then the placed screen.
    expect(find.text('تم استلام طلبك'), findsOneWidget);
    expect(find.text('Apple Pay'), findsOneWidget);
    expect(http.to('/v1/customer/orders'), hasLength(1)); // one order throughout
  });

  testWidgets('3DS left open and the app killed: a cold start reads the order and shows the final state', (t) async {
    final provider = _Provider()..decide('pay1', approve: true); // captured while the app was dead
    final http = _server(provider);
    await t.pumpScreen(
      const _ColdStart(),
      prefs: const {'locale': 'ar', 'onboardingSeen': true, 'payment.pending': 'o1'},
      overrides: _overrides(http, _HostedPage(provider)),
      routes: _routes,
    );
    await _settle(t);
    expect(http.to('/v1/customer/orders/o1'), isNotEmpty);
    expect(find.text('تم استلام طلبك'), findsOneWidget);
  });
}

/// The app's start: the gate sends a signed-in user to a saved payment, like the router.
class _ColdStart extends ConsumerStatefulWidget {
  const _ColdStart();

  @override
  ConsumerState<_ColdStart> createState() => _ColdStartState();
}

class _ColdStartState extends ConsumerState<_ColdStart> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final to = authRedirect(
        uri: Uri.parse(Routes.splash),
        session: SessionStatus.signedIn,
        onboardingSeen: true,
        pendingPayment: ref.read(prefsProvider).pendingPayment,
      );
      if (mounted) context.go(to!);
    });
  }

  @override
  Widget build(BuildContext context) => const SizedBox();
}
