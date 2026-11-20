import 'dart:async';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';

enum Mode { ok, hang, error, offline }

/// The mock catalog with no delay, and each call failing or hanging on demand.
class FakeCatalog extends MockCatalogRepository {
  FakeCatalog({this.mode = Mode.ok, this.productsMode = Mode.ok, this.sortable = true, super.storesPaused, super.empty})
    : super(delay: Duration.zero);

  Mode mode;
  Mode productsMode;
  final bool sortable;
  final List<String?> productCursors = [];
  int homeCalls = 0;

  @override
  bool get canSort => sortable;

  Future<T> _gate<T>(Mode m, Future<T> Function() ok) => switch (m) {
    Mode.hang => Completer<T>().future,
    Mode.error => Future.error(const ApiError(code: 'UNKNOWN')),
    Mode.offline => Future.error(const ApiError(code: ApiError.network)),
    Mode.ok => ok(),
  };

  @override
  Future<HomeFeed> home() {
    homeCalls++;
    return _gate(mode, super.home);
  }

  @override
  Future<List<Category>> categories() => _gate(mode, super.categories);

  @override
  Future<Store> store(String id) => _gate(mode, () => super.store(id));

  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) {
    productCursors.add(cursor);
    return _gate(productsMode, () => super.products(query, cursor: cursor, limit: limit));
  }
}

class _Located extends SelectedLocationController {
  @override
  SelectedLocation? build() =>
      const SelectedLocation(point: GeoPoint(24.8168, 46.6195), line: 'حي الملقا، الرياض', covered: true);
}

List<dynamic> catalogOverrides(FakeCatalog repo) => [
  catalogRepositoryProvider.overrideWithValue(repo),
  selectedLocationProvider.overrideWith(_Located.new),
  coverageRepositoryProvider.overrideWithValue(MockCoverageRepository()),
];
