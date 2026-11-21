/// The public catalog as the app shows it (docs/frontend: public catalog). Money is integer halalas.
/// Fields marked "API gap" have no source in openapi.json yet: only the mock fills them, the API
/// repository leaves them null/false and the screens hide what they feed (docs/frontend/not-built-yet.md).
library;

class LocalizedText {
  const LocalizedText(this.ar, this.en);

  final String ar;
  final String en;

  String of(String language) => language == 'en' ? en : ar;
}

class Category {
  const Category({required this.id, required this.name, this.imageUrl});

  final String id;
  final LocalizedText name;
  final String? imageUrl;
}

class ProductCard {
  const ProductCard({
    required this.id,
    required this.vendorId,
    required this.name,
    required this.categoryId,
    required this.isAvailable,
    this.vendorName,
    this.meatTypeId,
    this.minPriceHalalas,
    this.coverUrl,
    this.subtitle,
    this.freshToday = false,
  });

  final String id;
  final String vendorId;
  final LocalizedText? vendorName;
  final LocalizedText name;
  final String categoryId;
  final String? meatTypeId;
  final bool isAvailable;

  /// The cheapest size, VAT included.
  final int? minPriceHalalas;
  final String? coverUrl;

  /// API gap: the default size line ("500 g · sliced").
  final LocalizedText? subtitle;

  /// API gap: the "slaughtered today" tag.
  final bool freshToday;
}

class Store {
  const Store({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.coverUrl,
    this.city,
    this.rating,
    this.ratingCount,
    this.isOpen,
    this.closesAt,
    this.opensAt,
    this.opensTomorrow = false,
    this.deliveryMinutes,
    this.minOrderHalalas,
    this.pickup,
  });

  final String id;
  final LocalizedText name;
  final LocalizedText? description;
  final String? logoUrl;
  final String? coverUrl;
  final String? city;

  // API gap from here on: rating, opening hours (minutes after midnight, Riyadh), delivery time,
  // minimum order and the pickup flag. Null = unknown, the screen hides it.
  final double? rating;
  final int? ratingCount;
  final bool? isOpen;
  final int? closesAt;
  final int? opensAt;
  final bool opensTomorrow;
  final int? deliveryMinutes;
  final int? minOrderHalalas;
  final bool? pickup;

  bool get closed => isOpen == false;
}

/// API gap: home banners (CMS-API-1).
class HomeBanner {
  const HomeBanner({required this.id, required this.title, this.tag, this.body, this.imageUrl});

  final String id;
  final LocalizedText title;
  final LocalizedText? tag;
  final LocalizedText? body;
  final String? imageUrl;
}

class HomeFeed {
  const HomeFeed({
    required this.categories,
    required this.bestSellers,
    required this.partnerStores,
    this.banners = const [],
    this.storesPaused = false,
  });

  final List<HomeBanner> banners;
  final List<Category> categories;
  final List<ProductCard> bestSellers;
  final List<Store> partnerStores;

  /// API gap: every store near the customer is paused (closed banner on home).
  final bool storesPaused;

  /// Nothing sells near the customer.
  bool get isEmpty => bestSellers.isEmpty && partnerStores.isEmpty;
}

/// One page of a cursor-paged list; [nextCursor] is null on the last page.
class CatalogPage<T> {
  const CatalogPage(this.items, this.nextCursor);

  final List<T> items;
  final String? nextCursor;
}

/// API gap: the public product list has no sort parameter.
enum ProductSort { popular, priceAsc, priceDesc }

/// What a product list shows; a record, so equal queries share one provider.
typedef ProductQuery = ({String? categoryId, String? vendorId, ProductSort sort});
