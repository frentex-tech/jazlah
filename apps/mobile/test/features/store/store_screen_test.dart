import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/store/presentation/store_screen.dart';

import '../../helpers/catalog_fakes.dart';
import '../../helpers/pump_screen.dart';

class _NoProducts extends FakeCatalog {
  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) async =>
      const CatalogPage([], null);
}

Future<void> _pump(WidgetTester t, FakeCatalog repo, {String id = 'v-falah', String? name}) async {
  await t.pumpScreen(
    StoreScreen(id: id, name: name),
    overrides: catalogOverrides(repo),
  );
  await t.pump();
  await t.pump();
}

void main() {
  testWidgets('open store: rating, hours, delivery, minimum order, its own products only', (t) async {
    await _pump(t, FakeCatalog());
    expect(find.text('4.8 (320 تقييم)'), findsOneWidget);
    expect(find.text('مفتوح حتى 11:00 م'), findsOneWidget);
    expect(find.text('توصيل خلال 35 دقيقة'), findsOneWidget);
    expect(find.text('الحد الأدنى للطلب 50.00 ر.س'), findsOneWidget);
    expect(find.widgetWithText(JBadge, 'استلام من المتجر'), findsOneWidget);
    expect(find.text('ف'), findsOneWidget); // monogram
    final cards = t.widgetList<JProductCard>(find.byType(JProductCard));
    expect(cards, isNotEmpty);
    expect(cards.every((c) => c.vendor == 'مجازر الفلاح' && c.available), isTrue);
  });

  testWidgets('category chips list what the store sells and filter the grid', (t) async {
    await _pump(t, FakeCatalog(), id: 'v-waha');
    expect(find.widgetWithText(JChip, 'الكل'), findsOneWidget);
    final chips = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.left);
    await t.scrollUntilVisible(find.text('الأعلاف'), 100, scrollable: chips);
    // Only what this store sells: no chip for a category it has no product in.
    expect(find.text('الأضاحي', skipOffstage: false), findsNothing);
    await t.drag(chips, const Offset(150, 0)); // the last chip fully in view (RTL scrolls rightwards)
    await t.pumpAndSettle();
    await t.tap(find.text('الأعلاف'));
    await t.pump();
    await t.pump();
    expect(find.text('برسيم حجازي'), findsOneWidget);
    expect(find.text('صدر دجاج بلدي'), findsNothing);
  });

  testWidgets('closed store: badge, notice, every product unavailable', (t) async {
    await _pump(t, FakeCatalog(), id: 'v-deera');
    expect(find.text('مغلق الآن'), findsOneWidget);
    expect(find.text('المتجر مغلق الآن ويفتح غدًا 8:00 ص. يمكنك تصفّح المنتجات والطلب عند فتحه.'), findsOneWidget);
    final cards = t.widgetList<JProductCard>(find.byType(JProductCard));
    expect(cards.every((c) => !c.available), isTrue);
    expect(find.text('غير متاح حاليًا'), findsWidgets);
  });

  testWidgets('loading keeps the title the caller passed', (t) async {
    await _pump(t, FakeCatalog(mode: Mode.hang), name: 'مجازر الفلاح');
    expect(find.text('مجازر الفلاح'), findsOneWidget);
    expect(find.byType(JSkeletonRow), findsOneWidget);
  });

  testWidgets('no products: browse other stores', (t) async {
    await _pump(t, _NoProducts());
    expect(find.text('لا توجد منتجات حاليًا'), findsOneWidget);
    expect(find.byType(JChip), findsNothing);
    await t.tap(find.text('تصفّح المتاجر'));
    await t.pumpAndSettle();
    expect(find.text('route:${Routes.stores}'), findsOneWidget);
  });

  testWidgets('no pickup badge for a delivery-only store; the bag opens the cart', (t) async {
    await _pump(t, FakeCatalog(), id: 'v-waha');
    expect(find.widgetWithText(JBadge, 'استلام من المتجر'), findsNothing);
    await t.tap(find.bySemanticsLabel('السلة'));
    await t.pumpAndSettle();
    expect(find.text('route:${Routes.cart}'), findsOneWidget);
  });

  testWidgets('error offers retry', (t) async {
    final repo = FakeCatalog(mode: Mode.error);
    await _pump(t, repo);
    expect(find.text('تعذّر تحميل المتجر'), findsOneWidget);
    repo.mode = Mode.ok;
    await t.tap(find.text('إعادة المحاولة'));
    await t.pump();
    await t.pump();
    expect(find.text('4.8 (320 تقييم)'), findsOneWidget);
  });

  testWidgets('the store name opens the info sheet: hours, city, pickup', (t) async {
    await _pump(t, FakeCatalog());
    await t.tap(find.text('4.8 (320 تقييم)'));
    await t.pumpAndSettle();
    expect(find.text('معلومات المتجر'), findsOneWidget);
    expect(find.text('8:00 ص – 11:00 م'), findsOneWidget);
    expect(find.text('الرياض'), findsOneWidget);
    expect(find.text('متاح'), findsOneWidget);
  });

  testWidgets('a product opens its page', (t) async {
    await _pump(t, FakeCatalog());
    await t.tap(find.text('ريب آي بقري طازج'));
    await t.pumpAndSettle();
    expect(find.text('route:/product/p-falah-ribeye'), findsOneWidget);
  });
}
