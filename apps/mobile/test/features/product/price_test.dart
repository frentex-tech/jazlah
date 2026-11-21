import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/price.dart';
import 'package:jazlah/features/product/domain/product.dart';

ProductDetail _seeded(String id) =>
    MockProductRepository.detail(MockCatalogRepository.productList.firstWhere((p) => p.id == id));

void main() {
  final ribeye = _seeded('p-falah-ribeye');
  final carcass = _seeded('p-falah-naimi-whole');
  final half = _seeded('p-falah-harri-half');
  final poultry = _seeded('p-waha-chicken-breast');
  final kebab = _seeded('p-falah-lamb-kebab');
  final feed = _seeded('p-waha-barley');
  final soldOut = _seeded('p-nukhba-hashi-hump');

  // (name, product, selection, unit, line): the seeded combinations, exact halalas.
  final priced = <(String, ProductDetail, ProductSelection, int, int)>[
    ('ribeye 1 kg only', ribeye, const ProductSelection(sizeId: 'sz-1kg'), 8900, 8900),
    ('ribeye 500 g only', ribeye, const ProductSelection(sizeId: 'sz-500g'), 4950, 4950),
    ('ribeye 2 kg only', ribeye, const ProductSelection(sizeId: 'sz-2kg'), 17200, 17200),
    ('free cut', ribeye, const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-slices'), 8900, 8900),
    ('paid cut', ribeye, const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-cubes'), 9100, 9100),
    ('paid packaging', ribeye, const ProductSelection(sizeId: 'sz-1kg', packagingId: 'vacuum'), 9400, 9400),
    (
      'Figma: sliced, vacuum',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-slices', packagingId: 'vacuum'),
      9400,
      9400,
    ),
    (
      'paid cut and paid packaging',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-cubes', packagingId: 'gift-box'),
      10600,
      10600,
    ),
    (
      'quantity 3',
      ribeye,
      const ProductSelection(sizeId: 'sz-2kg', cutId: 'cut-mince', packagingId: 'vacuum', quantity: 3),
      17900,
      53700,
    ),
    (
      'exclusions are free',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-whole', exclusionIds: {'ex-fat', 'ex-bone', 'ex-sinew'}),
      8900,
      8900,
    ),
    (
      'carcass, Hadrami cut, trays, x2',
      carcass,
      const ProductSelection(sizeId: 'sz-large', cutId: 'cut-hadrami', packagingId: 'trays', quantity: 2),
      165000 + 15000 + 2000 + 1000,
      2 * 183000,
    ),
    (
      'poultry boneless',
      poultry,
      const ProductSelection(sizeId: 'sz-500g', cutId: 'cut-boneless', exclusionIds: {'ex-skin'}),
      2400 + 300,
      2700,
    ),
    ('grill without a cut', kebab, const ProductSelection(sizeId: 'sz-1kg', packagingId: 'vacuum'), 6700, 6700),
    ('feed, one size', feed, const ProductSelection(sizeId: 'sz-unit', quantity: 4), 6000, 24000),
  ];

  group('priceLine prices', () {
    for (final (name, p, s, unit, line) in priced) {
      test(name, () {
        final r = priceLine(p, s);
        // A product with cuts and none chosen still prices what is chosen, flagged OPTION_REQUIRED.
        expect(r.errors, p.cuts.isNotEmpty && s.cutId == null ? [PriceError.optionRequired] : isEmpty);
        expect(r.unitPrice, unit);
        expect(r.lineTotal, line);
        expect(r.breakdown.fold(0, (sum, c) => sum + c.halalas), unit);
      });
    }

    test('breakdown is size, cut, packaging', () {
      final r = priceLine(
        ribeye,
        const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-slices', packagingId: 'vacuum'),
      );
      expect(
        [for (final c in r.breakdown) (c.kind, c.optionId, c.halalas)],
        [
          (PriceKind.size, 'sz-1kg', 8900),
          (PriceKind.cut, 'cut-slices', 0),
          (PriceKind.packaging, 'vacuum', 500),
        ],
      );
    });
  });

  // (name, product, selection, error codes)
  final refused = <(String, ProductDetail, ProductSelection, List<String>)>[
    (
      'gift box with slices',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-slices', packagingId: 'gift-box'),
      [PriceError.cutPackagingIncompatible],
    ),
    (
      'gift box with mince',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-mince', packagingId: 'gift-box'),
      [PriceError.cutPackagingIncompatible],
    ),
    ('sold-out size', half, const ProductSelection(sizeId: 'sz-large'), [PriceError.sizeUnavailable]),
    ('product out of stock', soldOut, const ProductSelection(sizeId: 'sz-1kg'), [PriceError.productUnavailable]),
    ('unknown size', ribeye, const ProductSelection(sizeId: 'sz-9kg'), [PriceError.optionNotInProduct]),
    ('no size', ribeye, const ProductSelection(), [PriceError.optionNotInProduct]),
    (
      'cut of another product',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-hadrami'),
      [PriceError.optionNotInProduct],
    ),
    (
      'packaging not offered',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', packagingId: 'trays'),
      [PriceError.optionNotInProduct],
    ),
    (
      'exclusion not offered',
      ribeye,
      const ProductSelection(sizeId: 'sz-1kg', exclusionIds: {'ex-head'}),
      [PriceError.optionNotInProduct],
    ),
    (
      'cut on a product without cuts',
      feed,
      const ProductSelection(sizeId: 'sz-unit', cutId: 'cut-whole'),
      [
        PriceError.optionNotInProduct,
      ],
    ),
  ];

  group('priceLine refuses', () {
    for (final (name, p, s, codes) in refused) {
      test(name, () {
        final r = priceLine(p, s);
        expect(r.errors, codes);
        expect(r.ok, isFalse);
        expect((r.unitPrice, r.lineTotal, r.breakdown.length), (0, 0, 0));
      });
    }
  });

  test('a product with cuts needs one: OPTION_REQUIRED keeps the price, a cut clears it', () {
    final none = priceLine(ribeye, const ProductSelection(sizeId: 'sz-1kg'));
    expect(none.errors, [PriceError.optionRequired]);
    expect((none.ok, none.onlyMissingChoice, none.lineTotal), (false, true, 8900));
    expect(priceLine(ribeye, const ProductSelection(sizeId: 'sz-1kg', cutId: 'cut-whole')).ok, isTrue);
    expect(priceLine(feed, const ProductSelection(sizeId: 'sz-unit')).ok, isTrue); // no cuts, none needed
    // Another error wins: the line is refused and priced 0.
    final sold = priceLine(soldOut, const ProductSelection(sizeId: 'sz-1kg'));
    expect((sold.onlyMissingChoice, sold.lineTotal), (false, 0));
  });

  test(
    'error codes are the API names',
    () => expect(PriceError.cutPackagingIncompatible, 'INCOMPATIBLE_CUTTING_PACKAGING'),
  );

  test('every seeded card shows its cheapest size', () {
    for (final card in MockCatalogRepository.productList) {
      final sizes = MockProductRepository.detail(card).sizes.map((z) => z.priceHalalas);
      expect(card.minPriceHalalas, sizes.reduce((a, b) => a < b ? a : b), reason: card.id);
    }
  });

  group('selection', () {
    test('opens on the default size, nothing else picked', () {
      final s = ProductSelection.initial(ribeye);
      expect((s.sizeId, s.cutId, s.packagingId, s.quantity), ('sz-1kg', null, null, 1));
    });

    test('skips a sold-out size', () {
      expect(ProductSelection.initial(half).sizeId, 'sz-small');
    });

    test('an incompatible packaging cannot be chosen', () {
      final s = const ProductSelection(sizeId: 'sz-1kg').withCut(ribeye, 'cut-slices');
      expect(s.withPackaging(ribeye, 'gift-box').packagingId, isNull);
      expect(s.withPackaging(ribeye, 'vacuum').packagingId, 'vacuum');
    });

    test('a cut that does not take the packaging clears it', () {
      final s = const ProductSelection(sizeId: 'sz-1kg').withCut(ribeye, 'cut-cubes').withPackaging(ribeye, 'gift-box');
      expect(s.packagingId, 'gift-box');
      expect(s.withCut(ribeye, 'cut-slices').packagingId, isNull);
      expect(s.withCut(ribeye, 'cut-whole').packagingId, 'gift-box');
    });

    test('quantity stays within 1..99', () {
      const s = ProductSelection(sizeId: 'sz-1kg');
      expect(s.withQuantity(0).quantity, 1);
      expect(s.withQuantity(150).quantity, 99);
    });
  });
}
