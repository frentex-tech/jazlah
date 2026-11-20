import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/search/data/mock_search_repository.dart';
import 'package:jazlah/features/search/data/search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';

final searchRepositoryProvider = Provider<SearchRepository>(
  (ref) => Env.useMocks ? MockSearchRepository() : ApiSearchRepository(ref.watch(apiProvider)),
);

// No automatic retry: the error panel (with its own retry) shows at once.

final AsyncNotifierProviderFamily<SearchPages, PagedList<ProductCard>, SearchQuery> searchPagesProvider =
    AsyncNotifierProvider.autoDispose.family<SearchPages, PagedList<ProductCard>, SearchQuery>(
      SearchPages.new,
      retry: (_, _) => null,
    );

final FutureProviderFamily<int?, SearchQuery> searchCountProvider = FutureProvider.autoDispose
    .family<int?, SearchQuery>((ref, query) => ref.watch(searchRepositoryProvider).count(query), retry: (_, _) => null);

final FutureProvider<List<LocalizedText>> popularSearchesProvider = FutureProvider.autoDispose<List<LocalizedText>>(
  (ref) => ref.watch(searchRepositoryProvider).popular(),
  retry: (_, _) => null,
);

final recentSearchesProvider = NotifierProvider<RecentSearches, List<String>>(RecentSearches.new);

class SearchPages extends PagedNotifier<ProductCard> {
  SearchPages(this.query);

  final SearchQuery query;

  @override
  Future<CatalogPage<ProductCard>> fetch(String? cursor) =>
      ref.read(searchRepositoryProvider).search(query, cursor: cursor);

  @override
  String idOf(ProductCard item) => item.id;
}

/// The last searches on this device, newest first, without repeats.
class RecentSearches extends Notifier<List<String>> {
  static const max = 8;

  @override
  List<String> build() => ref.watch(prefsProvider).recentSearches;

  Future<void> add(String text) async {
    final t = text.trim();
    if (t.isEmpty) return;
    state = [t, ...state.where((s) => s != t)].take(max).toList();
    await ref.read(prefsProvider).setRecentSearches(state);
  }

  Future<void> clear() async {
    state = const [];
    await ref.read(prefsProvider).setRecentSearches(const []);
  }
}
