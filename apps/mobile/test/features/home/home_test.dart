import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/home/presentation/categories_screen.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/store/presentation/category_screen.dart';

import '../../helpers/catalog_fakes.dart';
import '../../helpers/pump_screen.dart';

class _TinyPages extends FakeCatalog {
  @override
  Future<CatalogPage<ProductCard>> products(ProductQuery query, {String? cursor, int limit = 20}) =>
      super.products(query, cursor: cursor, limit: 2);
}

const _home = MainShell(location: Routes.home, child: HomeScreen());

Future<void> _pumpHome(WidgetTester t, FakeCatalog repo) async {
  await t.pumpScreen(_home, overrides: catalogOverrides(repo));
  await t.pump(const Duration(seconds: 1));
  await t.pump(const Duration(seconds: 1));
}

final Finder _vertical = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.down).first;

Finder _all(String section) =>
    find.descendant(of: find.widgetWithText(JSectionHeader, section), matching: find.text('الكل'));

Future<void> _scrollTo(WidgetTester t, Finder f) => t.scrollUntilVisible(f, 200, scrollable: _vertical);

void main() {
  group('home states', () {
    testWidgets('default: banners, categories, best sellers with vendor names, partner stores', (t) async {
      await _pumpHome(t, FakeCatalog());
      expect(find.text('اطلب واجمع نقاط الولاء'), findsOneWidget);
      expect(find.text('الأقسام'), findsOneWidget);
      expect(find.text('الأغنام'), findsOneWidget);
      await _scrollTo(t, find.text('ريب آي بقري طازج'));
      expect(find.text('مجازر الفلاح'), findsWidgets); // vendor on the card
      expect(find.text('49.50'), findsOneWidget);
      expect(find.text('ذُبح اليوم'), findsWidgets);
      await _scrollTo(t, find.text('متاجر شريكة'));
      expect(find.byType(JStoreCard), findsNWidgets(3));
    });

    testWidgets('loading shows the skeleton and the search bar', (t) async {
      await _pumpHome(t, FakeCatalog(mode: Mode.hang));
      expect(find.byType(JSearchBar), findsOneWidget);
      expect(find.text('الأقسام'), findsNothing);
      expect(find.byType(JProductCard), findsNothing);
    });

    testWidgets('error offers retry, which reloads', (t) async {
      final repo = FakeCatalog(mode: Mode.error);
      await _pumpHome(t, repo);
      expect(find.text('تعذّر تحميل الصفحة الرئيسية'), findsOneWidget);
      repo.mode = Mode.ok;
      await t.tap(find.text('إعادة المحاولة'));
      await t.pump(const Duration(seconds: 1));
      await t.pump(const Duration(seconds: 1));
      expect(find.text('الأقسام'), findsOneWidget);
    });

    testWidgets('offline has its own panel', (t) async {
      await _pumpHome(t, FakeCatalog(mode: Mode.offline));
      expect(find.text('لا يوجد اتصال بالإنترنت'), findsOneWidget);
      expect(find.text('إعادة المحاولة'), findsOneWidget);
    });

    testWidgets('no stores in the area: "change address" opens the location picker', (t) async {
      await _pumpHome(t, FakeCatalog(empty: true));
      expect(find.text('لا توجد متاجر في منطقتك بعد'), findsOneWidget);
      await t.tap(find.text('تغيير العنوان'));
      await t.pumpAndSettle();
      expect(find.text('route:${Routes.pickLocation}'), findsOneWidget);
    });

    testWidgets('stores paused: the notice sits above the search bar, browsing stays', (t) async {
      await _pumpHome(t, FakeCatalog(storesPaused: true));
      expect(find.text('المتاجر القريبة منك متوقفة مؤقتًا. تصفّح الآن واطلب عند عودتها.'), findsOneWidget);
      expect(find.text('الأقسام'), findsOneWidget);
    });

    testWidgets('pull to refresh reloads the feed', (t) async {
      final repo = FakeCatalog(mode: Mode.error);
      await _pumpHome(t, repo);
      repo.mode = Mode.ok;
      await t.fling(_vertical, const Offset(0, 400), 1000);
      await t.pumpAndSettle();
      expect(find.text('الأقسام'), findsOneWidget);
    });
  });

  testWidgets('a new address reloads the feed', (t) async {
    final repo = FakeCatalog();
    await t.pumpScreen(_home, overrides: catalogOverrides(repo));
    await t.pump(const Duration(seconds: 1));
    expect(repo.homeCalls, 1);
    final c = ProviderScope.containerOf(t.element(find.byType(HomeScreen)));
    await c
        .read(selectedLocationProvider.notifier)
        .select(const SelectedLocation(point: GeoPoint(21.5, 39.2), line: 'جدة', covered: true));
    await t.pump(const Duration(seconds: 1));
    expect(repo.homeCalls, 2);
  });

  testWidgets('partner store cards fit a 320 wide phone', (t) async {
    await _pumpHome(t, FakeCatalog());
    t.view.physicalSize = const Size(320, 844);
    await t.pump();
    await _scrollTo(t, find.text('متاجر شريكة'));
    expect(find.byType(JStoreCard), findsNWidgets(3));
    expect(t.takeException(), isNull);
  });

  group('home routing', () {
    Future<void> tapAndExpect(WidgetTester t, Finder f, String route) async {
      await _pumpHome(t, FakeCatalog());
      await _scrollTo(t, f);
      await t.tap(f);
      await t.pumpAndSettle();
      expect(find.text('route:$route'), findsOneWidget);
    }

    testWidgets(
      'bell → notifications',
      (t) => tapAndExpect(t, find.bySemanticsLabel('الإشعارات'), Routes.notifications),
    );
    testWidgets('bag → cart', (t) => tapAndExpect(t, find.bySemanticsLabel('السلة'), Routes.cart));
    testWidgets('search bar → search', (t) => tapAndExpect(t, find.byType(JSearchBar), Routes.search));
    testWidgets('category tile → its category', (t) => tapAndExpect(t, find.text('الإبل'), '/home/category/c-camel'));
    testWidgets(
      'product → its page',
      (t) => tapAndExpect(t, find.text('كبدة غنم طازجة'), '/product/p-nukhba-lamb-liver'),
    );
    testWidgets('add button → the product (a size is chosen there)', (t) async {
      await _pumpHome(t, FakeCatalog());
      await _scrollTo(t, find.text('متاجر شريكة'));
      await t.tap(find.byIcon(JIcons.plus).first);
      await t.pumpAndSettle();
      expect(find.text('route:/product/p-falah-ribeye'), findsOneWidget);
    });
    testWidgets(
      'store card → its page',
      (t) => tapAndExpect(t, find.widgetWithText(JStoreCard, 'مزارع الواحة'), '/home/store/v-waha'),
    );
    testWidgets('categories "all" → categories', (t) => tapAndExpect(t, _all('الأقسام'), Routes.categories));
    testWidgets('best sellers "all" → search', (t) => tapAndExpect(t, _all('الأكثر مبيعًا'), Routes.search));
    testWidgets('stores "all" → stores', (t) => tapAndExpect(t, _all('متاجر شريكة'), Routes.stores));
  });

  group('categories screen', () {
    Future<void> pump(WidgetTester t, FakeCatalog repo) async {
      await t.pumpScreen(
        const MainShell(location: Routes.categories, child: CategoriesScreen()),
        overrides: catalogOverrides(repo),
      );
      await t.pump(const Duration(seconds: 1));
    }

    testWidgets('lists every category; a tap opens it', (t) async {
      await pump(t, FakeCatalog());
      expect(find.byType(JCategoryTile), findsNWidgets(13));
      expect(find.text('أقسام قادمة'), findsOneWidget);
      await t.tap(find.text('الدواجن'));
      await t.pumpAndSettle();
      expect(find.text('route:/home/category/c-poultry'), findsOneWidget);
    });

    testWidgets('loading', (t) async {
      await pump(t, FakeCatalog(mode: Mode.hang));
      expect(find.byType(JCategoryTile), findsNothing);
      expect(find.text('الأقسام'), findsOneWidget); // the header only
    });

    testWidgets('empty goes back home', (t) async {
      await pump(t, FakeCatalog(empty: true));
      expect(find.text('لا توجد أقسام متاحة'), findsOneWidget);
      await t.tap(find.text('العودة للرئيسية'));
      await t.pumpAndSettle();
      expect(find.text('route:${Routes.home}'), findsOneWidget);
    });

    testWidgets('error', (t) async {
      await pump(t, FakeCatalog(mode: Mode.error));
      expect(find.text('تعذّر تحميل الأقسام'), findsOneWidget);
    });
  });

  group('category page', () {
    Future<void> pump(WidgetTester t, FakeCatalog repo, {String id = 'c-sheep'}) async {
      await t.pumpScreen(
        MainShell(
          location: '/home/category/$id',
          child: CategoryScreen(id: id),
        ),
        overrides: catalogOverrides(repo),
      );
      await t.pump(const Duration(seconds: 1));
      await t.pump(const Duration(seconds: 1));
    }

    testWidgets('scrolling to the end loads the next page, without duplicates', (t) async {
      final repo = FakeCatalog();
      await pump(t, repo); // 21 sheep products: two pages
      expect(repo.productCursors, [null]);
      // Scroll the whole grid, noting every card once (title, vendor and price tell them apart).
      final seen = <String>{};
      for (var i = 0; i < 40; i++) {
        for (final c in t.widgetList<JProductCard>(find.byType(JProductCard))) {
          seen.add('${c.title}|${c.vendor}|${c.price}');
        }
        await t.drag(_vertical, const Offset(0, -300));
        await t.pump(const Duration(seconds: 1));
      }
      expect(seen.length, 21);
      expect(repo.productCursors, [null, '20']); // the last page was not asked again
    });

    testWidgets('a first page too short to scroll loads the next one by itself', (t) async {
      final repo = _TinyPages();
      await pump(t, repo, id: 'c-camel'); // 6 camel products, 2 per page
      await t.pump(const Duration(seconds: 1));
      await t.pump(const Duration(seconds: 1));
      expect(repo.productCursors.first, isNull);
      expect(repo.productCursors.length, greaterThan(1));
      expect(repo.productCursors.toSet().length, repo.productCursors.length); // each page once
    });

    testWidgets('sort chips re-query the list', (t) async {
      final repo = FakeCatalog();
      await pump(t, repo);
      expect(find.text('الأكثر مبيعًا'), findsOneWidget);
      final desc = find.text('الأعلى سعرًا', skipOffstage: false);
      await t.ensureVisible(desc);
      await t.pump();
      await t.tap(desc);
      await t.pump(const Duration(seconds: 1));
      await t.pump(const Duration(seconds: 1));
      expect(t.widget<JProductCard>(find.byType(JProductCard).first).price, '1,655.00');
    });

    testWidgets('no sort control when the API cannot sort', (t) async {
      await pump(t, FakeCatalog(sortable: false));
      expect(find.text('الأكثر مبيعًا', skipOffstage: false), findsNothing);
      expect(find.byType(JProductCard), findsWidgets);
    });

    testWidgets('the title the caller passed shows while categories load', (t) async {
      await t.pumpScreen(
        const MainShell(
          location: '/home/category/c-sheep',
          child: CategoryScreen(id: 'c-sheep', name: 'الأغنام'),
        ),
        overrides: catalogOverrides(FakeCatalog(mode: Mode.hang)),
      );
      await t.pump(const Duration(seconds: 1));
      expect(find.text('الأغنام'), findsOneWidget);
    });

    testWidgets('empty', (t) async {
      await pump(t, FakeCatalog(), id: 'c-fish');
      expect(find.text('لا توجد منتجات في هذا القسم بعد'), findsOneWidget);
    });

    testWidgets('error', (t) async {
      await pump(t, FakeCatalog(productsMode: Mode.error));
      expect(find.text('تعذّر تحميل المنتجات'), findsOneWidget);
    });
  });
}
