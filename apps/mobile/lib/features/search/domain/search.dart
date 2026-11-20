import 'package:flutter/foundation.dart' show immutable;

import 'package:jazlah/features/catalog/domain/catalog.dart';

/// What the search shows: the typed words and the filters sheet's choices. Prices in halalas; a null
/// bound means no bound. Equal queries share one provider.
@immutable
class SearchQuery {
  const SearchQuery({
    this.text = '',
    this.categoryId,
    this.vendorId,
    this.minPriceHalalas,
    this.maxPriceHalalas,
    this.availableOnly = false,
    this.sort = ProductSort.popular,
  });

  final String text;
  final String? categoryId;
  final String? vendorId;
  final int? minPriceHalalas;
  final int? maxPriceHalalas;

  /// API gap: only the mock filters on availability.
  final bool availableOnly;

  /// API gap: only the mock sorts.
  final ProductSort sort;

  SearchQuery withText(String value) => SearchQuery(
    text: value,
    categoryId: categoryId,
    vendorId: vendorId,
    minPriceHalalas: minPriceHalalas,
    maxPriceHalalas: maxPriceHalalas,
    availableOnly: availableOnly,
    sort: sort,
  );

  /// "Clear filters": the words stay.
  SearchQuery get withoutFilters => SearchQuery(text: text);

  bool get hasPrice => minPriceHalalas != null || maxPriceHalalas != null;

  /// The number on the filter button: price, store, category, availability.
  int get activeFilters => [hasPrice, vendorId != null, categoryId != null, availableOnly].where((on) => on).length;

  /// Nothing to search for: the start page (recent and popular searches) shows.
  bool get isEmpty => text.isEmpty && activeFilters == 0;

  (String, String?, String?, int?, int?, bool, ProductSort) get _key =>
      (text, categoryId, vendorId, minPriceHalalas, maxPriceHalalas, availableOnly, sort);

  @override
  bool operator ==(Object other) => other is SearchQuery && other._key == _key;

  @override
  int get hashCode => _key.hashCode;
}
