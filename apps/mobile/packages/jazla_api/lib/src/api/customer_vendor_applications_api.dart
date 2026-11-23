//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/submit_vendor_application_dto.dart';
import 'package:jazla_api/src/model/vendor_application_response_dto.dart';

class CustomerVendorApplicationsApi {

  final Dio _dio;

  const CustomerVendorApplicationsApi(this._dio);

  /// My newest vendor application
  /// Customer app, \&quot;sell on JAZLA\&quot; screen: the signed-in customer’s most recent application, to show where its review is. pending: waiting for an admin. approved: sign in to the vendor dashboard. rejected: show rejectionReason and offer to apply again.  NOT_FOUND when this customer never applied: show the application form.
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorApplicationResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorApplicationResponseDto>> customerGetLatestVendorApplication({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/vendor-applications/latest';
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

  /// Apply to become a vendor
  /// Customer app, \&quot;sell on JAZLA\&quot; form: the signed-in customer applies to become a vendor. The application is created pending and waits for an admin; nothing is published until it is approved, when the applicant gets vendor access and signs in to the vendor dashboard with the same phone number.  Before sending, upload each document (POST /v1/customer/media/uploads, purpose vendor.document: PDF, JPEG or PNG up to 10 MB) and confirm it (POST /v1/customer/media/{id}/confirm). Send at least one document of each kind (commercial_registration, health_certificate, facility_photo), each file once, at most 10 in all. The IBAN is checked as a Saudi IBAN and never returned in full.  Errors: VALIDATION_FAILED names the field (documents with requiresEachDocumentKind, uniqueFiles or arrayMaxSize; iban with isSaudiIban). MEDIA_NOT_FOUND (details.mediaId): no such file uploaded by this user with purpose vendor.document. MEDIA_NOT_READY (details.mediaId): the upload was not confirmed. VENDOR_APPLICATION_ALREADY_PENDING: one application is already waiting; show it (GET latest) instead. VENDOR_ACCESS_ALREADY_HELD: this user already works for a vendor. VENDOR_CR_EXISTS: a store with this commercial registration number is registered already. UNAUTHORIZED also when the account was deleted. TRANSACTION_CONFLICT: send again.
  ///
  /// Parameters:
  /// * [submitVendorApplicationDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorApplicationResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorApplicationResponseDto>> customerSubmitVendorApplication({ 
    required SubmitVendorApplicationDto submitVendorApplicationDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/vendor-applications';
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
_bodyData=jsonEncode(submitVendorApplicationDto);
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
