import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/domain/price.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// The shared cases of the one line price (docs/frontend/fixtures/pricing-cases.json), read as is: the API's
/// `priceLine` runs the same file, so the app's price function can never drift from it.
void main() {
  final file = File('../../docs/frontend/fixtures/pricing-cases.json');
  final fixture = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
  const name = LocalizedText('', '');

  ProductDetail product(Map<String, dynamic> p) => ProductDetail(
    id: 'p',
    vendorId: 'v',
    name: name,
    available: p['isAvailable'] as bool,
    sizes: [
      for (final s in (p['sizes'] as List).cast<Map<String, dynamic>>())
        ProductSize(
          id: s['id'] as String,
          grams: 0,
          priceHalalas: s['priceHalalas'] as int,
          available: s['isAvailable'] as bool,
        ),
    ],
    cuts: [
      for (final c in (p['cuttings'] as List).cast<Map<String, dynamic>>())
        ProductOption(id: c['cuttingStyleId'] as String, name: name, extraHalalas: c['extraPriceHalalas'] as int),
    ],
    packagings: [
      for (final c in (p['packagings'] as List).cast<Map<String, dynamic>>())
        ProductOption(id: c['packaging'] as String, name: name, extraHalalas: c['extraPriceHalalas'] as int),
    ],
    exclusions: [
      for (final e in (p['exclusions'] as List).cast<Map<String, dynamic>>())
        ProductOption(id: e['id'] as String, name: name),
    ],
    incompatible: incompatibleFrom([
      for (final i in (p['incompatiblePairs'] as List).cast<Map<String, dynamic>>())
        (i['cuttingStyleId'] as String, i['packaging'] as String),
    ]),
  );

  final products = {
    for (final MapEntry(:key, :value) in (fixture['products'] as Map<String, dynamic>).entries)
      key: product(value as Map<String, dynamic>),
  };
  final cases = (fixture['cases'] as List).cast<Map<String, dynamic>>();

  test('the fixture has its 27 cases', () => expect(cases, hasLength(27)));

  for (final c in cases) {
    test(c['name'] as String, () {
      final s = c['selection'] as Map<String, dynamic>;
      final line = priceLine(
        products[c['product']]!,
        ProductSelection(
          sizeId: s['sizeId'] as String?,
          cutId: s['cuttingStyleId'] as String?,
          packagingId: s['packaging'] as String?,
          exclusionIds: {...(s['exclusionItemIds'] as List).cast<String>()},
          quantity: s['quantity'] as int,
        ),
      );
      final e = c['expected'] as Map<String, dynamic>;
      expect(line.errors, e['errors']);
      expect(line.unitPrice, e['unitPriceHalalas']);
      expect(line.lineTotal, e['lineTotalHalalas']);
      expect([
        for (final b in line.breakdown)
          {
            'kind': switch (b.kind) {
              PriceKind.size => 'size',
              PriceKind.cut => 'cutting',
              PriceKind.packaging => 'packaging',
            },
            'optionId': b.optionId,
            'halalas': b.halalas,
          },
      ], e['breakdown']);
    });
  }
}
