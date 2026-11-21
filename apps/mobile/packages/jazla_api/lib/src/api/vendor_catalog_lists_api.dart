//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/named_reference_list_response_dto.dart';
import 'package:jazla_api/src/model/vendor_incompatibility_list_response_dto.dart';

class VendorCatalogListsApi {

  final Dio _dio;

  const VendorCatalogListsApi(this._dio);

  /// The active entries of a list, for the product form
  /// Vendor dashboard, product form pickers. Every active entry of one list (&#x60;meat-types&#x60;, &#x60;cutting-styles&#x60;, &#x60;exclusion-items&#x60;), with its Arabic and English name, oldest first; inactive entries are left out, since a product cannot choose them. The whole list in one answer, not paged. Categories come from GET /v1/public/categories. The lists are managed by admins.
  ///
  /// Parameters:
  /// * [list] - Which list: `meat-types`, `cutting-styles` or `exclusion-items` (the \"without\" items a customer can ask to leave out). Categories come from GET /v1/public/categories. Another value is VALIDATION_FAILED on `list`.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [NamedReferenceListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<NamedReferenceListResponseDto>> vendorListCatalogListEntries({ 
    required String list,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/lists/{list}'.replaceAll('{' r'list' '}', list.toString());
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[
          {
            'type': 'http',
            'scheme': 'bearer',
            'name': 'bearer',
          },
        ],
        ...?extra,
      },
      validateStatus: validateStatus,
    );

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    NamedReferenceListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<NamedReferenceListResponseDto, NamedReferenceListResponseDto>(rawData, 'NamedReferenceListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<NamedReferenceListResponseDto>(
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

  /// The cutting and packaging pairs a product cannot offer
  /// Vendor dashboard, product form. Every global rule whose cutting style is active: a product offering that cutting style with that packaging cannot be submitted (PRODUCT_NOT_SUBMITTABLE, INCOMPATIBLE_CUTTING_PACKAGING), so the form can warn first. Each pair carries the cutting style with its Arabic and English name; oldest rule first. The whole list in one answer, not paged. The rules are managed by admins.
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorIncompatibilityListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorIncompatibilityListResponseDto>> vendorListCuttingPackagingIncompatibilities({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/cutting-packaging-incompatibilities';
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[
          {
            'type': 'http',
            'scheme': 'bearer',
            'name': 'bearer',
          },
        ],
        ...?extra,
      },
      validateStatus: validateStatus,
    );

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    VendorIncompatibilityListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorIncompatibilityListResponseDto, VendorIncompatibilityListResponseDto>(rawData, 'VendorIncompatibilityListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorIncompatibilityListResponseDto>(
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
