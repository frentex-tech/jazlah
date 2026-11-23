//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/admin_vendor_page_response_dto.dart';
import 'package:jazla_api/src/model/admin_vendor_response_dto.dart';
import 'package:jazla_api/src/model/commission_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/reason_dto.dart';
import 'package:jazla_api/src/model/update_vendor_profile_as_admin_dto.dart';
import 'package:jazla_api/src/model/vendor_commission_change_page_response_dto.dart';

class AdminVendorsApi {

  final Dio _dio;

  const AdminVendorsApi(this._dio);

  /// One vendor
  /// Admin dashboard, vendor screen: one vendor in any status, with its commission, masked IBAN, suspension and the application it came from. NOT_FOUND for an unknown id.
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
  /// Returns a [Future] containing a [Response] with a [AdminVendorResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorResponseDto>> adminGetVendor({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}'.replaceAll('{' r'id' '}', id.toString());
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

  /// A vendor’s commission history, newest first
  /// Admin dashboard, vendor screen: every commission the vendor has had, in basis points, with the previous value and the admin who set it; the oldest entry is the commission set at approval. Entries are never changed or removed.  Paged by cursor, newest first, no total count: send the previous page&#39;s nextCursor as cursor; limit 1 to 50, default 20. NOT_FOUND for an unknown vendor.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorCommissionChangePageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorCommissionChangePageResponseDto>> adminListVendorCommissionChanges({ 
    required String id,
    String? cursor,
    num? limit = 20,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}/commission-history'.replaceAll('{' r'id' '}', id.toString());
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
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    VendorCommissionChangePageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorCommissionChangePageResponseDto, VendorCommissionChangePageResponseDto>(rawData, 'VendorCommissionChangePageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorCommissionChangePageResponseDto>(
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

  /// Vendors, newest first
  /// Admin dashboard, vendors list: every vendor, active and suspended, the platform vendor included (isPlatform), optionally only one status, one city (city, exact) and those matching a search (q: part of the store name in Arabic or English, any case, or of the commercial registration number; % and _ match themselves), with commission, masked IBAN and logo.  Paged by cursor, newest first, no total count: send the previous page&#39;s nextCursor as cursor; limit 1 to 50, default 20. VALIDATION_FAILED for an unknown status, a q shorter than 2 or longer than 100 characters, a cursor the API did not write or a limit out of range.
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [q] - Search: part of the store name in Arabic or English (any case) or of the commercial registration number (Latin or Arabic digits). 2 to 100 characters after trimming; % and _ match themselves.
  /// * [status] - Only vendors in this status: active or suspended. Omit it for every vendor, the platform vendor included.
  /// * [city] - Only vendors in exactly this city, as stored (trimmed; 2 to 50 characters). Vendors without a city are left out.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [AdminVendorPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorPageResponseDto>> adminListVendors({ 
    String? cursor,
    num? limit = 20,
    String? q,
    String? status,
    String? city,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors';
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
      if (city != null) r'city': city,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    AdminVendorPageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<AdminVendorPageResponseDto, AdminVendorPageResponseDto>(rawData, 'AdminVendorPageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<AdminVendorPageResponseDto>(
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

  /// Reinstate a suspended vendor
  /// Admin dashboard, vendor screen: makes a suspended vendor active again, with no body. Its users can sign in again and it is listed publicly again; the suspension time and reason are cleared. Audited.  Errors: NOT_FOUND for an unknown vendor. CONFLICT with details.reason VENDOR_NOT_SUSPENDED: it is active already (also when another admin reinstated it at the same moment); reload it. TRANSACTION_CONFLICT: nothing was saved; send again.
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
  /// Returns a [Future] containing a [Response] with a [AdminVendorResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorResponseDto>> adminReinstateVendor({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}/reinstate'.replaceAll('{' r'id' '}', id.toString());
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
      validateStatus: validateStatus,
    );

    final _response = await _dio.request<Object>(
      _path,
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

  /// Set a vendor’s commission for future orders
  /// Admin dashboard, vendor screen: sets the platform commission on the vendor&#39;s future orders, in basis points (a whole number from 0 to 10000; 1250 is 12.5%). Orders already placed keep the commission they were placed with. Each change is recorded in the commission history with the previous value, and audited; setting the commission the vendor already has changes and records nothing.  Errors: VALIDATION_FAILED for a fraction or a value out of range. NOT_FOUND for an unknown vendor. CONFLICT: another admin changed the commission at the same moment and nothing was saved; reload and decide again. TRANSACTION_CONFLICT: nothing was saved; send again.
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
  Future<Response<AdminVendorResponseDto>> adminSetVendorCommission({ 
    required String id,
    required CommissionDto commissionDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}/commission'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'PUT',
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

  /// Suspend an active vendor
  /// Admin dashboard, vendor screen: suspends an active vendor with a reason (1 to 500 characters, shown to admins). From the moment it is saved its users are refused on every vendor route, at sign-in and on refresh (VENDOR_SUSPENDED), and it disappears from the public vendor list and store page. Reinstate it to undo. Audited.  Errors: NOT_FOUND for an unknown vendor. CONFLICT with details.reason VENDOR_ALREADY_SUSPENDED: it is suspended already (also when another admin suspended it at the same moment); reload it. TRANSACTION_CONFLICT: nothing was saved; send again.
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
  /// Returns a [Future] containing a [Response] with a [AdminVendorResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorResponseDto>> adminSuspendVendor({ 
    required String id,
    required ReasonDto reasonDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}/suspend'.replaceAll('{' r'id' '}', id.toString());
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

  /// Change a vendor’s store profile
  /// Admin dashboard, vendor screen: changes any vendor&#39;s logo, cover photo, descriptions, contact phone, contact email, VAT number and city, the platform vendor included (it has no owner, so this is how its profile is set). Only an admin changes the city. Applied at once. Audited with the names of the fields given.  For a new logo or cover photo, upload it first as the signed-in admin (POST /v1/admin/media/uploads, purpose vendor.logo or vendor.cover: JPEG, PNG or WebP up to 2 MB), confirm it (POST /v1/admin/media/{id}/confirm), then send its id. A field left out stays as it is; logoMediaId, coverMediaId, contactPhone, contactEmail or vatNumber null removes it; the city can be changed, not removed; inside description, a language set to null or blank clears it. An empty body changes nothing.  Errors: VALIDATION_FAILED for a malformed field (isSaudiPhoneNumber, isEmail, matches on vatNumber, charLength on city). NOT_FOUND for an unknown vendor. MEDIA_NOT_FOUND (details.mediaId): no file of the right purpose (vendor.logo, vendor.cover) uploaded by this admin with that id (a file another user uploaded counts as missing). MEDIA_NOT_READY: the upload was not confirmed. TRANSACTION_CONFLICT: nothing was saved; send again.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [updateVendorProfileAsAdminDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [AdminVendorResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AdminVendorResponseDto>> adminUpdateVendorProfile({ 
    required String id,
    required UpdateVendorProfileAsAdminDto updateVendorProfileAsAdminDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/vendors/{id}/profile'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'PATCH',
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
_bodyData=jsonEncode(updateVendorProfileAsAdminDto);
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

}
