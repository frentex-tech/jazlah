import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/otp_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';

import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

void main() {
  const challenge = OtpChallenge(phone: '551234567', resendAfter: Duration(seconds: 60), codeLength: 6);

  testWidgets('resend is disabled with a countdown and enables after 60 s', (t) async {
    await t.pumpScreen(const OtpScreen(challenge: challenge));
    JButton resend() => t.widget<JButton>(find.byWidgetPredicate((w) => w is JButton && w.size == JButtonSize.s));

    expect(find.text('إعادة الإرسال بعد 01:00'), findsOneWidget);
    expect(resend().onPressed, isNull);

    await t.pump(const Duration(seconds: 59));
    expect(find.text('إعادة الإرسال بعد 00:01'), findsOneWidget);
    expect(resend().onPressed, isNull);

    await t.pump(const Duration(seconds: 1));
    expect(find.text('إعادة إرسال الرمز'), findsOneWidget);
    expect(resend().onPressed, isNotNull);
  });

  testWidgets('a wrong code shows the error; the right one signs in', (t) async {
    final tokens = MemoryTokens();
    final container = await t.pumpScreen(
      const OtpScreen(challenge: challenge),
      overrides: [authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens))],
    );
    await t.enterText(find.byType(TextField), '000000');
    await t.pump(const Duration(seconds: 1));
    expect(find.text('الرمز غير صحيح، حاول مرة أخرى'), findsOneWidget);

    await t.enterText(find.byType(TextField), '111111');
    await t.pump(const Duration(seconds: 1));
    await t.pumpAndSettle();
    expect(tokens.tokens, isNotNull);
    expect(container.read(sessionProvider), SessionStatus.signedIn);
    expect(find.text('route:/home'), findsOneWidget);
  });
}
