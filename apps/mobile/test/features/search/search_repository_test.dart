import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/search/data/mock_search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fakes.dart';

void main() {
  group('normalizeSearch', () {
    test('ى → ي', () => expect(normalizeSearch('نعيمى'), normalizeSearch('نعيمي')));
    test('أ إ آ ٱ → ا (as the server)', () {
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

    // The server's catalog e2e cases (services/api/test/catalog.e2e-spec.ts, search), on the mock catalog.
    test('every word is needed, in any order', () async {
      expect(await names('غنم نعيمي مفروم'), {'لحم غنم نعيمي مفروم'});
      expect(await names('مفروم غنم'), {'لحم غنم نعيمي مفروم'}); // any order
      expect(await names('naimi   minced'), {'لحم غنم نعيمي مفروم'});
      expect(await names('نعيمي حري'), isEmpty); // both words are needed
      expect(await names('xyz'), isEmpty);
    });

    test('ٱ reads as ا, both ways', () async {
      expect(await names('ٱلفلاح'), await names('الفلاح'));
      expect(await names('ٱلفلاح'), isNotEmpty);
    });

    test('a store name matches from the start of its words only', () async {
      // «ملحمة النخبة»: «النخبة» and «ملحمة» start words; «لحم» and «خبة» are inside them.
      final nukhba = {
        for (final p in await find(const SearchQuery(text: 'النخبة'))) p.vendorId,
      };
      expect(nukhba, {'v-nukhba'});
      expect(
        await find(const SearchQuery(text: 'ملحمة')),
        hasLength((await find(const SearchQuery(text: 'nukhba'))).length),
      );
      expect(await find(const SearchQuery(text: 'خبة')), isEmpty);
      // «لحم» finds products named «لحم …», not every «ملحمة» product.
      final meat = await find(const SearchQuery(text: 'لحم'));
      expect(meat, isNotEmpty);
      expect(meat.every((p) => normalizeSearch('${p.name.ar} ${p.name.en}').contains('لحم')), isTrue);
      // A store word and a product word together.
      expect(await names('النخبة كبدة'), {'كبدة غنم طازجة'});
      expect({for (final p in await find(const SearchQuery(text: 'butch liver'))) p.name.en}, {'Fresh lamb liver'});
    });

    test('one-letter words are ignored; none left answers nothing', () async {
      expect(await find(const SearchQuery(text: 'a b')), isEmpty);
      expect(await find(const SearchQuery(text: 'ًـ ٌ')), isEmpty);
      expect(await names('كبدة ل'), {'كبدة غنم طازجة'});
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
      final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
      final c = ProviderContainer(
        overrides: [
          envProvider.overrideWithValue(const Env(Flavor.dev)),
          prefsProvider.overrideWithValue(prefs),
          tokenStorageProvider.overrideWithValue(tokens),
          authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        ],
      );
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

    test('spelling variants count as one search', () async {
      final c = await container({});
      final recent = c.read(recentSearchesProvider.notifier);
      await recent.add('نعيمي');
      await recent.add('كبدة');
      await recent.add('نعيمى');
      expect(c.read(recentSearchesProvider), ['نعيمى', 'كبدة']);
    });

    test('signing out forgets them, and the next search does not bring them back', () async {
      final c = await container({'onboardingSeen': true});
      final prefs = c.read(prefsProvider);
      c.listen(recentSearchesProvider, (_, _) {});
      await Future<void>.delayed(Duration.zero); // the session restores
      await c.read(recentSearchesProvider.notifier).add('ريب آي');
      await c.read(recentSearchesProvider.notifier).add('كبدة');

      await c.read(sessionProvider.notifier).signOut();
      expect(c.read(recentSearchesProvider), isEmpty);
      expect(prefs.recentSearches, isEmpty);

      await c.read(recentSearchesProvider.notifier).add('حاشي');
      expect(c.read(recentSearchesProvider), ['حاشي']);
      expect(prefs.recentSearches, ['حاشي']);
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
