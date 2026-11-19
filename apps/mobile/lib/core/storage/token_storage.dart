import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;
}

/// Access and refresh tokens, only ever in the platform keychain / keystore.
class TokenStorage {
  TokenStorage([FlutterSecureStorage? storage]) : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;
  // Both tokens in one value: a crash cannot leave a mismatched pair.
  static const _key = 'auth.tokens';

  Future<AuthTokens?> read() async {
    final raw = await _storage.read(key: _key);
    if (raw == null) return null;
    try {
      final j = jsonDecode(raw) as Map<String, dynamic>;
      return AuthTokens(accessToken: j['access'] as String, refreshToken: j['refresh'] as String);
    } on Object {
      return null;
    }
  }

  Future<void> write(AuthTokens tokens) =>
      _storage.write(key: _key, value: jsonEncode({'access': tokens.accessToken, 'refresh': tokens.refreshToken}));

  Future<void> clear() => _storage.deleteAll();
}
