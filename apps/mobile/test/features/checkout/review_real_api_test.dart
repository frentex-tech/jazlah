import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// ORD-MOB-1 #84 on the real wiring: ApiOrderRepository and ApiPaymentRepository over a fake HTTP layer
/// (POST /v1/customer/orders with Idempotency-Key, GET /v1/customer/checkout/payment-methods).

const Map<String, Object?> _fulfilment = {
  'method': 'delivery',
  'addressId': 'a1',
  'date': '2026-11-11',
  'window': null,
  'pickupPoint': null,
};

FakeHttp _server({bool failFirstPost = false}) {
  var posts = 0;
  return FakeHttp((r) {
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
        posts++;
        if (failFirstPost && posts == 1) throw DioException.connectionError(requestOptions: r, reason: 'offline');
        return HttpAnswer(201, {
          'order': orderJson('o1', paymentStatus: 'initiated', paymentId: 'pay1'),
          'payment': paymentJson('pay1'),
        });
    }
    return null;
  });
}

Future<FakeHttp> _pump(WidgetTester t, {bool failFirstPost = false}) async {
  final http = _server(failFirstPost: failFirstPost);
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  await t.pumpScreen(
    const ReviewScreen(),
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      apiOn(http),
    ],
  );
  await _settle(t);
  await t.tap(find.text('بطاقة مدى'));
  await t.pump();
  return http;
}

Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 4; i++) {
    await t.pump(const Duration(milliseconds: 500));
  }
}

List<String?> _keys(FakeHttp http) => [
  for (final r in http.to('/v1/customer/orders')) r.headers['Idempotency-Key'] as String?,
];

void main() {
  testWidgets('a double tap on «تأكيد الطلب» sends one POST, with an Idempotency-Key; the payment step follows', (
    t,
  ) async {
    final http = await _pump(t);
    await t.tap(find.text('تأكيد الطلب'));
    await t.tap(find.text('تأكيد الطلب'), warnIfMissed: false);
    await _settle(t);
    expect(http.to('/v1/customer/orders'), hasLength(1));
    expect(_keys(http).single, matches(RegExp(r'^[0-9a-f-]{36}$')));
    expect(jsonBody(http.to('/v1/customer/orders').single), {'paymentMethod': 'mada'});
    expect(find.text('route:/checkout/pay/o1'), findsOneWidget);
  });

  testWidgets('a retry after a network error sends the same Idempotency-Key', (t) async {
    final http = await _pump(t, failFirstPost: true);
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    await t.pump(const Duration(seconds: 4)); // the toast goes
    await t.pumpAndSettle();
    await t.tap(find.text('تأكيد الطلب'));
    await _settle(t);
    final keys = _keys(http);
    expect(keys, hasLength(2));
    expect(keys[1], keys[0]);
    expect(find.text('route:/checkout/pay/o1'), findsOneWidget);
  });
}
