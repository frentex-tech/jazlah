import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/catalog/data/catalog_repository.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => Env.useMocks ? MockCatalogRepository() : ApiCatalogRepository(ref.watch(apiProvider)),
);

// No automatic retry anywhere here: the error panel (with its own retry) shows at once.

final FutureProvider<HomeFeed> homeFeedProvider = FutureProvider.autoDispose<HomeFeed>(
  (ref) => ref.watch(catalogRepositoryProvider).home(),
  retry: (_, _) => null,
);

final FutureProvider<List<Category>> categoriesProvider = FutureProvider.autoDispose<List<Category>>(
  (ref) => ref.watch(catalogRepositoryProvider).categories(),
  retry: (_, _) => null,
);

final FutureProviderFamily<Store, String> storeProvider = FutureProvider.autoDispose.family<Store, String>(
  (ref, id) => ref.watch(catalogRepositoryProvider).store(id),
  retry: (_, _) => null,
);

final AsyncNotifierProviderFamily<ProductPages, PagedList<ProductCard>, ProductQuery> productPagesProvider =
    AsyncNotifierProvider.autoDispose.family<ProductPages, PagedList<ProductCard>, ProductQuery>(
      ProductPages.new,
      retry: (_, _) => null,
    );

final AsyncNotifierProvider<StorePages, PagedList<Store>> storePagesProvider =
    AsyncNotifierProvider.autoDispose<StorePages, PagedList<Store>>(
      StorePages.new,
      retry: (_, _) => null,
    );

/// The pages loaded so far. The first page's loading and error are the provider's; later pages
/// report through [loadingMore] and [moreError] so the loaded items stay on screen.
class PagedList<T> {
  const PagedList(this.items, this.nextCursor, {this.loadingMore = false, this.moreError});

  final List<T> items;
  final String? nextCursor;
  final bool loadingMore;
  final Object? moreError;

  bool get hasMore => nextCursor != null;
}

/// Infinite scroll: [loadMore] appends the next page, skipping ids already shown (a list that changed
/// between two pages can repeat an item).
abstract class PagedNotifier<T> extends AsyncNotifier<PagedList<T>> {
  Future<CatalogPage<T>> fetch(String? cursor);

  String idOf(T item);

  @override
  Future<PagedList<T>> build() async {
    final page = await fetch(null);
    return PagedList(_unique(const [], page.items), page.nextCursor);
  }

  List<T> _unique(List<T> shown, List<T> next) {
    final seen = {for (final i in shown) idOf(i)};
    return [...shown, ...next.where((i) => seen.add(idOf(i)))];
  }

  Future<void> loadMore() async {
    final current = state.value;
    if (current == null || !current.hasMore || current.loadingMore || state.isLoading) return;
    final loading = PagedList(current.items, current.nextCursor, loadingMore: true);
    state = AsyncData(loading);
    try {
      final page = await fetch(current.nextCursor);
      // A refresh while this page was loading wins.
      if (!ref.mounted || !identical(state.value, loading)) return;
      state = AsyncData(PagedList(_unique(current.items, page.items), page.nextCursor));
    } on Object catch (e) {
      if (!ref.mounted || !identical(state.value, loading)) return;
      state = AsyncData(PagedList(current.items, current.nextCursor, moreError: e));
    }
  }
}

class ProductPages extends PagedNotifier<ProductCard> {
  ProductPages(this.query);

  final ProductQuery query;

  @override
  Future<CatalogPage<ProductCard>> fetch(String? cursor) =>
      ref.read(catalogRepositoryProvider).products(query, cursor: cursor);

  @override
  String idOf(ProductCard item) => item.id;
}

class StorePages extends PagedNotifier<Store> {
  @override
  Future<CatalogPage<Store>> fetch(String? cursor) => ref.read(catalogRepositoryProvider).stores(cursor: cursor);

  @override
  String idOf(Store item) => item.id;
}
