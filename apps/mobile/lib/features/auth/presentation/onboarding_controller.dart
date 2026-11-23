import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';

/// Onboarding is shown once (until the account is deleted).
final onboardingSeenProvider = NotifierProvider<OnboardingSeen, bool>(OnboardingSeen.new);

class OnboardingSeen extends Notifier<bool> {
  @override
  bool build() => ref.watch(prefsProvider).onboardingSeen;

  Future<void> markSeen() async {
    await ref.read(prefsProvider).setOnboardingSeen();
    state = true;
  }

  void reset() => state = false;
}
