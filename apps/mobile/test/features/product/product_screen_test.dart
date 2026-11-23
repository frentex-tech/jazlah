import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:jazlah/features/product/presentation/product_screen.dart';

import '../../helpers/pump_screen.dart';

class _Repo extends MockProductRepository {
  _Repo([this.result]) : super(delay: Duration.zero);

  /// null: the mock product.
  final Future<ProductDetail> Function()? result;
  int calls = 0;

  @override
  Future<ProductDetail> product(String id) {
    calls++;
    return result?.call() ?? super.product(id);
  }
}

final Finder _page = find.descendant(of: find.byType(SingleChildScrollView), matching: find.byType(Scrollable)).first;

Future<_Repo> _pump(WidgetTester t, {String id = 'p-falah-ribeye', _Repo? repo}) async {
  final r = repo ?? _Repo();
  await t.pumpScreen(ProductScreen(id: id), overrides: [productRepositoryProvider.overrideWithValue(r)]);
  await t.pump();
  return r;
}

Future<void> _tap(WidgetTester t, String text) async {
  await t.scrollUntilVisible(find.text(text), 200, scrollable: _page);
  await t.tap(find.text(text));
  await t.pump();
}

String _total(WidgetTester t) {
  final bar = find.ancestor(of: find.text('الإجمالي'), matching: find.byType(Column)).first;
  return t.widget<Text>(find.descendant(of: bar, matching: find.textContaining('.')).first).data!;
}

void main() {
  testWidgets('default: the Figma product with the default size and a live total', (t) async {
    await _pump(t);
    expect(find.text('ريب آي بقري طازج'), findsOneWidget);
    expect(find.text('مجازر الفلاح'), findsOneWidget);
    expect(find.text('4.8'), findsOneWidget);
    expect(find.text('ذُبح اليوم 6:30 ص'), findsOneWidget);
    expect(find.text('يُبرَّد ويُسلَّم طازجًا خلال 3 ساعات'), findsOneWidget);
    expect(t.widget<JChip>(find.widgetWithText(JChip, '1 كجم')).selected, isTrue);
    expect(_total(t), '89.00');

    await _tap(t, 'مكعبات');
    expect(_total(t), '91.00');
    await _tap(t, 'تغليف مفرغ');
    expect(_total(t), '96.00');
    await _tap(t, 'بدون دهن');
    expect(_total(t), '96.00'); // exclusions are free
    await t.scrollUntilVisible(find.byType(JStepper), 200, scrollable: _page);
    await t.tap(find.bySemanticsLabel('زيادة الكمية'));
    await t.pump();
    expect(_total(t), '192.00');
    await t.scrollUntilVisible(find.widgetWithText(JChip, '500 جم'), -200, scrollable: _page);
    await t.tap(find.widgetWithText(JChip, '500 جم'));
    await t.pump();
    expect(_total(t), '113.00'); // (49.50 + 2 + 5) × 2
  });

  testWidgets('an incompatible packaging cannot be selected; tapping it explains why', (t) async {
    await _pump(t);
    await _tap(t, 'شرائح');
    expect(find.text('غير متاح مع التقطيع المختار: الشرائح'), findsOneWidget);
    await _tap(t, 'صندوق هدية');
    final gift = t.widget<JRadio>(find.widgetWithText(JRadio, 'صندوق هدية'));
    expect((gift.checked, gift.onTap), (false, null));
    expect(_total(t), '89.00');
    expect(find.text('غيّر التقطيع إلى «قطعة كاملة» أو «مكعبات» لاختيار هذا الخيار.'), findsOneWidget);
    await t.tap(find.text('صندوق هدية'));
    await t.pump();
    expect(find.textContaining('غيّر التقطيع'), findsNothing);
  });

  testWidgets('changing the cut clears a packaging that does not go with it', (t) async {
    await _pump(t);
    await _tap(t, 'مكعبات');
    await _tap(t, 'صندوق هدية');
    expect(t.widget<JRadio>(find.widgetWithText(JRadio, 'صندوق هدية')).checked, isTrue);
    expect(_total(t), '106.00');
    await _tap(t, 'شرائح');
    expect(t.widget<JRadio>(find.widgetWithText(JRadio, 'صندوق هدية')).onTap, isNull);
    expect(_total(t), '89.00');
  });

  testWidgets('price details sheet: breakdown, delivery at checkout, total', (t) async {
    await _pump(t);
    await _tap(t, 'شرائح');
    await _tap(t, 'تغليف مفرغ');
    await t.tap(find.text('الإجمالي'));
    await t.pumpAndSettle();
    expect(find.text('تفاصيل السعر'), findsOneWidget);
    expect(find.text('1 كجم × 89.00 ر.س'), findsOneWidget);
    expect(find.text('التقطيع (شرائح)'), findsOneWidget);
    expect(find.text('التغليف المفرغ'), findsOneWidget);
    expect(find.text('يُحسب في الدفع'), findsOneWidget);
    expect(find.text('94.00 ر.س'), findsOneWidget);
  });

  testWidgets('add without a cut: red hint at the cut section; with one: added to the cart', (t) async {
    await _pump(t);
    await t.tap(find.text('أضف إلى السلة'));
    await t.pumpAndSettle();
    expect(find.text('اختر طريقة التقطيع قبل الإضافة إلى السلة'), findsOneWidget);
    expect(find.text('التقطيع').hitTestable(), findsOneWidget);
    await t.tap(find.text('قطعة كاملة'));
    await t.pump();
    expect(find.text('اختر طريقة التقطيع قبل الإضافة إلى السلة'), findsNothing);
    await t.tap(find.text('أضف إلى السلة'));
    await t.pump(const Duration(seconds: 1)); // the device cart reads the client settings (a fake 501)
    await t.pump();
    await t.pump();
    expect(find.text('أُضيفت القطعة إلى السلة'), findsOneWidget);
  });

  testWidgets('out of stock: notice, disabled "unavailable" button, total 0.00', (t) async {
    await _pump(t, id: 'p-nukhba-hashi-hump');
    expect(find.text('هذا المنتج غير متاح حاليًا.'), findsOneWidget);
    expect(t.widget<JButton>(find.widgetWithText(JButton, 'غير متاح')).onPressed, isNull);
    expect(_total(t), '0.00');
    // Every choice is muted and locked.
    expect(t.widgetList<JChip>(find.byType(JChip, skipOffstage: false)).every((c) => c.onTap == null), isTrue);
    expect(t.widgetList<JRadio>(find.byType(JRadio, skipOffstage: false)).every((r) => r.onTap == null), isTrue);
    expect(
      t.widgetList<JCheckbox>(find.byType(JCheckbox, skipOffstage: false)).every((c) => c.onChanged == null),
      isTrue,
    );
    expect(t.widget<JStepper>(find.byType(JStepper, skipOffstage: false)).onChanged, isNull);
  });

  testWidgets('the header cart opens the cart', (t) async {
    await _pump(t);
    await t.tap(find.bySemanticsLabel('السلة'));
    await t.pumpAndSettle();
    expect(find.text('route:/cart'), findsOneWidget);
  });

  testWidgets('another product in the same place starts from its own default size', (t) async {
    await t.pumpScreen(
      const ProductScreen(id: 'p-falah-ribeye'),
      overrides: [productRepositoryProvider.overrideWithValue(_Repo())],
      routes: [
        GoRoute(
          path: '/product/:id',
          builder: (_, s) => productPage(s.pathParameters['id']!),
        ),
      ],
    );
    await t.pump();
    GoRouter.of(t.element(find.byType(ProductScreen))).go('/product/p-falah-ribeye');
    await t.pumpAndSettle();
    final before = _total(t);
    await t.drag(_page, const Offset(0, -400)); // scrolled down
    await t.pumpAndSettle();
    expect(t.state<ScrollableState>(_page).position.pixels, greaterThan(0));
    GoRouter.of(t.element(find.byType(ProductScreen))).go('/product/p-falah-harri-half');
    await t.pumpAndSettle();
    expect(t.state<ScrollableState>(_page).position.pixels, 0); // a fresh page, at the top
    expect(t.widget<JChip>(find.widgetWithText(JChip, '7 كجم')).selected, isTrue);
    expect(_total(t), isNot('0.00'));
    expect(_total(t), isNot(before));
  });

  testWidgets('a sold-out size is disabled', (t) async {
    await _pump(t, id: 'p-falah-harri-half');
    expect(t.widget<JChip>(find.widgetWithText(JChip, '8 كجم · للولائم')).onTap, isNull);
    expect(t.widget<JChip>(find.widgetWithText(JChip, '7 كجم')).selected, isTrue);
  });

  testWidgets('loading: skeleton and a disabled bar at 0.00', (t) async {
    await _pump(t, repo: _Repo(() => Completer<ProductDetail>().future));
    expect(find.byType(JSkeletonRow), findsNWidgets(3));
    expect(t.widget<JButton>(find.widgetWithText(JButton, 'أضف إلى السلة')).onPressed, isNull);
    expect(_total(t), '0.00');
  });

  testWidgets('error: panel without the bar; retry loads again', (t) async {
    final repo = _Repo(() => Future.error(const ApiError(code: 'UNKNOWN')));
    await _pump(t, repo: repo);
    expect(find.text('تعذّر تحميل المنتج'), findsOneWidget);
    expect(find.text('الإجمالي'), findsNothing);
    await t.tap(find.text('إعادة المحاولة'));
    await t.pump();
    expect(repo.calls, 2);
  });

  testWidgets('offline: the no-internet panel', (t) async {
    await _pump(t, repo: _Repo(() => Future.error(const ApiError(code: ApiError.network))));
    expect(find.byWidgetPredicate((w) => w is JEmptyState && w.kind == JEmptyStateKind.offline), findsOneWidget);
  });

  testWidgets('the vendor line opens the store', (t) async {
    await _pump(t);
    await t.tap(find.text('مجازر الفلاح'));
    await t.pumpAndSettle();
    expect(find.text('route:/home/store/v-falah'), findsOneWidget);
  });

  test('definite Arabic names as in Figma; «بدون …», Latin and English left alone', () {
    expect(definiteName('شرائح', 'ar'), 'الشرائح');
    expect(definiteName('تغليف مفرغ', 'ar'), 'التغليف المفرغ');
    expect(definiteName('بدون تغليف', 'ar'), 'بدون تغليف');
    expect(definiteName('مكعبات بدون عظم', 'ar'), 'المكعبات بدون عظم');
    expect(definiteName('الشرائح', 'ar'), 'الشرائح');
    expect(definiteName('T-bone', 'ar'), 'T-bone');
    expect(definiteName('Slices', 'en'), 'Slices');
  });
}
