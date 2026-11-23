import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:jazlah/features/product/presentation/product_screen.dart';

import 'harness.dart';

/// mode: ok, hang, error, soldout (the ribeye out of stock).
class _Repo extends MockProductRepository {
  _Repo([this.mode = 'ok']) : super(delay: Duration.zero);

  final String mode;

  @override
  Future<ProductDetail> product(String id) => switch (mode) {
    'hang' => hang<ProductDetail>(),
    'error' => Future.error(const ApiError(code: 'UNKNOWN')),
    'soldout' => Future.value(MockProductRepository.detail(_soldOut(id))),
    _ => super.product(id),
  };
}

ProductCard _soldOut(String id) {
  final c = MockCatalogRepository.productList.firstWhere((p) => p.id == id);
  return ProductCard(
    id: c.id,
    vendorId: c.vendorId,
    vendorName: c.vendorName,
    name: c.name,
    categoryId: c.categoryId,
    isAvailable: false,
    minPriceHalalas: c.minPriceHalalas,
    coverUrl: c.coverUrl,
    freshToday: c.freshToday,
  );
}

List<dynamic> _o([String mode = 'ok']) => [productRepositoryProvider.overrideWithValue(_Repo(mode))];

/// The page's own scroll view (the notes field has one too).
final Finder _page = find.descendant(of: find.byType(SingleChildScrollView), matching: find.byType(Scrollable)).first;

const _ribeye = ProductScreen(id: 'p-falah-ribeye');

/// The Figma choices: sliced, vacuum packed.
Future<void> _choose(WidgetTester t) async {
  for (final label in ['شرائح', 'تغليف مفرغ']) {
    await t.scrollUntilVisible(find.text(label), 200, scrollable: _page);
    await t.tap(find.text(label));
    await t.pump();
  }
}

Future<void> _top(WidgetTester t) async {
  await t.drag(find.byType(SingleChildScrollView), const Offset(0, 5000));
  await t.pump(const Duration(seconds: 1));
}

void main() {
  setUpAll(loadFonts);

  testWidgets('product', (t) async {
    await shoot(
      t,
      '118-8735',
      _ribeye,
      overrides: _o(),
      act: (t) async {
        await _choose(t);
        await _top(t);
      },
    );
    await shoot(
      t,
      '118-8897',
      _ribeye,
      overrides: _o(),
      height: 1895,
      act: (t) async {
        await _choose(t);
        await t.tap(find.text('بدون دهن'));
        await _top(t);
      },
    );
    await shoot(
      t,
      '118-9059',
      _ribeye,
      overrides: _o(),
      act: (t) async {
        await _choose(t);
        await _top(t);
        await t.tap(find.text('الإجمالي'));
        await t.pump(const Duration(seconds: 1));
      },
    );
    await shoot(
      t,
      '118-9254',
      _ribeye,
      overrides: _o(),
      act: (t) async {
        await _choose(t);
        await t.tap(find.text('صندوق هدية'));
        await t.pump();
        await _top(t);
        await t.drag(find.byType(SingleChildScrollView), const Offset(0, -643));
        await t.pump(const Duration(seconds: 1));
      },
    );
    await shoot(t, '118-9496', _ribeye, overrides: _o('hang'));
    await shoot(t, '118-9350', _ribeye, overrides: _o('soldout'));
    await shoot(t, '118-9545', _ribeye, overrides: _o('error'));
    await shoot(
      t,
      '118-9573',
      _ribeye,
      overrides: _o(),
      act: (t) async {
        await t.tap(find.text('أضف إلى السلة'));
        await t.pump(const Duration(seconds: 1));
      },
    );
    await shoot(t, 'en-118-8735', _ribeye, overrides: _o(), lang: 'en');
  });
}
