import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/data/search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';

/// As the server (catalog_search_text): the folded query, as one phrase, inside the folded
/// "Arabic name + space + English name". Store names are not searched.
bool matchesSearch(ProductCard p, String query) =>
    normalizeSearch('${p.name.ar} ${p.name.en}').contains(normalizeSearch(query));

/// Search over the mock catalog for USE_MOCKS and tests, with the parts the API lacks filled.
class MockSearchRepository implements SearchRepository {
  MockSearchRepository({this.delay = const Duration(milliseconds: 400)});

  final Duration delay;

  /// The Figma list.
  static const popularList = [
    LocalizedText('لحم غنم نعيمي', 'Naimi lamb'),
    LocalizedText('ضلوع غنم للمشاوي', 'Lamb ribs for grilling'),
    LocalizedText('صدر دجاج بلدي', 'Local chicken breast'),
    LocalizedText('كباب بقري متبّل', 'Marinated beef kebab'),
  ];

  Future<void> _wait() async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
  }

  List<ProductCard> _all(SearchQuery q) {
    final all = [
      for (final p in MockCatalogRepository.productList)
        if (matchesSearch(p, q.text) &&
            (q.categoryId == null || p.categoryId == q.categoryId) &&
            (q.vendorId == null || p.vendorId == q.vendorId) &&
            // A card without a price never matches a price bound.
            (q.minPriceHalalas == null || (p.minPriceHalalas ?? -1) >= q.minPriceHalalas!) &&
            (q.maxPriceHalalas == null || (p.minPriceHalalas != null && p.minPriceHalalas! <= q.maxPriceHalalas!)) &&
            (!q.availableOnly || p.isAvailable))
          p,
    ];
    if (q.sort != ProductSort.popular) {
      final sign = q.sort == ProductSort.priceAsc ? 1 : -1;
      all.sort((a, b) => sign * (a.minPriceHalalas ?? 0).compareTo(b.minPriceHalalas ?? 0));
    }
    return all;
  }

  @override
  bool get canSort => true;

  @override
  bool get canFilterAvailable => true;

  @override
  Future<CatalogPage<ProductCard>> search(SearchQuery query, {String? cursor, int limit = 20}) async {
    await _wait();
    final all = _all(query);
    final start = (int.tryParse(cursor ?? '') ?? 0).clamp(0, all.length);
    final end = (start + limit).clamp(0, all.length);
    return CatalogPage(all.sublist(start, end), end < all.length ? '$end' : null);
  }

  @override
  Future<int?> count(SearchQuery query) async {
    await _wait();
    return _all(query).length;
  }

  @override
  Future<List<LocalizedText>> popular() async {
    await _wait();
    return popularList;
  }
}
