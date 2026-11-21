import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/app/locale.dart';
import 'package:jazlah/core/api/api_client.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';

/// Overridden in `bootstrap()`.
final envProvider = Provider<Env>((ref) => throw UnimplementedError('envProvider'));

/// Overridden in `bootstrap()` (needs async loading).
final prefsProvider = Provider<Prefs>((ref) => throw UnimplementedError('prefsProvider'));

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

/// Fired when the API ends the session (refresh refused, account disabled or deleted elsewhere).
final sessionEndedProvider = NotifierProvider<SessionEnded, int>(SessionEnded.new);

class SessionEnded extends Notifier<int> {
  @override
  int build() => 0;

  void fire() => state++;
}

/// Bumped once the account data on this device is cleared (sign-out, session ended, account deleted), so
/// what was built from it (the device cart) is read again.
final accountDataClearedProvider = NotifierProvider<AccountDataCleared, int>(AccountDataCleared.new);

class AccountDataCleared extends Notifier<int> {
  @override
  int build() => 0;

  void fire() => state++;
}

final apiProvider = Provider<JazlaApi>((ref) {
  return buildApi(
    baseUrl: ref.watch(envProvider).apiBaseUrl,
    tokens: ref.watch(tokenStorageProvider),
    languageCode: () => effectiveLanguage(ref.read(localeProvider)),
    onSessionEnded: () => ref.read(sessionEndedProvider.notifier).fire(),
  );
});
