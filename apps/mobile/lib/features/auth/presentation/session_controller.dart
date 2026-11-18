import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/locale.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/onboarding_controller.dart';
import 'package:jazlah/features/profile/data/profile_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final tokens = ref.watch(tokenStorageProvider);
  return Env.useMocks ? MockAuthRepository(tokens) : ApiAuthRepository(ref.watch(apiProvider), tokens);
});

final profileRepositoryProvider = Provider<ProfileRepository>(
  (ref) => Env.useMocks ? MockProfileRepository() : ApiProfileRepository(ref.watch(apiProvider)),
);

enum SessionStatus {
  /// Reading the stored tokens at start-up.
  unknown,
  signedOut,

  /// Browsing without an account; sign-in is asked for at checkout.
  guest,
  signedIn,
}

final sessionProvider = NotifierProvider<SessionController, SessionStatus>(SessionController.new);

class SessionController extends Notifier<SessionStatus> {
  @override
  SessionStatus build() {
    // The API ended the session (refresh refused, account deleted or disabled elsewhere).
    ref.listen(sessionEndedProvider, (_, _) => state = SessionStatus.signedOut);
    unawaited(_restore());
    return SessionStatus.unknown;
  }

  /// Auto-login: a stored session survives killing the app.
  Future<void> _restore() async {
    final has = await ref.read(authRepositoryProvider).hasSession();
    state = has
        ? SessionStatus.signedIn
        : ref.read(prefsProvider).guest
        ? SessionStatus.guest
        : SessionStatus.signedOut;
  }

  /// After a successful code. Adopts the account's language unless the user picked one in the app.
  Future<void> signedIn() async {
    final prefs = ref.read(prefsProvider);
    state = SessionStatus.signedIn; // first, so the router already allows the next screen
    await prefs.setGuest(value: false);
    if (prefs.languageCode == null) {
      try {
        final p = await ref.read(profileRepositoryProvider).me();
        await ref.read(localeProvider.notifier).set(p.preferredLanguage);
      } on Object {
        // The device language stays; the profile can be read again later.
      }
    }
  }

  Future<void> continueAsGuest() async {
    await ref.read(prefsProvider).setGuest(value: true);
    state = SessionStatus.guest;
  }

  void startSignIn() => state = SessionStatus.signedOut;

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    await ref.read(prefsProvider).clearAccountData();
    state = SessionStatus.signedOut;
  }

  /// After the account is deleted: forget everything, onboarding included.
  Future<void> accountDeleted() async {
    await ref.read(tokenStorageProvider).clear();
    await ref.read(prefsProvider).clearAccountData(keepOnboarding: false);
    ref.read(onboardingSeenProvider.notifier).reset();
    state = SessionStatus.signedOut;
  }
}
