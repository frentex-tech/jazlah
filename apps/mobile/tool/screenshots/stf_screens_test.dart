import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/home/presentation/categories_screen.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/store/presentation/store_screen.dart';

import 'harness.dart';

class _Located extends SelectedLocationController {
  @override
  SelectedLocation? build() => const SelectedLocation(point: GeoPoint(24.8168, 46.6195), line: 'التوصيل إلى الملقا، الرياض', covered: true);
}

/// mode: ok, hang, error, offline.
class _Repo extends MockCatalogRepository {
  _Repo({this.mode = 'ok', this.list = 'ok', super.storesPaused, super.empty}) : super(delay: Duration.zero);

  final String mode;
  final String list;

  Future<T> _gate<T>(String m, Future<T> Function() ok) => switch (m) {
    'hang' => hang<T>(),
    'error' => Future.error(const ApiError(code: 'UNKNOWN')),
    'offline' => Future.error(const ApiError(code: ApiError.network)),
    _ => ok(),
  };

  @override
  Future<HomeFeed> home() => _gate(mode, super.home);

  @override
  Future<List<Category>> categories() => _gate(mode, super.categories);

  @override
  Future<Store> store(String id) => _gate(mode, () => super.store(id));

  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) =>
      _gate(list, () => super.products(query, cursor: cursor, limit: limit));
}

/// The Figma store page shows other vendors' cards; ours lists the store's own.
class _EmptyStore extends _Repo {
  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) async =>
      const CatalogPage([], null);
}

List<dynamic> _o(MockCatalogRepository repo) => [
  catalogRepositoryProvider.overrideWithValue(repo),
  selectedLocationProvider.overrideWith(_Located.new),
  coverageRepositoryProvider.overrideWithValue(MockCoverageRepository()),
];

Widget _tab(Widget child) => MainShell(location: '/home', child: child);

Future<void> _scrollToEnd(WidgetTester t) async {
  await t.drag(find.byType(Scrollable).first, const Offset(0, -3000));
  await t.pump(const Duration(seconds: 1));
}

void main() {
  setUpAll(loadFonts);

  testWidgets('home', (t) async {
    await shoot(t, '118-6999', _tab(const HomeScreen()), overrides: _o(_Repo()));
    await shoot(t, '118-7219', _tab(const HomeScreen()), overrides: _o(_Repo()), height: 1926);
    await shoot(t, '118-7661', _tab(const HomeScreen()), overrides: _o(_Repo(mode: 'hang')));
    await shoot(t, '118-7740', _tab(const HomeScreen()), overrides: _o(_Repo(empty: true)));
    await shoot(t, '118-7802', _tab(const HomeScreen()), overrides: _o(_Repo(mode: 'error')));
    await shoot(t, '118-7854', _tab(const HomeScreen()), overrides: _o(_Repo(mode: 'offline')));
    await shoot(t, '118-7439', _tab(const HomeScreen()), overrides: _o(_Repo(storesPaused: true)));
    await shoot(t, 'en-118-6999', _tab(const HomeScreen()), overrides: _o(_Repo()), lang: 'en');
  });

  testWidgets('categories', (t) async {
    await shoot(t, '118-7909', _tab(const CategoriesScreen()), overrides: _o(_Repo()));
    await shoot(t, '118-8015', _tab(const CategoriesScreen()), overrides: _o(_Repo(mode: 'hang')));
    await shoot(t, '118-8092', _tab(const CategoriesScreen()), overrides: _o(_Repo(empty: true)));
    await shoot(t, '118-8137', _tab(const CategoriesScreen()), overrides: _o(_Repo(mode: 'error')));
  });

  testWidgets('store', (t) async {
    const falah = StoreScreen(id: 'v-falah', name: 'مجازر الفلاح');
    await shoot(t, '118-8184', falah, overrides: _o(_Repo()));
    await shoot(t, '118-8326', falah, overrides: _o(_Repo()), height: 1084);
    await shoot(t, '118-8612', falah, overrides: _o(_Repo(mode: 'hang')));
    await shoot(t, '118-8653', falah, overrides: _o(_EmptyStore()));
    await shoot(t, '118-8468', const StoreScreen(id: 'v-deera'), overrides: _o(_Repo()));
    await shoot(t, '118-8705', falah, overrides: _o(_Repo(mode: 'error')));
    await shoot(t, 'scrolled-118-8184', falah, overrides: _o(_Repo()), act: _scrollToEnd);
  });
}
