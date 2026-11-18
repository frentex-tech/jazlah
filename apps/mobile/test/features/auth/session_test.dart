import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/onboarding_controller.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fakes.dart';

Future<ProviderContainer> _container(MemoryTokens tokens, Map<String, Object> prefs) async {
  SharedPreferences.setMockInitialValues(prefs);
  final p = await Prefs.load();
  final c = ProviderContainer(
    overrides: [
      envProvider.overrideWithValue(const Env(Flavor.dev)),
      prefsProvider.overrideWithValue(p),
      tokenStorageProvider.overrideWithValue(tokens),
      authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    ],
  );
  addTearDown(c.dispose);
  return c;
}

Future<SessionStatus> _settled(ProviderContainer c) async {
  c.read(sessionProvider);
  await Future<void>.delayed(Duration.zero);
  return c.read(sessionProvider);
}

void main() {
  test('a stored session survives killing and reopening the app', () async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    expect(await _settled(await _container(tokens, {})), SessionStatus.signedIn);
    expect(await _settled(await _container(MemoryTokens(), {})), SessionStatus.signedOut);
  });

  test('deleting the account clears secure storage and shows onboarding again', () async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    final c = await _container(tokens, {'onboardingSeen': true, 'locale': 'en', 'other': 'x'});
    await _settled(c);
    await c.read(sessionProvider.notifier).accountDeleted();

    expect(tokens.tokens, isNull);
    expect(c.read(sessionProvider), SessionStatus.signedOut);
    expect(c.read(onboardingSeenProvider), isFalse);
    expect(c.read(prefsProvider).languageCode, 'en');
    expect(
      authRedirect(uri: Uri.parse(Routes.settings), session: SessionStatus.signedOut, onboardingSeen: false),
      Routes.onboarding,
    );
  });

  test('signing out keeps the onboarding as seen and goes to the phone screen', () async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    final c = await _container(tokens, {'onboardingSeen': true});
    await _settled(c);
    await c.read(sessionProvider.notifier).signOut();
    expect(tokens.tokens, isNull);
    expect(c.read(onboardingSeenProvider), isTrue);
    expect(authRedirect(uri: Uri.parse(Routes.account), session: SessionStatus.signedOut, onboardingSeen: true), Routes.phone);
  });

  test('redirects', () {
    String? r(String loc, SessionStatus s, {bool seen = true}) =>
        authRedirect(uri: Uri.parse(loc), session: s, onboardingSeen: seen);
    expect(r(Routes.home, SessionStatus.unknown), Routes.splash);
    expect(r(Routes.home, SessionStatus.signedOut, seen: false), Routes.onboarding);
    expect(r(Routes.otp, SessionStatus.signedOut), isNull);
    expect(r(Routes.home, SessionStatus.guest), isNull); // guests browse
    expect(r(Routes.phone, SessionStatus.guest), isNull); // and may choose to sign in
    expect(r(Routes.onboarding, SessionStatus.guest), Routes.home); // «Skip» lands on home
    expect(r(Routes.splash, SessionStatus.guest), Routes.home);
    expect(r(Routes.settings, SessionStatus.guest), Routes.account); // account pages need sign-in
    expect(r(Routes.phone, SessionStatus.signedIn), Routes.home);
    expect(r(Routes.completeProfile, SessionStatus.signedIn), isNull);
  });

  test('a deep link survives start-up and sign-in', () {
    String? r(String loc, SessionStatus s) => authRedirect(uri: Uri.parse(loc), session: s, onboardingSeen: true);
    final splash = r(Routes.settings, SessionStatus.unknown)!;
    expect(splash, '/splash?from=%2Faccount%2Fsettings');
    expect(r(splash, SessionStatus.signedIn), Routes.settings);
    final login = r(splash, SessionStatus.signedOut)!;
    expect(login, '/login?from=%2Faccount%2Fsettings');
    expect(r('/splash?from=//evil.example', SessionStatus.signedIn), Routes.home); // no open redirect
  });

  test('a guest stays a guest after restarting the app', () async {
    final c = await _container(MemoryTokens(), {'onboardingSeen': true, 'guest': true});
    expect(await _settled(c), SessionStatus.guest);
  });
}
