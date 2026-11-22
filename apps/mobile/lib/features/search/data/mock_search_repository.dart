import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/data/search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';

/// As the server (CAT-API-5, owner's decision 2026-11-22): every word of the folded query (one-letter words
/// dropped) must appear, in any order, anywhere in the product's names or at the start of a word of its store's
/// names, Arabic or English. No word left: nothing matches (an empty page, never every product).
bool matchesSearch(ProductCard p, String query) {
  final words = searchWords(query);
  final names = normalizeSearch('${p.name.ar} ${p.name.en}');
  final store = p.vendorName == null ? '' : ' ${normalizeSearch('${p.vendorName!.ar} ${p.vendorName!.en}')}';
  return words.isNotEmpty && words.every((w) => names.contains(w) || store.contains(' $w'));
}

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
        // No text: no text filter (only a text with no word left answers an empty page).
        if ((q.text.trim().isEmpty || matchesSearch(p, q.text)) &&
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
