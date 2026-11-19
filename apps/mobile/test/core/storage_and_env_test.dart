import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/token_storage.dart';

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
}
