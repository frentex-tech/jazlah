import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// SCH-MOB-1 #71 on the real wiring: ApiCheckoutRepository, ApiCartRepository and the address book over a fake HTTP
/// layer answering the contract's bodies (GET /v1/customer/checkout/days, PATCH /v1/customer/cart/fulfilment,
/// GET /v1/public/settings/client).

FakeHttp _server({Map<String, Object?>? fulfilment}) => FakeHttp((r) {
  switch (r.path) {
    case '/v1/customer/cart':
      return cartJson(lines: [cartLineJson('l1', quantity: 2)], fulfilment: fulfilment);
    case '/v1/customer/addresses':
      return {
        'items': [addressJson('a1'), addressJson('a2', label: 'العمل', isDefault: false)],
      };
    case '/v1/public/settings/client':
      return clientSettingsJson();
    case '/v1/customer/checkout/days':
      return {
        'items': [
          dayJson('2026-11-11'),
          dayJson('2026-11-12', reason: 'FULL'),
          dayJson('2026-11-13', reason: 'CLOSED'),
        ],
      };
    case '/v1/customer/cart/fulfilment':
      final b = jsonBody(r);
      return cartJson(
        lines: [cartLineJson('l1', quantity: 2)],
        deliveryFee: 1500,
        fulfilment: {
          'method': b['method'],
          'addressId': b['addressId'],
          'date': b['date'],
          'window': null,
          'pickupPoint': null,
        },
      );
  }
  return null;
});

Future<FakeHttp> _pump(WidgetTester t, {Map<String, Object?>? fulfilment, List<dynamic> extra = const []}) async {
  final http = _server(fulfilment: fulfilment);
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  await t.pumpScreen(
    const CheckoutScreen(),
    overrides: [
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
      apiOn(http),
      ...extra,
    ],
  );
  await _settle(t);
  return http;
}

Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 4; i++) {
    await t.pump(const Duration(milliseconds: 500));
  }
}

List<String> _daysAsked(FakeHttp http) => [
  for (final r in http.to('/v1/customer/checkout/days')) '${r.queryParameters['method']}',
];

void main() {
  testWidgets('the days are asked again when the method or the address changes; continue saves the fulfilment', (
    t,
  ) async {
    final http = await _pump(t);
    expect(_daysAsked(http), ['delivery']);

    await t.tap(find.text('استلام من المتجر'));
    await _settle(t);
    expect(_daysAsked(http), ['delivery', 'pickup']);

    await t.tap(find.text('توصيل للعنوان'));
    await _settle(t);
    await t.tap(find.text('العمل · حي الملقا'));
    await _settle(t);
    expect(_daysAsked(http).where((m) => m == 'delivery'), hasLength(greaterThanOrEqualTo(2)));
    final before = http.to('/v1/customer/checkout/days').length;

    await t.tap(find.widgetWithText(JButton, 'متابعة إلى الدفع'));
    await _settle(t);
    final saved = http.to('/v1/customer/cart/fulfilment');
    expect(saved, hasLength(1));
    expect(saved.single.method, 'PATCH');
    expect(jsonBody(saved.single), {'method': 'delivery', 'addressId': 'a2', 'date': '2026-11-11'});
    expect(find.text('route:/checkout/review'), findsOneWidget);
    expect(http.to('/v1/customer/checkout/days').length, before); // nothing asked after the save
  });

  testWidgets('a disabled day explains why, from the contract reason', (t) async {
    await _pump(t);
    await t.tap(find.text('12'));
    await t.pump();
    expect(find.text('مكتمل: لا توجد سعة'), findsOneWidget);
    await t.tap(find.text('13'));
    await t.pump();
    expect(find.text('مغلق: عطلة المتجر'), findsOneWidget);
    expect(t.widget<JButton>(find.widgetWithText(JButton, 'متابعة إلى الدفع')).onPressed, isNull);
  });

  testWidgets('pickup: the pickup point from the cart answer, with the store phone («اتصال بالمتجر»)', (t) async {
    final launched = <Uri>[];
    await _pump(
      t,
      fulfilment: {
        'method': 'pickup',
        'addressId': null,
        'date': '2026-11-11',
        'window': null,
        'pickupPoint': {
          'name': ar('ملحمة النخبة · الياسمين'),
          'address': ar('الرياض، حي الياسمين'),
          'location': {'latitude': 24.82, 'longitude': 46.64},
          'phone': '+966500000009',
          'hours': {'start': '10:00', 'end': '23:00'},
        },
      },
      extra: [
        urlLauncherProvider.overrideWithValue((uri) async {
          launched.add(uri);
          return true;
        }),
      ],
    );
    expect(find.text('ملحمة النخبة · الياسمين'), findsOneWidget);
    expect(find.text('الاستلام من 10 ص إلى 11 م'), findsOneWidget);
    await t.ensureVisible(find.text('اتصال بالمتجر'));
    await t.tap(find.text('اتصال بالمتجر'));
    await t.pump();
    expect(launched.single, Uri(scheme: 'tel', path: '+966500000009'));
  });
}
