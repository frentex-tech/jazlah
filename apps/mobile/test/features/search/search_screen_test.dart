import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/search/domain/search.dart';
import 'package:jazlah/features/search/presentation/search_providers.dart';
import 'package:jazlah/features/search/presentation/search_screen.dart';

import '../../helpers/catalog_fakes.dart';
import '../../helpers/pump_screen.dart';
import '../../helpers/search_fakes.dart';

const _figma = SearchQuery(text: 'ريب آي', maxPriceHalalas: 10000, availableOnly: true);

Future<void> _pump(
  WidgetTester t,
  FakeSearch repo, {
  SearchScreen screen = const SearchScreen(),
  Map<String, Object> prefs = const {'locale': 'ar', 'onboardingSeen': true},
}) async {
  await t.pumpScreen(
    screen,
    overrides: [...catalogOverrides(FakeCatalog()), searchRepositoryProvider.overrideWithValue(repo)],
    prefs: prefs,
    routes: [
      GoRoute(
        path: '/product/:id',
        builder: (_, s) => Scaffold(body: Text('product ${s.pathParameters['id']}')),
      ),
    ],
  );
  await _settle(t);
}

/// Lets the chained futures (page, then count) land.
Future<void> _settle(WidgetTester t) async {
  for (var i = 0; i < 5; i++) {
    await t.pump();
  }
}

Finder _chip(String label) => find.widgetWithText(JChip, label);

void main() {
  testWidgets('start: recent searches with clear, most searched; a tap searches', (t) async {
    await _pump(
      t,
      FakeSearch(),
      prefs: {
        'locale': 'ar',
        'onboardingSeen': true,
        'recentSearches': ['ريب آي', 'كبدة غنم'],
      },
    );
    expect(find.text('عمليات البحث الأخيرة'), findsOneWidget);
    expect(_chip('ريب آي'), findsOneWidget);
    expect(_chip('كبدة غنم'), findsOneWidget);
    expect(find.text('الأكثر بحثًا'), findsOneWidget);
    expect(find.text('لحم غنم نعيمي'), findsOneWidget);

    await t.tap(find.text('مسح'));
    await t.pump();
    expect(find.text('عمليات البحث الأخيرة'), findsNothing);

    await t.tap(find.text('صدر دجاج بلدي'));
    await _settle(t);
    expect(find.text('3 نتائج لـ «صدر دجاج بلدي»'), findsOneWidget);
    expect(find.byType(JProductCard), findsNWidgets(3));
  });

  testWidgets('typing: skeleton rows, then results after the pause; clearing returns to the start', (t) async {
    final repo = FakeSearch();
    await _pump(t, repo);
    await t.enterText(find.byType(TextField), 'نعيمى');
    await t.pump();
    expect(find.byType(JSkeletonRow), findsNWidgets(4));
    expect(repo.queries, isEmpty);
    await t.pump(const Duration(milliseconds: 400));
    await t.pump();
    expect(repo.queries.single.text, 'نعيمى');
    expect(find.text('لحم غنم نعيمي مفروم'), findsWidgets); // the spelling variant still finds it
    expect(find.text('تصفية'), findsOneWidget);

    await t.tap(find.byIcon(JIcons.x));
    await _settle(t);
    expect(find.text('الأكثر بحثًا'), findsOneWidget);
  });

  testWidgets('results: count, filter button with the active count, active filter chips', (t) async {
    await _pump(t, FakeSearch(), screen: const SearchScreen(initial: _figma));
    expect(find.text('3 نتائج لـ «ريب آي»'), findsOneWidget);
    expect(find.text('تصفية (2)'), findsOneWidget);
    expect(_chip('حتى 100 ر.س'), findsOneWidget);
    expect(_chip('المتاح الآن'), findsOneWidget);
    final cards = t.widgetList<JProductCard>(find.byType(JProductCard));
    expect(cards.map((c) => c.vendor), containsAll(['مجازر الفلاح', 'ملحمة النخبة']));
  });

  testWidgets('results loading: card skeletons', (t) async {
    await _pump(
      t,
      FakeSearch(mode: Mode.hang),
      screen: const SearchScreen(initial: _figma),
    );
    expect(find.byType(ProductSkeletonCard), findsNWidgets(4));
    expect(find.text('تصفية (2)'), findsNothing);
  });

  testWidgets('no results: clear filters keeps the words', (t) async {
    final repo = FakeSearch(empty: true);
    await _pump(t, repo, screen: const SearchScreen(initial: _figma));
    expect(find.text('لا توجد نتائج لـ «ريب آي»'), findsOneWidget);
    expect(find.text('جرّب كلمات أخرى أو غيّر عوامل التصفية.'), findsOneWidget);
    repo.empty = false;
    await t.tap(find.text('مسح التصفية'));
    await _settle(t);
    expect(repo.queries.last, const SearchQuery(text: 'ريب آي'));
    expect(find.text('تصفية'), findsOneWidget);
    expect(_chip('المتاح الآن'), findsNothing);
  });

  testWidgets('no results without filters: no clear button', (t) async {
    await _pump(
      t,
      FakeSearch(empty: true),
      screen: const SearchScreen(initial: SearchQuery(text: 'xyz')),
    );
    expect(find.text('لا توجد نتائج لـ «xyz»'), findsOneWidget);
    expect(find.text('مسح التصفية'), findsNothing);
  });

  testWidgets('error, then retry', (t) async {
    final repo = FakeSearch(mode: Mode.error);
    await _pump(t, repo, screen: const SearchScreen(initial: _figma));
    expect(find.text('تعذّر تنفيذ البحث'), findsOneWidget);
    repo.mode = Mode.ok;
    await t.tap(find.text('إعادة المحاولة'));
    await _settle(t);
    expect(find.byType(JProductCard), findsWidgets);
  });

  testWidgets('offline', (t) async {
    await _pump(
      t,
      FakeSearch(mode: Mode.offline),
      screen: const SearchScreen(initial: _figma),
    );
    expect(find.text('لا يوجد اتصال بالإنترنت'), findsOneWidget);
    expect(find.text('إعادة المحاولة'), findsOneWidget);
  });

  testWidgets('filters sheet: choices, live count, apply and reset', (t) async {
    final repo = FakeSearch();
    await _pump(
      t,
      repo,
      screen: const SearchScreen(initial: SearchQuery(text: 'حاشي')),
    );
    expect(find.text('6 نتائج لـ «حاشي»'), findsOneWidget);
    await t.tap(find.text('تصفية'));
    await t.pumpAndSettle();
    expect(find.text('تصفية النتائج'), findsOneWidget);
    expect(find.text('عرض 6 نتائج'), findsOneWidget);
    expect(find.text('الترتيب'), findsOneWidget);

    await t.tap(find.text('المتاح الآن فقط'));
    await t.pumpAndSettle();
    expect(find.text('عرض 5 نتائج'), findsOneWidget);
    await t.tap(_chip('مجازر الفلاح'));
    await t.pumpAndSettle();
    expect(find.text('عرض نتيجتين'), findsOneWidget);

    await t.tap(find.text('إعادة ضبط'));
    await t.pumpAndSettle();
    expect(find.text('عرض 6 نتائج'), findsOneWidget);

    await t.tap(find.text('المتاح الآن فقط'));
    await t.pumpAndSettle();
    await t.tap(find.text('عرض 5 نتائج'));
    await t.pumpAndSettle();
    expect(repo.queries.last, const SearchQuery(text: 'حاشي', availableOnly: true));
    expect(find.text('تصفية (1)'), findsOneWidget);
    expect(_chip('المتاح الآن'), findsOneWidget);
    expect(find.text('5 نتائج لـ «حاشي»'), findsOneWidget);
  });

  testWidgets('with the API: no count, popular searches, sort or availability switch', (t) async {
    final repo = FakeSearch(capable: false);
    await _pump(t, repo);
    expect(find.text('الأكثر بحثًا'), findsNothing);
    await t.enterText(find.byType(TextField), 'حاشي');
    await t.testTextInput.receiveAction(TextInputAction.search);
    await _settle(t);
    expect(find.byType(JProductCard), findsWidgets);
    expect(find.textContaining('نتائج'), findsNothing);
    await t.tap(find.text('تصفية'));
    await t.pumpAndSettle();
    expect(find.text('الترتيب'), findsNothing);
    expect(find.text('المتاح الآن فقط'), findsNothing);
    expect(find.text('عرض النتائج'), findsOneWidget);
  });

  testWidgets('infinite scroll loads the next page', (t) async {
    final repo = FakeSearch();
    await _pump(
      t,
      repo,
      screen: const SearchScreen(initial: SearchQuery(categoryId: 'c-sheep')),
    );
    expect(find.text('21 نتيجة'), findsOneWidget);
    await t.drag(find.byType(CustomScrollView), const Offset(0, -3000));
    await _settle(t);
    expect(repo.queries, hasLength(2));
  });

  testWidgets('words and filters are kept after a product page; the words become a recent search', (t) async {
    final repo = FakeSearch();
    final c = await t.pumpScreen(
      const SearchScreen(),
      overrides: [...catalogOverrides(FakeCatalog()), searchRepositoryProvider.overrideWithValue(repo)],
      routes: [
        GoRoute(
          path: '/product/:id',
          builder: (_, _) => const Scaffold(body: Text('product')),
        ),
      ],
    );
    await t.enterText(find.byType(TextField), 'حاشي');
    await t.pump(const Duration(milliseconds: 400));
    await t.pump();
    await t.tap(find.text('تصفية'));
    await t.pumpAndSettle();
    await t.tap(find.text('المتاح الآن فقط'));
    await t.pumpAndSettle();
    await t.tap(find.text('عرض 5 نتائج'));
    await t.pumpAndSettle();

    await t.tap(find.byType(JProductCard).first);
    await t.pumpAndSettle();
    expect(find.text('product'), findsOneWidget);
    expect(c.read(recentSearchesProvider), ['حاشي']);

    GoRouter.of(t.element(find.text('product'))).pop();
    await t.pumpAndSettle();
    expect(find.widgetWithText(TextField, 'حاشي'), findsOneWidget);
    expect(find.text('تصفية (1)'), findsOneWidget);
    expect(_chip('المتاح الآن'), findsOneWidget);
    expect(find.text('5 نتائج لـ «حاشي»'), findsOneWidget);
  });
}
