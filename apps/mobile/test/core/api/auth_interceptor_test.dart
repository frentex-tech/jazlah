import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/api/api_client.dart';
import 'package:jazlah/core/storage/token_storage.dart';

class _MemoryTokens extends TokenStorage {
  _MemoryTokens(this.tokens);

  AuthTokens? tokens;

  @override
  Future<AuthTokens?> read() async => tokens;

  @override
  Future<void> write(AuthTokens t) async => tokens = t;

  @override
  Future<void> clear() async => tokens = null;
}

/// Fake server: protected calls need access token "a2"; /refresh swaps r1 → (a2, r2) once.
class _Server implements HttpClientAdapter {
  int refreshCalls = 0;
  final seenLanguages = <String>[];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    ResponseBody json(int status, Object data) => ResponseBody.fromString(
      jsonEncode(data),
      status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
    seenLanguages.add(o.headers['Accept-Language'] as String? ?? '');
    if (o.path.endsWith('/v1/public/auth/refresh')) {
      refreshCalls++;
      await Future<void>.delayed(const Duration(milliseconds: 20));
      final sent = jsonDecode(await utf8.decodeStream(body!)) as Map<String, dynamic>;
      if (sent['refreshToken'] != 'r1') return json(401, {'code': 'REFRESH_TOKEN_INVALID'});
      return json(200, {
        'accessToken': 'a2',
        'refreshToken': 'r2',
        'accessTokenExpiresInSeconds': 900,
        'refreshTokenExpiresInSeconds': 2592000,
      });
    }
    if (o.path.startsWith('/v1/public/')) return json(200, {'ok': true});
    if (o.path == '/v1/customer/slow') await Future<void>.delayed(const Duration(milliseconds: 50));
    if (o.path == '/v1/customer/deleted') return json(401, {'code': 'UNAUTHORIZED'});
    if (o.headers['Authorization'] != 'Bearer a2') return json(401, {'code': 'ACCESS_TOKEN_EXPIRED'});
    return json(200, {'ok': true});
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  late _MemoryTokens tokens;
  late _Server server;
  late Dio dio;
  late int sessionEnded;

  setUp(() {
    tokens = _MemoryTokens(const AuthTokens(accessToken: 'a1', refreshToken: 'r1'));
    server = _Server();
    sessionEnded = 0;
    dio = Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = server;
    final interceptor = AuthInterceptor(
      dio: dio,
      tokens: tokens,
      languageCode: () => 'en',
      onSessionEnded: () => sessionEnded++,
      refreshDio: Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = server,
    );
    dio.interceptors.add(interceptor);
  });

  Future<Response<dynamic>> protected([String path = '/v1/customer/me']) => dio.get<dynamic>(
    path,
    options: Options(
      extra: {
        'secure': [
          {'type': 'http', 'scheme': 'bearer', 'name': 'bearer'},
        ],
      },
    ),
  );

  test('parallel ACCESS_TOKEN_EXPIRED failures share one refresh, then repeat', () async {
    final results = await Future.wait([protected(), protected(), protected()]);
    expect(results.map((r) => r.statusCode), [200, 200, 200]);
    expect(server.refreshCalls, 1);
    expect(tokens.tokens!.refreshToken, 'r2');
    expect(server.seenLanguages.toSet(), {'en'});
  });

  test('a refused refresh clears the tokens and ends the session', () async {
    tokens.tokens = const AuthTokens(accessToken: 'a1', refreshToken: 'used');
    await expectLater(protected(), throwsA(isA<DioException>()));
    expect(tokens.tokens, isNull);
    expect(sessionEnded, 1);
  });

  test('public calls get no Authorization header', () async {
    final res = await dio.get<dynamic>('/v1/public/categories', options: Options(extra: {'secure': <Object>[]}));
    expect(res.requestOptions.headers.containsKey('Authorization'), isFalse);
  });

  test('UNAUTHORIZED on a protected call clears the tokens without refreshing', () async {
    await expectLater(protected('/v1/customer/deleted'), throwsA(isA<DioException>()));
    expect(tokens.tokens, isNull);
    expect(sessionEnded, 1);
    expect(server.refreshCalls, 0);
  });

  test('a late 401 after a finished refresh retries with the stored token, no second refresh', () async {
    final call = protected('/v1/customer/slow'); // sent with a1
    await Future<void>.delayed(const Duration(milliseconds: 10));
    tokens.tokens = const AuthTokens(accessToken: 'a2', refreshToken: 'r2'); // another call refreshed meanwhile
    expect((await call).statusCode, 200);
    expect(server.refreshCalls, 0);
  });
}
