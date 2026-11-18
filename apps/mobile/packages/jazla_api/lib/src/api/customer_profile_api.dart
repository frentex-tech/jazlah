//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/customer_profile_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/marketing_consent_response_dto.dart';
import 'package:jazla_api/src/model/set_marketing_consent_dto.dart';
import 'package:jazla_api/src/model/update_customer_profile_dto.dart';

class CustomerProfileApi {

  final Dio _dio;

  const CustomerProfileApi(this._dio);

  /// Grant or withdraw my marketing consent
  /// Customer app, the marketing messages switch (settings, or the consent step after sign-up). Marketing is opt-in: until the customer grants it, the consent is not granted. Applied at once. Each change is recorded and kept, so the consent can be proven later; sending the current choice again records nothing and returns it unchanged (safe to repeat). The current consent is also part of GET /v1/customer/me. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
  ///
  /// Parameters:
  /// * [setMarketingConsentDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [MarketingConsentResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<MarketingConsentResponseDto>> customerSetMarketingConsent({ 
    required SetMarketingConsentDto setMarketingConsentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/profile/marketing-consent';
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
_bodyData=jsonEncode(setMarketingConsentDto);
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

    MarketingConsentResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<MarketingConsentResponseDto, MarketingConsentResponseDto>(rawData, 'MarketingConsentResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<MarketingConsentResponseDto>(
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

  /// Update my profile
  /// Customer app, the profile screen (and the name step after the first sign-in). Saves the fields sent at once; a field left out keeps its value. fullName and preferredLanguage can be changed but not removed (null is VALIDATION_FAILED); email null or blank removes it. The profile is complete once it has a full name: the app can be used without one, but placing an order will require it. Returns the whole profile; read it later with GET /v1/customer/me. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
  ///
  /// Parameters:
  /// * [updateCustomerProfileDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CustomerProfileResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerProfileResponseDto>> customerUpdateProfile({ 
    required UpdateCustomerProfileDto updateCustomerProfileDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/profile';
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
_bodyData=jsonEncode(updateCustomerProfileDto);
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

    CustomerProfileResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerProfileResponseDto, CustomerProfileResponseDto>(rawData, 'CustomerProfileResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerProfileResponseDto>(
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
