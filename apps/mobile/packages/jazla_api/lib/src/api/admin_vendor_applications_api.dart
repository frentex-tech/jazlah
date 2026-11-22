//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/admin_vendor_response_dto.dart';
import 'package:jazla_api/src/model/commission_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/reason_dto.dart';
import 'package:jazla_api/src/model/vendor_application_detail_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_page_response_dto.dart';
import 'package:jazla_api/src/model/vendor_application_response_dto.dart';

class AdminVendorApplicationsApi {

  final Dio _dio;

  const AdminVendorApplicationsApi(this._dio);

  /// Approve a pending application with a commission
  /// Admin dashboard, application review screen: approves a pending application with the platform commission for the vendor&#39;s orders, in basis points (1250 is 12.5%). In one step it creates the vendor (active, listed publicly at once, without a logo), records the first commission in its history, and gives the applicant vendor access: they sign in to the vendor dashboard with the same phone number. Audited.  Errors: VALIDATION_FAILED for a commission that is not a whole number from 0 to 10000. NOT_FOUND for an unknown application. VENDOR_APPLICATION_NOT_PENDING: it was already approved or rejected (also when two admins approve at once: only one vendor is created); reload it. VENDOR_ACCESS_ALREADY_HELD: the applicant came to work for another vendor after applying; nothing changed and the application stays pending. VENDOR_CR_EXISTS: another application with the same commercial registration number was approved first; the application stays pending (reject it). TRANSACTION_CONFLICT: nothing was saved; send again.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [commissionDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [AdminVendorResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorResponseDto>> adminApproveVendorApplication({ 
    required String id,
    required CommissionDto commissionDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendor-applications/{id}/approve'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'POST',
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
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(commissionDto);
    } catch(error, stackTrace) {
      throw DioException(
         requestOptions: _options.compose(
          _dio.options,
          _path,
        ),
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    final _response = await _dio.request<Object>(
      _path,
      data: _bodyData,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    AdminVendorResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<AdminVendorResponseDto, AdminVendorResponseDto>(rawData, 'AdminVendorResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<AdminVendorResponseDto>(
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

  /// One vendor application, with a link to each document
  /// Admin dashboard, application review screen: one application with who reviewed it and, for each document, a presigned link to open it. The links expire after a few minutes (expiresAt): read the application again for fresh ones, never store them.  NOT_FOUND for an unknown id, and for an application its applicant removed by deleting their account (only pending and rejected ones are removed). MEDIA_NOT_READY only when that deletion happens while the application is being read: reload, and it is NOT_FOUND.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorApplicationDetailResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorApplicationDetailResponseDto>> adminGetVendorApplication({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendor-applications/{id}'.replaceAll('{' r'id' '}', id.toString());
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

    VendorApplicationDetailResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorApplicationDetailResponseDto, VendorApplicationDetailResponseDto>(rawData, 'VendorApplicationDetailResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorApplicationDetailResponseDto>(
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

  /// Vendor applications, newest first
  /// Admin dashboard, vendor applications list: every application, optionally only one status (status&#x3D;pending for the review queue) and only those matching a search (q: part of the store name in Arabic or English, any case, or of the commercial registration number; % and _ match themselves). The IBAN is shown masked; open one application for its document links.  Paged by cursor, newest first, no total count: send the previous page&#39;s nextCursor as cursor; limit 1 to 50, default 20. VALIDATION_FAILED for an unknown status, a q shorter than 2 or longer than 100 characters, a cursor the API did not write or a limit out of range.
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [q] - Search: part of the store name in Arabic or English (any case) or of the commercial registration number (Latin or Arabic digits). 2 to 100 characters after trimming; % and _ match themselves.
  /// * [status] - Only applications in this status: pending (waiting for review), approved or rejected. Omit it for every status.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorApplicationPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorApplicationPageResponseDto>> adminListVendorApplications({ 
    String? cursor,
    num? limit = 20,
    String? q,
    String? status,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendor-applications';
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

    final _queryParameters = <String, dynamic>{
      if (cursor != null) r'cursor': cursor,
      if (limit != null) r'limit': limit,
      if (q != null) r'q': q,
      if (status != null) r'status': status,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    VendorApplicationPageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorApplicationPageResponseDto, VendorApplicationPageResponseDto>(rawData, 'VendorApplicationPageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorApplicationPageResponseDto>(
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

  /// Reject a pending application with a reason
  /// Admin dashboard, application review screen: rejects a pending application. The reason (1 to 500 characters) is shown to the applicant in the customer app, so write it for them; they may then apply again. Final: a rejected application never changes. Audited.  Errors: NOT_FOUND for an unknown application. VENDOR_APPLICATION_NOT_PENDING: it was already approved or rejected; reload it. TRANSACTION_CONFLICT: nothing was saved; send again.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [reasonDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorApplicationResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorApplicationResponseDto>> adminRejectVendorApplication({ 
    required String id,
    required ReasonDto reasonDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendor-applications/{id}/reject'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'POST',
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
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(reasonDto);
    } catch(error, stackTrace) {
      throw DioException(
         requestOptions: _options.compose(
          _dio.options,
          _path,
        ),
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    final _response = await _dio.request<Object>(
      _path,
      data: _bodyData,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    VendorApplicationResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorApplicationResponseDto, VendorApplicationResponseDto>(rawData, 'VendorApplicationResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorApplicationResponseDto>(
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
