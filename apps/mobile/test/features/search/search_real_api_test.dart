import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/search/presentation/search_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/pump_screen.dart';

/// STF-MOB-4 #57 on the real API wiring: ApiSearchRepository and ApiCatalogRepository over a fake HTTP layer
/// answering openapi-shaped bodies (GET /v1/public/products with q and filters, categories, vendors).

class _Located extends SelectedLocationController {
  @override
  SelectedLocation? build() => const SelectedLocation(point: GeoPoint(24.8, 46.6), line: 'حي الملقا', covered: true);
}

FakeHttp _server() => FakeHttp((r) {
  switch (r.path) {
    case '/v1/public/categories':
      return {
        'items': [categoryJson('c1', 'ذبائح كاملة'), categoryJson('c2', 'نصف ذبيحة')],
      };
    case '/v1/public/vendors':
      return {
        'items': [vendorJson('v1', 'ملحمة النخبة')],
        'nextCursor': null,
      };
    case '/v1/public/products':
      return {
        'items': [cardJson('p1', 'ذبيحة نعيمي'), cardJson('p2', 'نصف ذبيحة نعيمي')],
        'nextCursor': null,
      };
  }
  return null;
});

void main() {
  testWidgets('the words and filters are kept after a product page (real API)', (t) async {
    final http = _server();
    await t.pumpScreen(
      const SearchScreen(),
      overrides: [apiOn(http), selectedLocationProvider.overrideWith(_Located.new)],
      routes: [
        GoRoute(
          path: '/product/:id',
          builder: (_, _) => const Scaffold(body: Text('product')),
        ),
      ],
    );
    await t.enterText(find.byType(TextField), 'نعيمي');
    for (var i = 0; i < 8; i++) {
      await t.pump(const Duration(milliseconds: 250)); // the typing pause, then the request
    }
    await t.tap(find.text('تصفية'));
    await t.pumpAndSettle();
    await t.tap(find.widgetWithText(JChip, 'نصف ذبيحة'));
    await t.pumpAndSettle();
    await t.tap(find.text('عرض النتائج'));
    await t.pumpAndSettle();
    final sent = http.to('/v1/public/products').last.queryParameters;
    expect(sent['q'], 'نعيمي');
    expect(sent['categoryId'], 'c2');
    final asked = http.to('/v1/public/products').length;

    await t.tap(find.text('ذبيحة نعيمي'));
    await t.pumpAndSettle();
    expect(find.text('product'), findsOneWidget);
    GoRouter.of(t.element(find.text('product'))).pop();
    await t.pumpAndSettle();

    expect(find.widgetWithText(TextField, 'نعيمي'), findsOneWidget);
    expect(find.text('تصفية (1)'), findsOneWidget);
    expect(find.widgetWithText(JChip, 'نصف ذبيحة'), findsOneWidget); // the active filter chip
    expect(find.text('ذبيحة نعيمي'), findsOneWidget); // the same results, not asked again
    expect(http.to('/v1/public/products').length, asked);
  });
}
