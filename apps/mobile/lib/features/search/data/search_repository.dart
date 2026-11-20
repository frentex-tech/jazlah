import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/domain/search.dart';

/// Product search across every store. Results are cursor-paged; the parts the API does not have yet
/// (count, popular searches, sort, availability filter) say so, and the screen hides them.
abstract interface class SearchRepository {
  /// False: the sort group in the filters sheet is hidden.
  bool get canSort;

  /// False: the "available now only" switch is hidden.
  bool get canFilterAvailable;

  Future<CatalogPage<ProductCard>> search(SearchQuery query, {String? cursor, int limit = 20});

  /// How many products match; null when unknown (no count is shown).
  Future<int?> count(SearchQuery query);

  /// "Most searched"; empty hides the section.
  Future<List<LocalizedText>> popular();
}

class ApiSearchRepository implements SearchRepository {
  ApiSearchRepository(this._api);

  final JazlaApi _api;

  // shortcut: no sort parameter and no availability filter on the public product list, API gap
  // (not-built-yet.md); both controls are hidden.
  @override
  bool get canSort => false;

  @override
  bool get canFilterAvailable => false;

  @override
  Future<CatalogPage<ProductCard>> search(SearchQuery query, {String? cursor, int limit = 20}) async {
    try {
      final res = (await _api.getPublicCatalogApi().publicListProducts(
        cursor: cursor,
        limit: limit,
        q: query.text.isEmpty ? null : query.text,
        categoryId: query.categoryId,
        vendorId: query.vendorId,
        minPriceHalalas: query.minPriceHalalas,
        maxPriceHalalas: query.maxPriceHalalas,
      )).data!;
      return CatalogPage([for (final d in res.items) ApiCatalogRepository.card(d)], res.nextCursor);
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  // shortcut: the list has no total or facets, API gap (not-built-yet.md); the count text is hidden.
  @override
  Future<int?> count(SearchQuery query) async => null;

  // shortcut: no popular searches route, API gap (not-built-yet.md); the section is hidden.
  @override
  Future<List<LocalizedText>> popular() async => const [];
}
