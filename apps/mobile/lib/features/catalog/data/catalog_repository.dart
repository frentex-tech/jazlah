import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';

/// The public catalog: home, categories, stores and product lists. Shared by home, the category and
/// store pages, product detail and search. Lists are cursor-paged.
abstract interface class CatalogRepository {
  /// False when product lists cannot be sorted: the sort control is hidden.
  bool get canSort;

  Future<HomeFeed> home();

  Future<List<Category>> categories();

  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20});

  Future<CatalogPage<Store>> stores({String? cursor, int limit = 20});

  Future<Store> store(String id);
}

class ApiCatalogRepository implements CatalogRepository {
  ApiCatalogRepository(this._api);

  final JazlaApi _api;

  PublicCatalogApi get _catalog => _api.getPublicCatalogApi();
  PublicVendorsApi get _vendors => _api.getPublicVendorsApi();

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  static LocalizedText _text(LocalizedTextResponseDto t) => LocalizedText(t.ar, t.en);

  static Category _category(ReferenceItemResponseDto d) =>
      Category(id: d.id, name: _text(d.name), imageUrl: d.imageUrl);

  static ProductCard _card(ProductCardResponseDto d) => ProductCard(
    id: d.id,
    vendorId: d.vendor.id,
    vendorName: d.vendor.name == null ? null : _text(d.vendor.name!),
    name: _text(d.name),
    categoryId: d.categoryId,
    meatTypeId: d.meatTypeId,
    isAvailable: d.isAvailable,
    minPriceHalalas: d.minPriceHalalas?.toInt(),
    coverUrl: d.coverUrl,
  );

  static Store _store(PublicVendorResponseDto d) => Store(
    id: d.id,
    name: _text(d.name),
    description: d.description.ar == null && d.description.en == null
        ? null
        : LocalizedText(d.description.ar ?? d.description.en!, d.description.en ?? d.description.ar!),
    logoUrl: d.logoUrl,
    coverUrl: d.coverUrl,
    city: d.city,
  );

  // shortcut: no sort parameter on the public product list, API gap (not-built-yet.md); the control is hidden.
  @override
  bool get canSort => false;

  // shortcut: no home feed route yet, API gap (not-built-yet.md). Built from the public lists: the first
  // products stand in for best sellers; no banners and no "stores paused" flag.
  @override
  Future<HomeFeed> home() async {
    // Future.wait reports the first failure (an ApiError) and swallows the others.
    final r = await Future.wait<Object>([
      categories(),
      products((categoryId: null, vendorId: null, sort: ProductSort.popular), limit: 4),
      stores(limit: 3),
    ]);
    return HomeFeed(
      categories: r[0] as List<Category>,
      bestSellers: (r[1] as CatalogPage<ProductCard>).items,
      partnerStores: (r[2] as CatalogPage<Store>).items,
    );
  }

  @override
  Future<List<Category>> categories() =>
      _call(() async => [for (final d in (await _catalog.publicListCategories()).data!.items) _category(d)]);

  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) => _call(() async {
    final res = (await _catalog.publicListProducts(
      cursor: cursor,
      limit: limit,
      categoryId: query.categoryId,
      vendorId: query.vendorId,
    )).data!;
    return CatalogPage([for (final d in res.items) _card(d)], res.nextCursor);
  });

  @override
  Future<CatalogPage<Store>> stores({String? cursor, int limit = 20}) => _call(() async {
    final res = (await _vendors.publicListVendors(cursor: cursor, limit: limit)).data!;
    return CatalogPage([for (final d in res.items) _store(d)], res.nextCursor);
  });

  @override
  Future<Store> store(String id) => _call(() async => _store((await _vendors.publicGetVendor(id: id)).data!));
}
