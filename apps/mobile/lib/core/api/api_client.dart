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
  }) : _refreshDio = refreshDio ?? Dio(BaseOptions(baseUrl: dio.options.baseUrl));

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
      final t = await tokens.read();
      if (t != null) options.headers['Authorization'] = 'Bearer ${t.accessToken}';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final data = err.response?.data;
    final code = data is Map ? data['code'] : null;
    final options = err.requestOptions;
    if (code != 'ACCESS_TOKEN_EXPIRED' || !_needsToken(options) || options.extra[_retried] == true) {
      if (code == 'REFRESH_TOKEN_INVALID' || code == 'UNAUTHORIZED' || code == 'ACCOUNT_DISABLED') {
        if (_needsToken(options)) onSessionEnded();
      }
      return handler.next(err);
    }
    final fresh = await refresh();
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
    final current = await tokens.read();
    if (current == null) return null;
    try {
      final res = await PublicAuthApi(_refreshDio).publicRefreshSession(
        refreshTokenDto: RefreshTokenDto(refreshToken: current.refreshToken),
        headers: {'Accept-Language': languageCode()},
      );
      final body = res.data!;
      final next = AuthTokens(accessToken: body.accessToken, refreshToken: body.refreshToken);
      await tokens.write(next);
      return next;
    } on DioException {
      // Never retry a refresh whose answer was lost: sign in again.
      await tokens.clear();
      onSessionEnded();
      return null;
    }
  }
}
