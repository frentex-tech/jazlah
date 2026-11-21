import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';

import '../../helpers/pump_app.dart';

void main() {
  testWidgets('renders the label', (tester) async {
    await tester.pumpApp(JButton(label: 'اطلب الآن', onPressed: () {}));
    expect(find.text('اطلب الآن'), findsOneWidget);
  });

  testWidgets('onPressed fires', (tester) async {
    var taps = 0;
    await tester.pumpApp(JButton(label: 'Go', onPressed: () => taps++));
    await tester.tap(find.byType(JButton));
    expect(taps, 1);
  });

  testWidgets('disabled ignores taps', (tester) async {
    await tester.pumpApp(const JButton(label: 'Go', onPressed: null));
    BoxDecoration box() =>
        tester
                .widget<Container>(
                  find.descendant(of: find.byType(JButton), matching: find.byType(Container)),
                )
                .decoration!
            as BoxDecoration;
    expect(box().color, JColors.sand);
    final gesture = await tester.startGesture(tester.getCenter(find.byType(JButton)));
    await tester.pump();
    // No pressed look, still the disabled fill.
    expect(box().color, JColors.sand);
    await gesture.up();
    expect(tester.widget<GestureDetector>(find.byType(GestureDetector)).onTap, isNull);
  });

  testWidgets('pressing an enabled button shows the pressed fill', (tester) async {
    await tester.pumpApp(JButton(label: 'Go', onPressed: () {}));
    final gesture = await tester.startGesture(tester.getCenter(find.byType(JButton)));
    await tester.pump();
    final box =
        tester
                .widget<Container>(
                  find.descendant(of: find.byType(JButton), matching: find.byType(Container)),
                )
                .decoration!
            as BoxDecoration;
    expect(box.color, JColors.ember2);
    await gesture.up();
  });

  testWidgets('loading shows the spinner and ignores taps', (tester) async {
    var taps = 0;
    await tester.pumpApp(JButton(label: 'Go', loading: true, onPressed: () => taps++));
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.tap(find.byType(JButton));
    await tester.pump();
    expect(taps, 0);
  });
}
