import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/orders/presentation/order_detail_screen.dart';
import 'package:jazlah/features/orders/presentation/orders_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// ORD-MOB-2 #85 on the real wiring: ApiOrderRepository over a fake HTTP layer (GET /v1/customer/orders,
/// GET /v1/customer/orders/{id}; OrderSummaryResponseDto and OrderResponseDto).

List<dynamic> _overrides(FakeHttp http) {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    apiOn(http),
  ];
}

Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 4; i++) {
    await t.pump(const Duration(milliseconds: 500));
  }
}

Map<String, Object?> _history(String at, String to, [String? from]) => {
  'from': from,
  'to': to,
  'actorType': 'vendor',
  'note': null,
  'at': at,
};

Map<String, Object?> _summary(String id, {String? number}) {
  final o = orderJson(id, status: 'confirmed');
  return {
    for (final k in [
      'id',
      'number',
      'status',
      'orderType',
      'fulfilment',
      'fulfilmentDate',
      'vendor',
      'customer',
      'paymentMethod',
      'totalHalalas',
      'createdAt',
    ])
      k: o[k],
    'number': ?number,
  };
}

void main() {
  testWidgets('the list follows nextCursor: two pages, no duplicates, the last page not asked again', (t) async {
    final http = FakeHttp((r) {
      if (r.path != '/v1/customer/orders') return null;
      return r.queryParameters['cursor'] == 'c2'
          ? {
              'items': [_summary('o2', number: 'JZ-261110-0008')],
              'nextCursor': null,
            }
          : {
              'items': [_summary('o1')],
              'nextCursor': 'c2',
            };
    });
    await t.pumpScreen(const OrdersScreen(), overrides: _overrides(http));
    await _settle(t);
    expect(find.text('طلب JZ-261110-0007'), findsOneWidget);
    expect(find.text('طلب JZ-261110-0008'), findsOneWidget);
    expect([for (final r in http.to('/v1/customer/orders')) r.queryParameters['cursor']], [null, 'c2']);
  });

  testWidgets('a status changed on the dashboard reaches the open detail: the 30 s poll reads it from GET', (t) async {
    var status = 'confirmed';
    final http = FakeHttp(
      (r) => r.path == '/v1/customer/orders/o1'
          ? orderJson(
              'o1',
              status: status,
              paymentStatus: 'captured',
              paymentId: 'pay1',
              history: [
                _history('2026-11-10T06:12:00.000Z', 'confirmed', 'pending_payment'),
                if (status == 'preparing') _history('2026-11-10T07:00:00.000Z', 'preparing', 'confirmed'),
              ],
            )
          : null,
    );
    await t.pumpScreen(const OrderDetailScreen(id: 'o1'), overrides: _overrides(http));
    await _settle(t);
    expect(find.text('طلب JZ-261110-0007'), findsOneWidget);
    expect(find.text('مؤكد'), findsOneWidget);

    status = 'preparing'; // the vendor moved it (ORD-API-2)
    await t.pump(OrderDetailScreen.pollEvery);
    await _settle(t);
    expect(find.text('قيد التجهيز'), findsOneWidget);
    expect(find.text('10:00 ص'), findsOneWidget); // the step's time, Riyadh, from the history
    expect(http.to('/v1/customer/orders/o1').length, greaterThanOrEqualTo(2));
  });

  testWidgets('the list reads the summaries (OrderSummaryResponseDto)', (t) async {
    final http = FakeHttp((r) {
      if (r.path == '/v1/customer/orders') {
        return {
          'items': [_summary('o1')],
          'nextCursor': null,
        };
      }
      return null;
    });
    await t.pumpScreen(const OrdersScreen(), overrides: _overrides(http));
    await _settle(t);
    expect(find.text('طلب JZ-261110-0007'), findsOneWidget);
    expect(find.text('مؤكد'), findsOneWidget);
    expect(find.text('123.00 ر.س'), findsOneWidget);
  });

  testWidgets('a pickup order: the pickup point with its hours and the store phone («اتصال بالمتجر»)', (t) async {
    final launched = <Uri>[];
    final http = FakeHttp((r) {
      if (r.path != '/v1/customer/orders/o1') return null;
      return {
        ...orderJson('o1', status: 'ready', paymentStatus: 'captured', paymentId: 'pay1'),
        'fulfilment': 'pickup',
        'address': null,
        'window': null,
        'pickupPoint': {
          'name': ar('ملحمة النخبة · الياسمين'),
          'address': ar('الرياض، حي الياسمين'),
          'location': {'latitude': 24.82, 'longitude': 46.64},
          'phone': '+966500000009',
          'hours': {'start': '10:00', 'end': '23:00'},
        },
      };
    });
    await t.pumpScreen(
      const OrderDetailScreen(id: 'o1'),
      overrides: [
        ..._overrides(http),
        urlLauncherProvider.overrideWithValue((uri) async {
          launched.add(uri);
          return true;
        }),
      ],
    );
    await _settle(t);
    await t.scrollUntilVisible(find.text('اتصال بالمتجر'), 300, scrollable: find.byType(Scrollable).first);
    expect(find.text('ملحمة النخبة · الياسمين'), findsWidgets);
    expect(find.text('الاستلام من 10 ص إلى 11 م'), findsOneWidget);
    await t.tap(find.text('اتصال بالمتجر'));
    await t.pump();
    expect(launched.single, Uri(scheme: 'tel', path: '+966500000009'));
  });
}
