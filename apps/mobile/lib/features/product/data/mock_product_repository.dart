import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/data/product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Product details for USE_MOCKS and tests, for every product of [MockCatalogRepository] (same ids).
/// The ribeye of Al Falah (`p-falah-ribeye`) is the Figma product, option for option; the API-gap fields
/// (availability, per-size stock, rating, freshness, cut↔packaging rules) are filled.
class MockProductRepository implements ProductRepository {
  MockProductRepository({this.delay = const Duration(milliseconds: 400)});

  final Duration delay;

  static const _img = 'assets/images';
  static const _photos = ['ribeye-paper', 'steaks-dark', 'cuts', 'lamb-raw', 'butchers'];

  static const _meatCuts = [
    ProductOption(id: 'cut-whole', name: LocalizedText('قطعة كاملة', 'Whole piece')),
    ProductOption(id: 'cut-slices', name: LocalizedText('شرائح', 'Slices')),
    ProductOption(id: 'cut-cubes', name: LocalizedText('مكعبات', 'Cubes'), extraHalalas: 200),
    ProductOption(id: 'cut-mince', name: LocalizedText('مفروم', 'Minced'), extraHalalas: 200),
  ];
  static const _poultryCuts = [
    ProductOption(id: 'cut-whole', name: LocalizedText('كامل', 'Whole')),
    ProductOption(id: 'cut-quarters', name: LocalizedText('أرباع', 'Quarters')),
    ProductOption(id: 'cut-boneless', name: LocalizedText('مكعبات بدون عظم', 'Boneless cubes'), extraHalalas: 300),
  ];
  static const _carcassCuts = [
    ProductOption(id: 'cut-whole', name: LocalizedText('كاملة', 'Whole')),
    ProductOption(id: 'cut-fridge', name: LocalizedText('تقطيع ثلاجة', 'Fridge cut')),
    ProductOption(id: 'cut-hadrami', name: LocalizedText('تقطيع حضرمي', 'Hadrami cut'), extraHalalas: 2000),
    ProductOption(id: 'cut-joints', name: LocalizedText('مفصّل', 'Jointed'), extraHalalas: 3000),
  ];

  static const _bag = ProductOption(id: 'bags', name: LocalizedText('كيس عادي', 'Regular bag'));
  static const _vacuum = ProductOption(
    id: 'vacuum',
    name: LocalizedText('تغليف مفرغ', 'Vacuum packed'),
    extraHalalas: 500,
  );
  static const _gift = ProductOption(id: 'gift-box', name: LocalizedText('صندوق هدية', 'Gift box'), extraHalalas: 1500);
  static const _trays = ProductOption(id: 'trays', name: LocalizedText('أطباق', 'Trays'), extraHalalas: 1000);

  /// A gift box does not take slices or mince (Figma: "change the cut to whole or cubes").
  static const _meatRules = {
    'gift-box': {'cut-slices', 'cut-mince'},
  };

  static const _meatExclusions = [
    ProductOption(id: 'ex-fat', name: LocalizedText('بدون دهن', 'No fat')),
    ProductOption(id: 'ex-bone', name: LocalizedText('بدون عظم', 'No bone')),
    ProductOption(id: 'ex-sinew', name: LocalizedText('بدون عصب', 'No sinew')),
  ];
  static const _carcassExclusions = [
    ProductOption(id: 'ex-head', name: LocalizedText('بدون رأس', 'No head')),
    ProductOption(id: 'ex-tripe', name: LocalizedText('بدون كرشة', 'No tripe')),
    ProductOption(id: 'ex-trotters', name: LocalizedText('بدون مقادم', 'No trotters')),
  ];

  static const _descriptions = {
    'c-cattle': LocalizedText('بقري محلي · الوزن يُحدَّد بعد التقطيع', 'Local beef · weight set after cutting'),
    'c-sheep': LocalizedText('غنم محلي · الوزن يُحدَّد بعد التقطيع', 'Local lamb · weight set after cutting'),
    'c-camel': LocalizedText('إبل محلية · الوزن يُحدَّد بعد التقطيع', 'Local camel · weight set after cutting'),
    'c-poultry': LocalizedText('دواجن بلدية · تُذبح يوميًا', 'Local poultry · slaughtered daily'),
    'c-grills': LocalizedText('متبّل وجاهز للشوي', 'Marinated, ready to grill'),
    'c-feed': LocalizedText('علف طبيعي من مزارعنا', 'Natural feed from our farms'),
  };

  static const _carcasses = {'naimi-whole', 'harri-half', 'tais-whole'};

  /// A whole or half carcass (order type carcass for the scheduling mock); every other mock product is ready meat.
  static bool isCarcass(String productId) => _carcasses.contains(productId.split('-').skip(2).join('-'));

  static ProductDetail detail(ProductCard card) {
    final slug = card.id.split('-').skip(2).join('-');
    final p = card.minPriceHalalas ?? 0;
    final List<ProductSize> sizes;
    var cuts = const <ProductOption>[];
    var packagings = const <ProductOption>[];
    var exclusions = const <ProductOption>[];
    var rules = const <String, Set<String>>{};
    String? defaultSize;

    if (card.categoryId == 'c-feed') {
      sizes = [ProductSize(id: 'sz-unit', grams: slug == 'barley' ? 40000 : 20000, priceHalalas: p)];
    } else if (_carcasses.contains(slug)) {
      final whole = slug != 'harri-half';
      sizes = [
        ProductSize(id: 'sz-small', grams: whole ? 14000 : 7000, priceHalalas: p),
        ProductSize(
          id: 'sz-large',
          grams: whole ? 16000 : 8000,
          priceHalalas: p + (whole ? 15000 : 8000),
          tag: const LocalizedText('للولائم', 'For feasts'),
          // One sold-out size in the mock.
          available: whole,
        ),
      ];
      cuts = _carcassCuts;
      packagings = const [_bag, _trays];
      exclusions = _carcassExclusions;
    } else {
      sizes = [
        // The card price is the cheapest size (500 g); larger sizes cost a little less per kilo.
        ProductSize(id: 'sz-500g', grams: 500, priceHalalas: p),
        ProductSize(id: 'sz-1kg', grams: 1000, priceHalalas: 2 * (p - 500)),
        ProductSize(id: 'sz-2kg', grams: 2000, priceHalalas: 4 * (p - 500) - 600),
      ];
      defaultSize = 'sz-1kg';
      if (card.categoryId == 'c-grills') {
        // Marinated: no cut to choose.
        packagings = const [_bag, _vacuum];
      } else {
        final poultry = card.categoryId == 'c-poultry';
        cuts = poultry ? _poultryCuts : _meatCuts;
        packagings = poultry ? const [_bag, _vacuum] : const [_bag, _vacuum, _gift];
        rules = poultry ? const {} : _meatRules;
        exclusions = poultry
            ? const [ProductOption(id: 'ex-skin', name: LocalizedText('بدون جلد', 'No skin'))]
            : _meatExclusions;
      }
    }

    final cover = card.coverUrl;
    return ProductDetail(
      id: card.id,
      vendorId: card.vendorId,
      vendorName: card.vendorName,
      name: card.name,
      description: _descriptions[card.categoryId],
      images: cover == null
          ? const []
          : [
              cover,
              for (final ph in _photos)
                if ('$_img/$ph.jpg' != cover) '$_img/$ph.jpg',
            ].take(4).toList(),
      sizes: sizes,
      cuts: cuts,
      packagings: packagings,
      exclusions: exclusions,
      available: card.isAvailable,
      fulfilment: MockCatalogRepository.vendors.where((v) => v.id == card.vendorId).firstOrNull?.pickup ?? false
          ? Fulfilment.both
          : Fulfilment.delivery,
      vendorRating: MockCatalogRepository.vendors.where((v) => v.id == card.vendorId).firstOrNull?.rating,
      slaughteredAt: card.freshToday ? 6 * 60 + 30 : null,
      deliveredWithinHours: card.freshToday ? 3 : null,
      defaultSizeId: defaultSize,
      incompatible: rules,
    );
  }

  @override
  Future<ProductDetail> product(String id) async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
    final card = MockCatalogRepository.productList.where((p) => p.id == id).firstOrNull;
    if (card == null) throw const ApiError(code: 'NOT_FOUND');
    return detail(card);
  }
}
