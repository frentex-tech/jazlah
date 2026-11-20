import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/data/mock_search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('normalizeSearch', () {
    test('ى → ي', () => expect(normalizeSearch('نعيمى'), normalizeSearch('نعيمي')));
    test('أ إ آ ٱ → ا', () {
      expect(normalizeSearch('أإآٱ'), 'اااا');
      expect(normalizeSearch('ريب آي'), normalizeSearch('ريب أي'));
    });
    test('ة → ه', () => expect(normalizeSearch('كبدة'), 'كبده'));
    test('tashkeel and tatweel removed', () {
      expect(normalizeSearch('كَبِدَةٌ'), 'كبده');
      expect(normalizeSearch('كبـــدة'), 'كبده');
      expect(normalizeSearch('متبّل'), 'متبل');
    });
    test('Latin lower-cased, spaces folded', () => expect(normalizeSearch('  Naimi   LAMB '), 'naimi lamb'));
  });

  group('MockSearchRepository', () {
    final repo = MockSearchRepository(delay: Duration.zero);
    Future<List<ProductCard>> find(SearchQuery q) async => (await repo.search(q, limit: 100)).items;
    Future<Set<String>> names(String text) async => {for (final p in await find(SearchQuery(text: text))) p.name.ar};

    test('«نعيمى» finds «نعيمي»', () async {
      final found = await names('نعيمى');
      expect(found, isNotEmpty);
      expect(found.every((n) => n.contains('نعيمي')), isTrue);
    });

    test('hamza variants, ة/ه, tatweel and tashkeel find the same products', () async {
      final ribeye = await names('ريب آي');
      expect(ribeye, {'ريب آي بقري طازج'});
      expect(await names('ريب أي'), ribeye);
      expect(await names('ريب اي'), ribeye);
      final liver = await names('كبدة');
      expect(liver, {'كبدة غنم طازجة'});
      expect(await names('كبده'), liver);
      expect(await names('كبـــدة'), liver);
      expect(await names('كَبِدَة'), liver);
    });

    test('English names match, any case', () async {
      expect(await names('naimi'), await names('نعيمي'));
      expect(await names('RIBEYE'), {'ريب آي بقري طازج'});
    });

    test('every word must match; store names match too', () async {
      expect(await names('غنم مفروم'), {'لحم غنم نعيمي مفروم'});
      final falah = await find(const SearchQuery(text: 'الفلاح'));
      expect(falah.every((p) => p.vendorId == 'v-falah'), isTrue);
      expect(await names('xyz'), isEmpty);
    });

    test('filters: category, store, price, availability', () async {
      final r = await find(
        const SearchQuery(categoryId: 'c-camel', vendorId: 'v-nukhba', maxPriceHalalas: 7000, availableOnly: true),
      );
      expect(r, isEmpty); // the only Al Nukhba camel product is out of stock
      final cheap = await find(const SearchQuery(minPriceHalalas: 3000, maxPriceHalalas: 4000));
      expect(cheap, isNotEmpty);
      expect(cheap.every((p) => p.minPriceHalalas! >= 3000 && p.minPriceHalalas! <= 4000), isTrue);
      final available = await find(const SearchQuery(text: 'حاشي', availableOnly: true));
      expect(available.every((p) => p.isAvailable), isTrue);
      expect(available.length, (await find(const SearchQuery(text: 'حاشي'))).length - 1);
    });

    test('sort by price', () async {
      final asc = await find(const SearchQuery(text: 'غنم', sort: ProductSort.priceAsc));
      final prices = [for (final p in asc) p.minPriceHalalas!];
      expect(prices, [...prices]..sort());
      final desc = await find(const SearchQuery(text: 'غنم', sort: ProductSort.priceDesc));
      expect(desc.first.minPriceHalalas, prices.last);
    });

    test('cursor pages and count', () async {
      const q = SearchQuery(categoryId: 'c-sheep');
      final first = await repo.search(q);
      expect(first.items, hasLength(20));
      final second = await repo.search(q, cursor: first.nextCursor);
      expect(second.nextCursor, isNull);
      expect(await repo.count(q), first.items.length + second.items.length);
    });
  });

  group('recent searches', () {
    Future<ProviderContainer> container(Map<String, Object> values) async {
      SharedPreferences.setMockInitialValues(values);
      final prefs = await Prefs.load();
      final c = ProviderContainer(overrides: [prefsProvider.overrideWithValue(prefs)]);
      addTearDown(c.dispose);
      return c;
    }

    test('newest first, no repeats, at most 8, kept on the device', () async {
      final c = await container({});
      final recent = c.read(recentSearchesProvider.notifier);
      for (var i = 0; i < 10; i++) {
        await recent.add('q$i');
      }
      await recent.add('  q5 ');
      await recent.add('   ');
      expect(c.read(recentSearchesProvider), ['q5', 'q9', 'q8', 'q7', 'q6', 'q4', 'q3', 'q2']);
      expect(c.read(prefsProvider).recentSearches, c.read(recentSearchesProvider));
    });

    test('loaded from the device and cleared', () async {
      final c = await container({
        'recentSearches': ['ريب آي'],
      });
      expect(c.read(recentSearchesProvider), ['ريب آي']);
      await c.read(recentSearchesProvider.notifier).clear();
      expect(c.read(recentSearchesProvider), isEmpty);
      expect(c.read(prefsProvider).recentSearches, isEmpty);
    });
  });
}
