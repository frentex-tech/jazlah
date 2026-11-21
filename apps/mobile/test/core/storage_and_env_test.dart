import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('tokens are written and read back as one value', () async {
    FlutterSecureStorage.setMockInitialValues({});
    final storage = TokenStorage();
    await storage.write(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    expect(await const FlutterSecureStorage().readAll(), hasLength(1));
    final t = await storage.read();
    expect((t!.accessToken, t.refreshToken), ('a', 'r'));
    await storage.clear();
    expect(await storage.read(), isNull);
  });

  test('staging and prod refuse to start without an https API URL; dev does not check', () {
    // Tests run without --dart-define, so API_BASE_URL is empty.
    expect(const Env(Flavor.dev).validate, returnsNormally);
    expect(const Env(Flavor.staging).validate, throwsStateError);
    expect(const Env(Flavor.prod).validate, throwsStateError);
  });

  test('signing out or deleting the account keeps the first-run flag (no second keychain wipe)', () async {
    SharedPreferences.setMockInitialValues({'installed': true, 'guest': true, 'onboardingSeen': true});
    final prefs = await Prefs.load();
    await prefs.clearAccountData(keepOnboarding: false);
    expect(prefs.installed, isTrue);
    expect(prefs.guest, isFalse);
  });
}
