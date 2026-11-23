import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/l10n/app_localizations_ar.dart';

import '../../helpers/catalog_fakes.dart';

const ProductQuery _all = (categoryId: null, vendorId: null, sort: ProductSort.popular);

/// A list that changed between two pages: page two starts with the last item of page one.
class _Shifting extends FakeCatalog {
  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) async {
    final page = await super.products(query, cursor: cursor, limit: limit);
    if (cursor == null) return page;
    final repeated = MockCatalogRepository.productList[int.parse(cursor) - 1];
    return CatalogPage([repeated, ...page.items], page.nextCursor);
  }
}

ProviderContainer _container(FakeCatalog repo) {
  final c = ProviderContainer(overrides: [catalogRepositoryProvider.overrideWithValue(repo)]);
  addTearDown(c.dispose);
  c.listen(productPagesProvider(_all), (_, _) {});
  return c;
}

void main() {
  test('the mock seed: 52 products with stable unique ids, the Figma best sellers first', () {
    final ids = MockCatalogRepository.productList.map((p) => p.id).toList();
    expect(ids.length, 52);
    expect(ids.toSet().length, ids.length);
    expect(ids.take(4), ['p-falah-ribeye', 'p-nukhba-lamb-liver', 'p-falah-naimi-mince', 'p-waha-chicken-breast']);
    expect(MockCatalogRepository.productList.first.minPriceHalalas, 4950);
  });

  test('infinite scroll walks every page by cursor without duplicates', () async {
    final repo = FakeCatalog();
    final c = _container(repo);
    final n = c.read(productPagesProvider(_all).notifier);
    await c.read(productPagesProvider(_all).future);
    expect(c.read(productPagesProvider(_all)).value!.items.length, 20);
    await n.loadMore();
    await n.loadMore();
    await n.loadMore(); // past the last page: no call
    final list = c.read(productPagesProvider(_all)).value!;
    expect(list.items.length, 52);
    expect(list.items.map((p) => p.id).toSet().length, 52);
    expect(list.hasMore, isFalse);
    expect(repo.productCursors, [null, '20', '40']);
  });

  test('an item repeated on the next page is shown once', () async {
    final c = _container(_Shifting());
    await c.read(productPagesProvider(_all).future);
    await c.read(productPagesProvider(_all).notifier).loadMore();
    final ids = c.read(productPagesProvider(_all)).value!.items.map((p) => p.id).toList();
    expect(ids.length, 40);
    expect(ids.toSet().length, 40);
  });

  test('a failed next page keeps the loaded items and can be retried', () async {
    final repo = FakeCatalog();
    final c = _container(repo);
    await c.read(productPagesProvider(_all).future);
    repo.productsMode = Mode.offline;
    await c.read(productPagesProvider(_all).notifier).loadMore();
    var list = c.read(productPagesProvider(_all)).value!;
    expect(list.items.length, 20);
    expect(list.moreError, isNotNull);
    repo.productsMode = Mode.ok;
    // Scrolling after a failure does not ask again by itself (no retry loop)…
    await c.read(productPagesProvider(_all).notifier).loadMore();
    expect(repo.productCursors, [null, '20']);
    expect(c.read(productPagesProvider(_all)).value!.moreError, isNotNull);
    // …only the footer's retry does.
    await c.read(productPagesProvider(_all).notifier).loadMore(retry: true);
    expect(repo.productCursors, [null, '20', '20']);
    list = c.read(productPagesProvider(_all)).value!;
    expect(list.items.length, 40);
    expect(list.moreError, isNull);
  });

  test('mock filters by category and store, and sorts by price', () async {
    final repo = FakeCatalog();
    final store = await repo.products((categoryId: null, vendorId: 'v-waha', sort: ProductSort.popular));
    expect(store.items.every((p) => p.vendorId == 'v-waha'), isTrue);
    final cheap = await repo.products((categoryId: 'c-sheep', vendorId: null, sort: ProductSort.priceAsc), limit: 50);
    final prices = cheap.items.map((p) => p.minPriceHalalas!).toList();
    expect(cheap.items.every((p) => p.categoryId == 'c-sheep'), isTrue);
    expect(prices, [...prices]..sort());
  });

  test('money and time formatting', () {
    final l10n = AppLocalizationsAr();
    expect(formatHalalas(8900), '89.00');
    expect(formatHalalas(5), '0.05');
    expect(formatHalalas(-1250), '-12.50');
    expect(formatHalalas(118000), '1,180.00');
    expect(formatHalalas(99999), '999.99');
    expect(formatHalalas(123456789), '1,234,567.89');
    expect(formatHalalas(-165000), '-1,650.00');
    expect(formatHalalas(165000), '1,650.00');
    expect(formatMinutes(l10n, 23 * 60), '11:00 م');
    expect(formatMinutes(l10n, 8 * 60), '8:00 ص');
    expect(formatMinutes(l10n, 12 * 60 + 30), '12:30 م');
    expect(formatMinutes(l10n, 0), '12:00 ص');
  });
}
