import 'package:dio/dio.dart';

/// An API failure, read from the `{ code, message, details?, requestId }` body (docs/frontend/errors.md).
/// Branch on [code], never on [message].
class ApiError implements Exception {
  const ApiError({required this.code, this.message, this.details, this.requestId, this.retryAfter});

  factory ApiError.from(Object error) {
    if (error is ApiError) return error;
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map && data['code'] is String) {
        final retry = int.tryParse(error.response?.headers.value('retry-after') ?? '');
        return ApiError(
          code: data['code'] as String,
          message: data['message'] as String?,
          details: data['details'],
          requestId: data['requestId'] as String?,
          retryAfter: retry == null ? null : Duration(seconds: retry),
        );
      }
      final offline = switch (error.type) {
        DioExceptionType.connectionError ||
        DioExceptionType.connectionTimeout ||
        DioExceptionType.receiveTimeout ||
        DioExceptionType.sendTimeout => true,
        _ => false,
      };
      return ApiError(code: offline ? network : unknown);
    }
    return const ApiError(code: unknown);
  }

  /// Client-side codes (not sent by the API).
  static const network = 'NETWORK';
  static const unknown = 'UNKNOWN';

  /// 501: a route in the contract whose task has not landed yet (`details.task`). Shown as «قريبًا», never retried;
  /// the same screen works with no change once the route answers.
  static const notImplemented = 'NOT_IMPLEMENTED';

  bool get isNotImplemented => code == notImplemented;

  final String code;

  /// Already translated by the API (Accept-Language). Null for client-side codes.
  final String? message;
  final Object? details;
  final String? requestId;
  final Duration? retryAfter;

  /// Field paths named in VALIDATION_FAILED details.
  Set<String> get invalidFields => {
    if (details is List)
      for (final d in details! as List)
        if (d is Map && d['field'] is String) d['field'] as String,
  };

  @override
  String toString() => 'ApiError($code, requestId: $requestId)';
}
