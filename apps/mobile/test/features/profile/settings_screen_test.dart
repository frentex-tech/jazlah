import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/profile/data/profile_repository.dart';
import 'package:jazlah/features/profile/presentation/settings_screen.dart';

import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

void main() {
  testWidgets('delete account: confirm, pick a reason, then the session and storage are cleared', (t) async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    final container = await t.pumpScreen(
      const SettingsScreen(),
      overrides: [
        tokenStorageProvider.overrideWithValue(tokens),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
      ],
    );
    await t.pump(const Duration(seconds: 1));

    await t.tap(find.text('حذف الحساب'));
    await t.pumpAndSettle();
    expect(find.text('حذف الحساب؟'), findsOneWidget);
    await t.tap(find.text('حذف الحساب').last); // the dialog's confirm
    await t.pumpAndSettle();

    await t.tap(find.text('لدي حساب آخر'));
    await t.pump();
    await t.tap(find.text('حذف الحساب نهائيًا'));
    await t.pump(const Duration(seconds: 1));
    await t.pumpAndSettle();

    expect(tokens.tokens, isNull);
    expect(container.read(sessionProvider), SessionStatus.signedOut);
  });

  testWidgets('cancel keeps the account', (t) async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await t.pumpScreen(
      const SettingsScreen(),
      overrides: [
        tokenStorageProvider.overrideWithValue(tokens),
        profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
      ],
    );
    await t.pump(const Duration(seconds: 1));
    await t.tap(find.text('حذف الحساب'));
    await t.pumpAndSettle();
    await t.tap(find.text('إلغاء'));
    await t.pumpAndSettle();
    expect(tokens.tokens, isNotNull);
  });

  testWidgets('choosing English updates every visible string and the direction at once', (t) async {
    await t.pumpScreen(
      const SettingsScreen(),
      overrides: [profileRepositoryProvider.overrideWithValue(MockProfileRepository())],
    );
    await t.pump(const Duration(seconds: 1));
    expect(find.text('الإعدادات'), findsOneWidget);
    await t.tap(find.text('English'));
    await t.pumpAndSettle();
    for (final text in ['Settings', 'Language', 'Notifications', 'Order notifications', 'Sign out', 'Delete account']) {
      expect(find.text(text), findsOneWidget, reason: text);
    }
    expect(find.text('الإعدادات'), findsNothing);
    expect(Directionality.of(t.element(find.text('Settings'))), TextDirection.ltr);
    await t.pump(const Duration(seconds: 1)); // the language PATCH in the background
  });
}
