import 'dart:async';

import 'package:dio/dio.dart';
import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/storage/token_storage.dart';

/// Builds the generated client with the app's interceptor (docs/frontend/auth.md):
/// adds the bearer token and `Accept-Language`, refreshes once on `ACCESS_TOKEN_EXPIRED`
/// (single flight: concurrent failures wait for the same refresh), then repeats the request.
JazlaApi buildApi({
  required String baseUrl,
  required TokenStorage tokens,
  required String Function() languageCode,
  required void Function() onSessionEnded,
}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
  dio.interceptors.add(
    AuthInterceptor(dio: dio, tokens: tokens, languageCode: languageCode, onSessionEnded: onSessionEnded),
  );
  return JazlaApi(dio: dio, interceptors: const []);
}

// A plain Interceptor: a QueuedInterceptor deadlocks when the repeated request fails inside onError.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required this.dio,
    required this.tokens,
    required this.languageCode,
    required this.onSessionEnded,
    Dio? refreshDio,
  }) : _refreshDio =
           refreshDio ??
           Dio(
             BaseOptions(
               baseUrl: dio.options.baseUrl,
               connectTimeout: dio.options.connectTimeout,
               receiveTimeout: dio.options.receiveTimeout,
             ),
           );

  final Dio dio;

  /// A separate client without this interceptor, so the refresh call cannot recurse.
  final Dio _refreshDio;
  final TokenStorage tokens;
  final String Function() languageCode;
  final void Function() onSessionEnded;

  Future<AuthTokens?>? _refreshing;
  static const _retried = 'jazlah.retried';

  /// Generated operations list their security schemes in `extra['secure']`; public ones list none.
  static bool _needsToken(RequestOptions o) => (o.extra['secure'] as List?)?.isNotEmpty ?? false;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    options.headers['Accept-Language'] = languageCode();
    if (_needsToken(options)) {
      final t = await _readTokens();
      if (t != null) options.headers['Authorization'] = 'Bearer ${t.accessToken}';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final data = err.response?.data;
    final code = data is Map ? data['code'] : null;
    final options = err.requestOptions;
    if (!_needsToken(options)) return handler.next(err);

    // The token is unusable or the account is off: refreshing will not help (docs/frontend/auth.md).
    if (code == 'UNAUTHORIZED' || code == 'ACCOUNT_DISABLED') {
      await _endSession();
      return handler.next(err);
    }
    if (code != 'ACCESS_TOKEN_EXPIRED' || options.extra[_retried] == true) return handler.next(err);

    // A refresh may have finished while this request was in flight: retry with the stored token instead.
    final stored = await _readTokens();
    final sentWith = options.headers['Authorization'];
    final fresh = stored != null && sentWith != 'Bearer ${stored.accessToken}' ? stored : await refresh();
    if (fresh == null) return handler.next(err);
    options.extra[_retried] = true;
    options.headers['Authorization'] = 'Bearer ${fresh.accessToken}';
    try {
      handler.resolve(await dio.fetch<dynamic>(options));
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  /// One refresh at a time: a refresh token works once, so parallel refreshes would end the session.
  Future<AuthTokens?> refresh() => _refreshing ??= _doRefresh().whenComplete(() => _refreshing = null);

  Future<AuthTokens?> _doRefresh() async {
    try {
      final current = await tokens.read();
      if (current == null) return null;
      final res = await PublicAuthApi(_refreshDio).publicRefreshSession(
        refreshTokenDto: RefreshTokenDto(refreshToken: current.refreshToken),
        headers: {'Accept-Language': languageCode()},
      );
      final body = res.data!;
      final next = AuthTokens(accessToken: body.accessToken, refreshToken: body.refreshToken);
      await tokens.write(next);
      return next;
    } on Object {
      // Refused, lost or not saved: never retry a refresh, sign in again.
      await _endSession();
      return null;
    }
  }

  /// Interceptor futures are not awaited by Dio: nothing here may throw, or the request hangs.
  Future<AuthTokens?> _readTokens() async {
    try {
      return await tokens.read();
    } on Object {
      return null;
    }
  }

  Future<void> _endSession() async {
    try {
      await tokens.clear();
    } on Object {
      // The keychain refused; the session still ends in the app.
    }
    onSessionEnded();
  }
}
