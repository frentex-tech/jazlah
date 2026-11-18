import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';

import '../../helpers/pump_app.dart';

void main() {
  Finder input() => find.byType(TextField);

  testWidgets('typing 6 digits calls onCompleted with the code', (tester) async {
    String? code;
    await tester.pumpApp(JOtpField(onCompleted: (c) => code = c));
    await tester.enterText(input(), '48163');
    expect(code, isNull);
    await tester.enterText(input(), '481632');
    await tester.pump();
    expect(code, '481632');
    for (final d in ['4', '8', '1', '6', '3', '2']) {
      expect(find.text(d), findsOneWidget);
    }
  });

  testWidgets('Arabic digits are normalised to Latin', (tester) async {
    String? code;
    await tester.pumpApp(JOtpField(onCompleted: (c) => code = c));
    await tester.enterText(input(), '١٢٣٤٥٦');
    expect(code, '123456');
  });

  testWidgets('pasting a full code fills every box and drops extra characters', (tester) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);
    String? code;
    await tester.pumpApp(JOtpField(controller: controller, onCompleted: (c) => code = c));
    await tester.enterText(input(), 'Code: 987 654 321');
    await tester.pump();
    expect(controller.text, '987654');
    expect(code, '987654');
    for (final d in ['9', '8', '7', '6', '5', '4']) {
      expect(find.text(d), findsOneWidget);
    }
    controller.clear();
    await tester.pump();
    expect(find.text('9'), findsNothing);
  });

  testWidgets('error state shows the message and danger boxes', (tester) async {
    await tester.pumpApp(const JOtpField(errorText: 'الرمز غير صحيح'));
    expect(find.text('الرمز غير صحيح'), findsOneWidget);
    final boxes = tester
        .widgetList<Container>(find.byType(Container))
        .map((c) => c.decoration)
        .whereType<BoxDecoration>()
        .where((d) => d.color == JColors.dangerBg);
    expect(boxes.length, 6);
  });

  testWidgets('offers SMS one-time-code autofill', (tester) async {
    await tester.pumpApp(const JOtpField());
    expect(tester.widget<TextField>(input()).autofillHints, contains(AutofillHints.oneTimeCode));
  });
}
