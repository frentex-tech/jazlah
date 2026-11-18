import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/phone_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';

import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

void main() {
  JButton send(WidgetTester t) => t.widget<JButton>(find.widgetWithText(JButton, 'إرسال الرمز'));

  testWidgets('continue stays disabled until the number is a valid Saudi mobile', (t) async {
    await t.pumpScreen(const PhoneScreen());
    expect(send(t).onPressed, isNull);

    await t.enterText(find.byType(TextField), '55123456'); // 8 digits
    await t.pump();
    expect(send(t).onPressed, isNull);

    await t.enterText(find.byType(TextField), '412345678'); // 9 digits, not a mobile
    await t.pump();
    expect(send(t).onPressed, isNull);
    expect(find.text('أدخل رقم جوال سعودي صحيح مكوّن من 9 أرقام'), findsOneWidget);

    await t.enterText(find.byType(TextField), '551234567');
    await t.pump();
    expect(send(t).onPressed, isNotNull);
  });

  testWidgets('a valid number requests a code and opens the code screen', (t) async {
    await t.pumpScreen(
      const PhoneScreen(),
      overrides: [authRepositoryProvider.overrideWithValue(MockAuthRepository(MemoryTokens()))],
    );
    await t.enterText(find.byType(TextField), '551234567');
    await t.pump();
    await t.tap(find.text('إرسال الرمز'));
    await t.pump(const Duration(seconds: 1));
    await t.pumpAndSettle();
    expect(find.text('route:/login/otp'), findsOneWidget);
  });

  testWidgets('the language pill switches every string and the direction at once', (t) async {
    await t.pumpScreen(const PhoneScreen());
    expect(find.text('أهلًا بك في جزلة'), findsOneWidget);
    await t.tap(find.text('English'));
    await t.pumpAndSettle();
    expect(find.text('Welcome to JAZLA'), findsOneWidget);
    expect(find.text('Send code'), findsOneWidget);
    expect(find.text('أهلًا بك في جزلة'), findsNothing);
    expect(Directionality.of(t.element(find.text('Welcome to JAZLA'))), TextDirection.ltr);
  });
}
