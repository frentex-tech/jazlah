import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/domain/otp_challenge.dart';
import 'package:jazlah/features/auth/presentation/complete_profile_screen.dart';
import 'package:jazlah/features/auth/presentation/onboarding_screen.dart';
import 'package:jazlah/features/auth/presentation/otp_screen.dart';
import 'package:jazlah/features/auth/presentation/phone_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/profile/data/profile_repository.dart';
import 'package:jazlah/features/profile/domain/customer_profile.dart';
import 'package:jazlah/features/profile/presentation/account_screen.dart';
import 'package:jazlah/features/profile/presentation/settings_screen.dart';
import 'package:jazlah/app/shell/main_shell.dart';

import 'harness.dart';

class _Auth implements AuthRepository {
  _Auth({this.hangAll = false, this.verifyError});

  final bool hangAll;
  final String? verifyError;

  @override
  Future<OtpChallenge> requestCode(String phone) => hang();

  @override
  Future<bool> verify(String phone, String code) async {
    if (hangAll) return hang();
    throw ApiError(code: verifyError ?? 'OTP_INVALID');
  }

  @override
  Future<bool> hasSession() async => true;

  @override
  Future<void> signOut() async {}
}

class _Profile extends MockProfileRepository {
  _Profile({this.mode = 'ok'});

  final String mode;

  @override
  Future<CustomerProfile> me() async {
    if (mode == 'hang') return hang();
    if (mode == 'error') throw const ApiError(code: ApiError.network);
    return super.me();
  }

  @override
  Future<CustomerProfile> update({String? fullName, String? email, String? preferredLanguage}) => hang();
}

const _challenge = OtpChallenge(phone: '551234567', resendAfter: Duration(seconds: 30), codeLength: 6);

Widget _tabs(Widget child) => MainShell(location: '/account', child: child);

void main() {
  setUpAll(loadFonts);

  final signedIn = [sessionProvider.overrideWithBuild((ref, n) => SessionStatus.signedIn)];

  testWidgets('onboarding', (t) async {
    await shoot(t, '199-28039', const OnboardingScreen());
    await shoot(
      t,
      '123-2588',
      const OnboardingScreen(),
      act: (t) async {
        await t.tap(find.text('التالي'));
        await t.pumpAndSettle();
      },
    );
    await shoot(
      t,
      '123-2651',
      const OnboardingScreen(),
      act: (t) async {
        for (var i = 0; i < 2; i++) {
          await t.tap(find.text('التالي'));
          await t.pumpAndSettle();
        }
      },
    );
    await shoot(t, '123-2712', const OnboardingScreen(loading: true));
  });

  testWidgets('phone', (t) async {
    final o = [authRepositoryProvider.overrideWithValue(_Auth())];
    await shoot(t, '123-2794', const PhoneScreen(), overrides: o);
    await shoot(t, '123-3110', const PhoneScreen(), overrides: o, act: (t) => t.enterText(find.byType(TextField), '551234567'));
    await shoot(
      t,
      '123-2879',
      const PhoneScreen(),
      overrides: o,
      act: (t) async {
        await t.enterText(find.byType(TextField), '512345');
        await t.testTextInput.receiveAction(TextInputAction.done);
      },
    );
    await shoot(
      t,
      '123-2994',
      const PhoneScreen(),
      overrides: o,
      act: (t) async {
        await t.enterText(find.byType(TextField), '551234567');
        await t.pump();
        await t.tap(find.text('إرسال الرمز'));
      },
    );
  });

  testWidgets('otp', (t) async {
    await shoot(t, '123-3227', const OtpScreen(challenge: _challenge), overrides: [authRepositoryProvider.overrideWithValue(_Auth(hangAll: true))]);
    await shoot(
      t,
      '123-3316',
      const OtpScreen(challenge: _challenge),
      overrides: [authRepositoryProvider.overrideWithValue(_Auth(hangAll: true))],
      act: (t) async {
        await t.enterText(find.byType(TextField), '48161');
        FocusManager.instance.primaryFocus?.unfocus();
      },
    );
    await shoot(
      t,
      '123-3435',
      const OtpScreen(challenge: _challenge),
      overrides: [authRepositoryProvider.overrideWithValue(_Auth())],
      act: (t) async {
        await t.enterText(find.byType(TextField), '481612');
        await t.pump();
        FocusManager.instance.primaryFocus?.unfocus();
        await t.pump(const Duration(seconds: 1));
      },
    );
    await shoot(
      t,
      '123-3555',
      const OtpScreen(challenge: _challenge),
      overrides: [authRepositoryProvider.overrideWithValue(_Auth(hangAll: true))],
      act: (t) async {
        await t.enterText(find.byType(TextField), '481612');
        FocusManager.instance.primaryFocus?.unfocus();
        await t.pump(const Duration(seconds: 25));
      },
    );
  });

  testWidgets('complete profile', (t) async {
    final o = [profileRepositoryProvider.overrideWithValue(_Profile())];
    await shoot(t, '123-3677', const CompleteProfileScreen(), overrides: o);
    Future<void> fill(WidgetTester t) async {
      await t.enterText(find.byType(TextField).at(0), 'عبدالرحمن محمد');
      await t.enterText(find.byType(TextField).at(1), 'name@example.com');
      FocusManager.instance.primaryFocus?.unfocus();
    }

    await shoot(t, '123-3754', const CompleteProfileScreen(), overrides: o, act: fill);
    await shoot(
      t,
      '123-3850',
      const CompleteProfileScreen(),
      overrides: o,
      act: (t) async {
        await fill(t);
        await t.enterText(find.byType(TextField).at(0), '');
        FocusManager.instance.primaryFocus?.unfocus();
      },
    );
    await shoot(
      t,
      '123-3946',
      const CompleteProfileScreen(),
      overrides: o,
      act: (t) async {
        await fill(t);
        await t.pump();
        await t.tap(find.text('حفظ ومتابعة'));
      },
    );
  });

  testWidgets('account and settings', (t) async {
    await shoot(t, '227-44073', _tabs(const AccountScreen()), overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile())]);
    await shoot(t, '352-38532', _tabs(const AccountScreen()), lang: 'en', overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile())]);
    await shoot(t, '86-8608', _tabs(const SettingsScreen()), overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile())]);
    await shoot(
      t,
      '86-8667',
      _tabs(const SettingsScreen()),
      overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile())],
      act: (t) async {
        await t.tap(find.text('حذف الحساب'));
        await t.pumpAndSettle();
      },
    );
    await shoot(t, '86-8735', _tabs(const SettingsScreen()), overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile(mode: 'hang'))]);
    await shoot(t, '86-8791', _tabs(const SettingsScreen()), overrides: [...signedIn, profileRepositoryProvider.overrideWithValue(_Profile(mode: 'error'))]);
  });
}
