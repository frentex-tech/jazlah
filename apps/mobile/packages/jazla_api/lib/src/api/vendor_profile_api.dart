//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/update_vendor_profile_dto.dart';
import 'package:jazla_api/src/model/vendor_profile_response_dto.dart';

class VendorProfileApi {

  final Dio _dio;

  const VendorProfileApi(this._dio);

  /// My store profile
  /// Vendor dashboard, store profile screen: the store the signed-in vendor user works for (always the one in the access token), with its logo, cover photo, descriptions, city, contact phone and email, VAT number, commission in basis points and business and bank details (the IBAN masked).  The name, commercial registration, bank details, location and city come from the approved application and only an admin can change them; the vendor changes the logo, cover photo, descriptions, contact phone and email and VAT number (PATCH). VENDOR_SUSPENDED: the store is suspended; sign the user out and explain.
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorProfileResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorProfileResponseDto>> vendorGetProfile({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/profile';
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

    VendorProfileResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorProfileResponseDto, VendorProfileResponseDto>(rawData, 'VendorProfileResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorProfileResponseDto>(
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

  /// Change my store profile
  /// Vendor dashboard, store profile screen: the vendor changes its own logo, cover photo, descriptions, contact phone, contact email and VAT number. Applied at once, with no review; customers see the logo, cover and descriptions on the next read (the contact details and VAT number are never public). The city is not changed here: an admin sets it.  For a new logo or cover photo, upload it first (POST /v1/vendor/media/uploads, purpose vendor.logo or vendor.cover: JPEG, PNG or WebP up to 2 MB), confirm it (POST /v1/vendor/media/{id}/confirm), then send its id. A field left out stays as it is; logoMediaId, coverMediaId, contactPhone, contactEmail or vatNumber null removes it; inside description, a language set to null or blank clears it. An empty body changes nothing.  Errors: VALIDATION_FAILED for a malformed field (isSaudiPhoneNumber: not a Saudi mobile or landline; isEmail; matches on vatNumber) or a city in the body. MEDIA_NOT_FOUND (details.mediaId): no file of the right purpose (vendor.logo for the logo, vendor.cover for the cover) uploaded by this user with that id. MEDIA_NOT_READY: the upload was not confirmed.
  ///
  /// Parameters:
  /// * [updateVendorProfileDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [VendorProfileResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<VendorProfileResponseDto>> vendorUpdateProfile({ 
    required UpdateVendorProfileDto updateVendorProfileDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/profile';
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
_bodyData=jsonEncode(updateVendorProfileDto);
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

    VendorProfileResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<VendorProfileResponseDto, VendorProfileResponseDto>(rawData, 'VendorProfileResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<VendorProfileResponseDto>(
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
