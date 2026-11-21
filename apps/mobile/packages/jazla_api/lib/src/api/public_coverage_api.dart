//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/coverage_check_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';

class PublicCoverageApi {

  final Dio _dio;

  const PublicCoverageApi(this._dio);

  /// Do we deliver to this point?
  /// Customer app, the map pin (before or after sign-in): whether an active coverage zone covers the point, and which. Public: no token needed.  Inactive zones never count. Saved addresses also carry &#x60;isCovered&#x60; (GET /v1/customer/addresses).  VALIDATION_FAILED for a missing or out-of-range lat or lng.
  ///
  /// Parameters:
  /// * [lat] - Latitude in decimal degrees (WGS 84), -90 to 90.
  /// * [lng] - Longitude in decimal degrees (WGS 84), -180 to 180.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CoverageCheckResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CoverageCheckResponseDto>> publicCheckCoverage({ 
    required num lat,
    required num lng,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/coverage/check';
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      validateStatus: validateStatus,
    );

    final _queryParameters = <String, dynamic>{
      r'lat': lat,
      r'lng': lng,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    CoverageCheckResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CoverageCheckResponseDto, CoverageCheckResponseDto>(rawData, 'CoverageCheckResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CoverageCheckResponseDto>(
      data: _responseData,
      headers: _response.headers,
      isRedirect: _response.isRedirect,
      requestOptions: _response.requestOptions,
      redirects: _response.redirects,
      statusCode: _response.statusCode,
      statusMessage: _response.statusMessage,
      extra: _response.extra,
    );
  }

}
