import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/product/presentation/product_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/pump_screen.dart';

/// STF-MOB-3 #56 on the real API wiring: ApiProductRepository over a fake HTTP layer answering
/// GET /v1/public/products/{id} (openapi PublicProductResponseDto) with an incompatible cutting × packaging pair.

FakeHttp _server() => FakeHttp(
  (r) => r.path == '/v1/public/products/p1'
      ? productJson(
          'p1',
          cuttings: [
            {'cuttingStyleId': 'cut-mince', 'name': ar('مفروم'), 'extraPriceHalalas': 300},
            {'cuttingStyleId': 'cut-quarters', 'name': ar('أرباع'), 'extraPriceHalalas': 0},
          ],
          packagings: [
            {'packaging': 'trays', 'extraPriceHalalas': 0},
            {'packaging': 'vacuum', 'extraPriceHalalas': 500},
          ],
          incompatiblePairs: [
            {'cuttingStyleId': 'cut-mince', 'packaging': 'trays'},
          ],
        )
      : null,
);

final Finder _page = find.descendant(of: find.byType(SingleChildScrollView), matching: find.byType(Scrollable)).first;

Future<void> _tap(WidgetTester t, String text) async {
  await t.scrollUntilVisible(find.text(text), 200, scrollable: _page);
  await t.tap(find.text(text));
  await t.pump();
}

JRadio _radio(WidgetTester t, String label) => t.widget<JRadio>(find.widgetWithText(JRadio, label));

void main() {
  testWidgets('an incompatible cut and packaging (from the API) cannot be selected together', (t) async {
    await t.pumpScreen(const ProductScreen(id: 'p1'), overrides: [apiOn(_server())]);
    await t.pump(const Duration(seconds: 1));
    await t.pump();

    // Trays first, then the mince cut that does not go with it: the trays are cleared.
    await _tap(t, 'أطباق');
    expect(_radio(t, 'أطباق').checked, isTrue);
    await _tap(t, 'مفروم');
    expect(_radio(t, 'أطباق').checked, isFalse);
    expect(_radio(t, 'أطباق').onTap, isNull); // disabled, not just an error afterwards
    expect(find.text('غير متاح مع التقطيع المختار: المفروم'), findsOneWidget);

    // Tapping it changes nothing; the compatible packaging still can be chosen.
    await t.tap(find.text('أطباق'));
    await t.pump();
    expect(_radio(t, 'أطباق').checked, isFalse);
    await _tap(t, 'تغليف مفرغ');
    expect(_radio(t, 'تغليف مفرغ').checked, isTrue);

    // Another cut makes the trays selectable again.
    await _tap(t, 'أرباع');
    expect(_radio(t, 'أطباق').onTap, isNotNull);
  });
}
