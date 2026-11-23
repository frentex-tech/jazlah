import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/store/presentation/category_screen.dart';
import 'package:jazlah/features/store/presentation/store_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/pump_screen.dart';

/// STF-MOB-1 #55 on the real API wiring: ApiCatalogRepository and ApiCoverageRepository over a fake HTTP layer
/// answering openapi-shaped bodies (GET /v1/public/categories, /v1/public/vendors, /v1/public/vendors/{id},
/// /v1/public/products with its cursor, GET /v1/public/coverage/check).

class _Located extends SelectedLocationController {
  @override
  SelectedLocation? build() => const SelectedLocation(point: GeoPoint(24.8, 46.6), line: 'حي الملقا', covered: true);
}

/// 25 products in category c1 (pages of 20 by the cursor), 3 stores, 2 categories.
FakeHttp _server() => FakeHttp((r) {
  final q = r.queryParameters;
  switch (r.path) {
    case '/v1/public/categories':
      return {
        'items': [categoryJson('c1', 'ذبائح كاملة'), categoryJson('c2', 'نصف ذبيحة')],
      };
    case '/v1/public/vendors':
      return {
        'items': [vendorJson('v1', 'ملحمة النخبة'), vendorJson('v2', 'ذبائح نجد'), vendorJson('v3', 'جزلة')],
        'nextCursor': null,
      };
    case '/v1/public/vendors/v1':
      return vendorJson('v1', 'ملحمة النخبة');
    case '/v1/public/coverage/check':
      return {'covered': true, 'zone': null};
    case '/v1/public/products':
      final all = [for (var i = 1; i <= 25; i++) cardJson('p$i', 'منتج $i')];
      final start = q['cursor'] == null ? 0 : int.parse(q['cursor'] as String);
      final limit = int.parse('${q['limit'] ?? 20}');
      final end = (start + limit).clamp(0, all.length);
      return {'items': all.sublist(start, end), 'nextCursor': end < all.length ? '$end' : null};
  }
  return null;
});

final Finder _vertical = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.down).first;

Future<FakeHttp> _pump(WidgetTester t, Widget screen) async {
  final http = _server();
  await t.pumpScreen(
    screen,
    overrides: [apiOn(http), selectedLocationProvider.overrideWith(_Located.new)],
  );
  await t.pump(const Duration(seconds: 1));
  await t.pump(const Duration(seconds: 1));
  return http;
}

void main() {
  group('tapping an item routes to it (real API)', () {
    testWidgets('home: a category tile opens its category', (t) async {
      await _pump(t, const MainShell(location: Routes.home, child: HomeScreen()));
      await t.tap(find.text('نصف ذبيحة'));
      await t.pumpAndSettle();
      expect(find.text('route:/home/category/c2'), findsOneWidget);
    });

    testWidgets('home: a partner store opens its page', (t) async {
      await _pump(t, const MainShell(location: Routes.home, child: HomeScreen()));
      await t.scrollUntilVisible(find.widgetWithText(JStoreCard, 'ذبائح نجد'), 200, scrollable: _vertical);
      await t.tap(find.widgetWithText(JStoreCard, 'ذبائح نجد'));
      await t.pumpAndSettle();
      expect(find.text('route:/home/store/v2'), findsOneWidget);
    });

    testWidgets('category page: a product opens its page', (t) async {
      await _pump(t, const CategoryScreen(id: 'c1'));
      await t.tap(find.text('منتج 2'));
      await t.pumpAndSettle();
      expect(find.text('route:/product/p2'), findsOneWidget);
    });

    testWidgets('store page: a product opens its page', (t) async {
      final http = await _pump(t, const StoreScreen(id: 'v1'));
      expect(http.to('/v1/public/products').first.queryParameters['vendorId'], 'v1');
      await t.tap(find.text('منتج 1'));
      await t.pumpAndSettle();
      expect(find.text('route:/product/p1'), findsOneWidget);
    });
  });

  testWidgets('infinite scroll: the next page by the API cursor, no duplicates, the last page not asked again', (
    t,
  ) async {
    final http = await _pump(
      t,
      const MainShell(
        location: '/home/category/c1',
        child: CategoryScreen(id: 'c1'),
      ),
    );
    for (var i = 0; i < 40; i++) {
      await t.drag(_vertical, const Offset(0, -300));
      await t.pump(const Duration(seconds: 1));
    }
    // The loaded list itself, not what was seen on screen: a page appended twice would show here.
    final container = ProviderScope.containerOf(t.element(find.byType(CategoryScreen)));
    const query = (categoryId: 'c1', vendorId: null, sort: ProductSort.popular);
    final ids = [for (final p in container.read(productPagesProvider(query)).value!.items) p.id];
    expect(ids, hasLength(25));
    expect(ids.toSet(), hasLength(25)); // no repeats
    expect(ids, [for (var i = 1; i <= 25; i++) 'p$i']); // every one, in order
    final pages = http.to('/v1/public/products');
    expect([for (final r in pages) r.queryParameters['cursor']], [null, '20']);
    expect(pages.first.queryParameters['categoryId'], 'c1');
  });
}
