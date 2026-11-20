import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';

/// In-memory catalog for USE_MOCKS and tests: the Figma vendors, categories and products, with the
/// API-gap fields filled. Product ids are stable (`p-<vendor>-<item>`) so later screens can link to them.
class MockCatalogRepository implements CatalogRepository {
  MockCatalogRepository({
    this.storesPaused = false,
    this.empty = false,
    this.delay = const Duration(milliseconds: 400),
  });

  /// Home shows the "stores paused" banner.
  final bool storesPaused;

  /// Nothing sells in the area: every list is empty.
  final bool empty;
  final Duration delay;

  static const _img = 'assets/images';

  static const vendors = [
    Store(
      id: 'v-falah',
      name: LocalizedText('مجازر الفلاح', 'Al Falah Butchers'),
      description: LocalizedText('ذبائح طازجة يوميًا من مزارع القصيم.', 'Fresh carcasses daily from Qassim farms.'),
      coverUrl: '$_img/ribeye-paper.jpg',
      city: 'الرياض',
      rating: 4.8,
      ratingCount: 320,
      isOpen: true,
      closesAt: 23 * 60,
      opensAt: 8 * 60,
      deliveryMinutes: 35,
      minOrderHalalas: 5000,
      pickup: true,
    ),
    Store(
      id: 'v-nukhba',
      name: LocalizedText('ملحمة النخبة', 'Al Nukhba Butchery'),
      description: LocalizedText('قطعيات مختارة وتجهيز حسب الطلب.', 'Selected cuts, prepared to order.'),
      coverUrl: '$_img/steaks-dark.jpg',
      city: 'الرياض',
      rating: 4.7,
      ratingCount: 210,
      isOpen: true,
      closesAt: 22 * 60,
      opensAt: 9 * 60,
      deliveryMinutes: 45,
      minOrderHalalas: 7500,
      pickup: true,
    ),
    Store(
      id: 'v-waha',
      name: LocalizedText('مزارع الواحة', 'Al Waha Farms'),
      description: LocalizedText('دواجن بلدية وأعلاف من مزارعنا.', 'Local poultry and feed from our farms.'),
      coverUrl: '$_img/butchers.jpg',
      city: 'الخرج',
      rating: 4.9,
      ratingCount: 158,
      isOpen: true,
      closesAt: 21 * 60,
      opensAt: 7 * 60,
      deliveryMinutes: 60,
      minOrderHalalas: 10000,
      pickup: false,
    ),
    Store(
      id: 'v-deera',
      name: LocalizedText('ذبائح الديرة', 'Al Deera Sacrifices'),
      description: LocalizedText('ذبائح المناسبات والولائم.', 'Carcasses for occasions and feasts.'),
      coverUrl: '$_img/lamb-raw.jpg',
      city: 'الرياض',
      rating: 4.5,
      ratingCount: 96,
      isOpen: false,
      closesAt: 23 * 60,
      opensAt: 8 * 60,
      opensTomorrow: true,
      deliveryMinutes: 50,
      minOrderHalalas: 5000,
      pickup: true,
    ),
  ];

  /// Ordered as the categories screen.
  static const categoryList = [
    Category(id: 'c-sheep', name: LocalizedText('الأغنام', 'Sheep'), imageUrl: '$_img/lamb-raw.jpg'),
    Category(id: 'c-cattle', name: LocalizedText('الأبقار', 'Cattle'), imageUrl: '$_img/steaks-dark.jpg'),
    Category(id: 'c-camel', name: LocalizedText('الإبل', 'Camels'), imageUrl: '$_img/cuts.jpg'),
    Category(id: 'c-poultry', name: LocalizedText('الدواجن', 'Poultry'), imageUrl: '$_img/butchers.jpg'),
    Category(id: 'c-mince', name: LocalizedText('المفرومات', 'Minced meat'), imageUrl: '$_img/cuts.jpg'),
    Category(id: 'c-grills', name: LocalizedText('المشويات', 'Grills'), imageUrl: '$_img/ribeye-paper.jpg'),
    Category(id: 'c-aqiqah', name: LocalizedText('العقائق', 'Aqiqah'), imageUrl: '$_img/lamb-raw.jpg'),
    Category(id: 'c-feasts', name: LocalizedText('الولائم', 'Feasts'), imageUrl: '$_img/butchers.jpg'),
    Category(id: 'c-adahi', name: LocalizedText('الأضاحي', 'Adahi'), imageUrl: '$_img/lamb-raw.jpg'),
    Category(id: 'c-frozen', name: LocalizedText('المجمدات', 'Frozen'), imageUrl: '$_img/steaks-dark.jpg'),
    Category(id: 'c-fish', name: LocalizedText('الأسماك', 'Fish'), imageUrl: '$_img/cuts.jpg'),
    Category(id: 'c-spices', name: LocalizedText('البهارات', 'Spices'), imageUrl: '$_img/ribeye-paper.jpg'),
    Category(id: 'c-feed', name: LocalizedText('الأعلاف', 'Feed')),
  ];

  /// The six on home, in the home order.
  static const _homeCategories = ['c-sheep', 'c-camel', 'c-cattle', 'c-poultry', 'c-grills', 'c-feed'];

  static const banners = [
    HomeBanner(
      id: 'b-points',
      tag: LocalizedText('نقاط جزلة', 'JAZLA points'),
      title: LocalizedText('اطلب واجمع نقاط الولاء', 'Order and collect loyalty points'),
      body: LocalizedText('كل ريال تشتري به يقرّبك من ذبيحة مجانية', 'Every riyal brings you closer to a free carcass'),
      imageUrl: '$_img/lamb-raw.jpg',
    ),
    HomeBanner(
      id: 'b-occasions',
      tag: LocalizedText('المناسبات', 'Occasions'),
      title: LocalizedText('ذبائح الولائم والعقائق', 'Carcasses for feasts and aqiqah'),
      body: LocalizedText('اختر الحجم والتقطيع ونوصلها في موعدك', 'Pick the size and cut, delivered on time'),
      imageUrl: '$_img/butchers.jpg',
    ),
    HomeBanner(
      id: 'b-chilled',
      tag: LocalizedText('توصيل مبرّد', 'Chilled delivery'),
      title: LocalizedText('طازجة من المجزرة إلى بابك', 'Fresh from the butcher to your door'),
      imageUrl: '$_img/steaks-dark.jpg',
    ),
  ];

  // (slug, ar, en, category, meat type, price in halalas, size line ar, en, image, vendors). The first
  // vendor of each item comes first in the list, so the first four are the Figma best sellers.
  static const _items = <(String, String, String, String, String?, int, String, String, String?, List<String>)>[
    (
      'ribeye',
      'ريب آي بقري طازج',
      'Fresh beef ribeye',
      'c-cattle',
      null,
      8900,
      '500 جم · تقطيع شرائح',
      '500 g · sliced',
      'ribeye-paper',
      ['falah', 'nukhba', 'deera'],
    ),
    (
      'lamb-liver',
      'كبدة غنم طازجة',
      'Fresh lamb liver',
      'c-sheep',
      'mt-naimi',
      3200,
      '500 جم · قطعة كاملة',
      '500 g · whole',
      'cuts',
      ['nukhba', 'falah', 'deera'],
    ),
    (
      'naimi-mince',
      'لحم غنم نعيمي مفروم',
      'Minced Naimi lamb',
      'c-sheep',
      'mt-naimi',
      7400,
      '1 كجم · مفروم ناعم',
      '1 kg · fine mince',
      'lamb-raw',
      ['falah', 'nukhba', 'waha'],
    ),
    (
      'chicken-breast',
      'صدر دجاج بلدي',
      'Local chicken breast',
      'c-poultry',
      null,
      3800,
      '1 كجم · بدون جلد',
      '1 kg · skinless',
      'butchers',
      ['waha', 'falah', 'deera'],
    ),
    (
      'naimi-whole',
      'ذبيحة نعيمي كاملة',
      'Whole Naimi sheep',
      'c-sheep',
      'mt-naimi',
      165000,
      'ذبيحة · 14–16 كجم',
      'Carcass · 14–16 kg',
      'lamb-raw',
      ['falah', 'nukhba', 'deera'],
    ),
    (
      'harri-half',
      'نصف ذبيحة حري',
      'Half Harri sheep',
      'c-sheep',
      'mt-harri',
      85000,
      'نصف ذبيحة · 7–8 كجم',
      'Half carcass · 7–8 kg',
      'lamb-raw',
      ['falah', 'waha', 'nukhba'],
    ),
    (
      'sawakni-shoulder',
      'كتف سواكني',
      'Sawakni shoulder',
      'c-sheep',
      'mt-sawakni',
      9500,
      '1.5 كجم · قطعة كاملة',
      '1.5 kg · whole',
      'cuts',
      ['nukhba', 'deera', 'waha'],
    ),
    (
      'najdi-chops',
      'ريش نجدي',
      'Najdi lamb chops',
      'c-sheep',
      'mt-najdi',
      12500,
      '1 كجم · ريش',
      '1 kg · chops',
      'steaks-dark',
      ['falah', 'nukhba', 'deera'],
    ),
    (
      'tais-whole',
      'ذبيحة تيس بلدي',
      'Whole local goat',
      'c-sheep',
      'mt-tais',
      120000,
      'ذبيحة · 10–12 كجم',
      'Carcass · 10–12 kg',
      'butchers',
      ['waha', 'deera', 'falah'],
    ),
    (
      'veal-cubes',
      'لحم عجل مكعبات',
      'Veal cubes',
      'c-cattle',
      null,
      6900,
      '1 كجم · مكعبات',
      '1 kg · cubes',
      'steaks-dark',
      ['falah', 'nukhba', 'waha'],
    ),
    (
      'beef-mince',
      'لحم بقري مفروم',
      'Minced beef',
      'c-cattle',
      null,
      5900,
      '1 كجم · مفروم وسط',
      '1 kg · medium mince',
      'cuts',
      ['nukhba', 'waha', 'deera'],
    ),
    (
      'hashi-cubes',
      'لحم حاشي طازج',
      'Fresh hashi camel',
      'c-camel',
      'mt-hashi',
      7900,
      '1 كجم · مكعبات',
      '1 kg · cubes',
      'steaks-dark',
      ['falah', 'deera', 'waha'],
    ),
    (
      'hashi-hump',
      'سنام حاشي',
      'Hashi camel hump',
      'c-camel',
      'mt-hashi',
      6500,
      '500 جم · شرائح',
      '500 g · slices',
      'cuts',
      ['falah', 'nukhba', 'deera'],
    ),
    (
      'whole-chicken',
      'دجاج بلدي كامل',
      'Whole local chicken',
      'c-poultry',
      null,
      4500,
      '1.2 كجم · منظف',
      '1.2 kg · cleaned',
      'butchers',
      ['waha', 'nukhba', 'falah'],
    ),
    (
      'lamb-kebab',
      'كباب لحم غنم',
      'Lamb kebab',
      'c-grills',
      null,
      6200,
      '1 كجم · متبل',
      '1 kg · marinated',
      'ribeye-paper',
      ['falah', 'nukhba', 'waha'],
    ),
    (
      'shish-tawook',
      'شيش طاووق',
      'Shish tawook',
      'c-grills',
      null,
      4800,
      '1 كجم · متبل',
      '1 kg · marinated',
      'butchers',
      ['waha', 'nukhba', 'deera'],
    ),
    (
      'alfalfa',
      'برسيم حجازي',
      'Alfalfa bale',
      'c-feed',
      null,
      3500,
      'حزمة · 20 كجم',
      'Bale · 20 kg',
      null,
      ['waha', 'deera'],
    ),
    ('barley', 'شعير علف', 'Feed barley', 'c-feed', null, 6000, 'كيس · 40 كجم', 'Bag · 40 kg', null, ['waha', 'falah']),
  ];

  /// Out of stock in the mock (the card's unavailable state).
  static const _unavailable = {'p-nukhba-hashi-hump', 'p-waha-veal-cubes'};

  /// 52 products, in "popular" order.
  static final List<ProductCard> productList = [
    for (var round = 0; round < 3; round++)
      for (final (slug, ar, en, category, meatType, price, subAr, subEn, image, sellers) in _items)
        if (round < sellers.length)
          ProductCard(
            id: 'p-${sellers[round]}-$slug',
            vendorId: 'v-${sellers[round]}',
            vendorName: vendors.firstWhere((v) => v.id == 'v-${sellers[round]}').name,
            name: LocalizedText(ar, en),
            categoryId: category,
            meatTypeId: meatType,
            isAvailable: !_unavailable.contains('p-${sellers[round]}-$slug'),
            // Each vendor prices a little differently.
            minPriceHalalas: price + round * 250,
            coverUrl: image == null ? null : '$_img/$image.jpg',
            subtitle: LocalizedText(subAr, subEn),
            freshToday: category != 'c-feed' && category != 'c-grills',
          ),
  ];

  Future<void> _wait() async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
  }

  @override
  bool get canSort => true;

  @override
  Future<HomeFeed> home() async {
    await _wait();
    if (empty) return const HomeFeed(categories: [], bestSellers: [], partnerStores: []);
    return HomeFeed(
      banners: banners,
      categories: [for (final id in _homeCategories) categoryList.firstWhere((c) => c.id == id)],
      bestSellers: productList.take(4).toList(),
      partnerStores: vendors.take(3).toList(),
      storesPaused: storesPaused,
    );
  }

  @override
  Future<List<Category>> categories() async {
    await _wait();
    return empty ? const [] : categoryList;
  }

  static CatalogPage<T> _page<T>(List<T> all, String? cursor, int limit) {
    final start = int.tryParse(cursor ?? '') ?? 0;
    final end = (start + limit).clamp(0, all.length);
    return CatalogPage(all.sublist(start.clamp(0, all.length), end), end < all.length ? '$end' : null);
  }

  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) async {
    await _wait();
    final all = [
      if (!empty)
        for (final p in productList)
          if ((query.categoryId == null || p.categoryId == query.categoryId) &&
              (query.vendorId == null || p.vendorId == query.vendorId))
            p,
    ];
    if (query.sort != ProductSort.popular) {
      all.sort((a, b) => (a.minPriceHalalas ?? 0).compareTo(b.minPriceHalalas ?? 0));
      if (query.sort == ProductSort.priceDesc) all.setAll(0, all.reversed.toList());
    }
    return _page(all, cursor, limit);
  }

  @override
  Future<CatalogPage<Store>> stores({String? cursor, int limit = 20}) async {
    await _wait();
    return _page(empty ? const <Store>[] : vendors, cursor, limit);
  }

  @override
  Future<Store> store(String id) async {
    await _wait();
    return vendors.firstWhere((v) => v.id == id, orElse: () => throw const ApiError(code: 'NOT_FOUND'));
  }
}
