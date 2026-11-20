import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:jazlah/features/search/presentation/search_screen.dart';

import '../../test/helpers/catalog_fakes.dart';
import '../../test/helpers/search_fakes.dart';
import 'harness.dart';

class _Recent extends RecentSearches {
  @override
  List<String> build() => ['ريب آي', 'كبدة غنم', 'مفروم بقري'];
}

List<dynamic> _o(FakeSearch repo) => [
  searchRepositoryProvider.overrideWithValue(repo),
  catalogRepositoryProvider.overrideWithValue(MockCatalogRepository(delay: Duration.zero)),
  recentSearchesProvider.overrideWith(_Recent.new),
];

/// The Figma results: «ريب آي», up to 100 SAR, available now.
const _figma = SearchQuery(text: 'ريب آي', maxPriceHalalas: 10000, availableOnly: true);
const _results = SearchScreen(initial: _figma);

void main() {
  setUpAll(loadFonts);

  testWidgets('search', (t) async {
    await shoot(t, '86-12826', const SearchScreen(), overrides: _o(FakeSearch()));
    await shoot(
      t,
      '86-12881',
      const SearchScreen(debounce: Duration(hours: 1)),
      overrides: _o(FakeSearch()),
      act: (t) async {
        await t.enterText(find.byType(TextField), 'ريب آي');
        FocusManager.instance.primaryFocus?.unfocus();
      },
    );
    await shoot(t, '86-12931', _results, overrides: _o(FakeSearch()));
    await shoot(t, '86-13056', _results, overrides: _o(FakeSearch(mode: Mode.hang)));
    await shoot(t, '86-13112', _results, overrides: _o(FakeSearch(empty: true)));
    await shoot(t, '86-13149', _results, overrides: _o(FakeSearch(mode: Mode.error)));
    await shoot(t, '86-13186', _results, overrides: _o(FakeSearch(mode: Mode.offline)));
    await shoot(
      t,
      '86-13223',
      _results,
      overrides: _o(FakeSearch()),
      act: (t) async {
        await t.tap(find.byType(JButton).first);
        await t.pumpAndSettle();
      },
    );
    await shoot(t, 'en-86-12931', _results, overrides: _o(FakeSearch()), lang: 'en');
  });
}
