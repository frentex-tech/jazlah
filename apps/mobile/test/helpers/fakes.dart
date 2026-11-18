import 'package:jazlah/core/storage/token_storage.dart';

class MemoryTokens extends TokenStorage {
  MemoryTokens([this.tokens]);

  AuthTokens? tokens;

  @override
  Future<AuthTokens?> read() async => tokens;

  @override
  Future<void> write(AuthTokens t) async => tokens = t;

  @override
  Future<void> clear() async => tokens = null;
}
