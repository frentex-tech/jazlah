import 'dart:async';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/data/mock_search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';

import 'catalog_fakes.dart';

/// The mock search with no delay; [mode] makes results hang, fail or come back empty.
class FakeSearch extends MockSearchRepository {
  FakeSearch({this.mode = Mode.ok, this.empty = false, this.capable = true}) : super(delay: Duration.zero);

  Mode mode;
  bool empty;

  /// False: behaves like the API (no sort, availability, count or popular searches).
  final bool capable;
  final List<SearchQuery> queries = [];

  @override
  bool get canSort => capable;

  @override
  bool get canFilterAvailable => capable;

  @override
  Future<CatalogPage<ProductCard>> search(SearchQuery query, {String? cursor, int limit = 20}) {
    queries.add(query);
    return switch (mode) {
      Mode.hang => Completer<CatalogPage<ProductCard>>().future,
      Mode.error => Future.error(const ApiError(code: 'UNKNOWN')),
      Mode.offline => Future.error(const ApiError(code: ApiError.network)),
      Mode.ok => empty ? Future.value(const CatalogPage<ProductCard>([], null)) : super.search(query, cursor: cursor),
    };
  }

  @override
  Future<int?> count(SearchQuery query) async => capable ? (empty ? 0 : super.count(query)) : null;

  @override
  Future<List<LocalizedText>> popular() async => capable ? super.popular() : const [];
}
