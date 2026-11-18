//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/auth_tokens_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/otp_requested_response_dto.dart';
import 'package:jazla_api/src/model/refresh_token_dto.dart';
import 'package:jazla_api/src/model/request_otp_dto.dart';
import 'package:jazla_api/src/model/signed_in_response_dto.dart';
import 'package:jazla_api/src/model/verify_otp_dto.dart';

class PublicAuthApi {

  final Dio _dio;

  const PublicAuthApi(this._dio);

  /// Sign out of the session the refresh token belongs to
  /// Called by every app on \&quot;Sign out\&quot;: ends the session named by the refresh token, so it works even after the access token has expired; then delete both tokens from the device. Always 204, also for an unknown token or a session already ended. The access token keeps working until it expires (15 minutes by default).
  ///
  /// Parameters:
  /// * [refreshTokenDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future]
  /// Throws [DioException] if API call or serialization fails
  Future<Response<void>> publicLogout({ 
    required RefreshTokenDto refreshTokenDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/auth/logout';
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(refreshTokenDto);
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

    return _response;
  }

  /// Exchange the refresh token for a new pair
  /// Called by every app when a request answers 401 ACCESS_TOKEN_EXPIRED (or shortly before the access token expires): returns a new access token and a new refresh token for the same session. Store the new refresh token at once: each refresh token works once, and presenting a used one again ends the session for every holder. If the answer to a refresh is lost, the user signs in again, so send one refresh at a time per session.  Errors: - REFRESH_TOKEN_INVALID (401): unknown, expired or already used token, or the session has ended (signed out, account deleted, staff access removed). Go to the sign-in screen; do not retry. - ACCOUNT_DISABLED (403): the account is disabled and the session has ended; show the support message. - VENDOR_SUSPENDED (403): vendor sessions only; the store is suspended and the session has ended. - TRANSACTION_CONFLICT (409): a rare clash with another change to the same session; send the same request again. - SERVICE_UNAVAILABLE (503): the database cannot be reached; retry shortly with the same refresh token.
  ///
  /// Parameters:
  /// * [refreshTokenDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [AuthTokensResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<AuthTokensResponseDto>> publicRefreshSession({ 
    required RefreshTokenDto refreshTokenDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/auth/refresh';
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(refreshTokenDto);
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

    AuthTokensResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<AuthTokensResponseDto, AuthTokensResponseDto>(rawData, 'AuthTokensResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<AuthTokensResponseDto>(
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

  /// Send a verification code to a phone number
  /// Step 1 of signing in, from the phone number screen of every app: the customer app sends &#x60;audience: customer&#x60;, the vendor, kitchen and admin dashboards their own audience. The code arrives by SMS (in the language of &#x60;Accept-Language&#x60;, Arabic by default); the app then shows the code screen and calls &#x60;POST /v1/public/auth/otp/verify&#x60; with the same phone and audience.  The answer is the same whether or not the phone may sign in to a staff audience (vendor, kitchen, admin): a phone without that access gets the same 200 but no SMS, and any code it sends is then refused as OTP_INVALID. A new code replaces the previous one, which stops working. Phones set up for app-store review receive no SMS and sign in with the fixed code given to the reviewer.  Errors: - RATE_LIMITED (429, &#x60;Retry-After&#x60; in seconds): asked again before &#x60;resendAfterSeconds&#x60; passed, too many codes for this phone and audience (3 per 10 minutes by default; customers also 10 per day), or too many requests from this network address. Show a countdown from &#x60;Retry-After&#x60;. - SERVICE_UNAVAILABLE (503): the SMS could not be sent, or the limits cannot be checked right now. No code was sent; the user may try again shortly.
  ///
  /// Parameters:
  /// * [requestOtpDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [OtpRequestedResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<OtpRequestedResponseDto>> publicRequestOtp({ 
    required RequestOtpDto requestOtpDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/auth/otp/request';
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(requestOtpDto);
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

    OtpRequestedResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<OtpRequestedResponseDto, OtpRequestedResponseDto>(rawData, 'OtpRequestedResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<OtpRequestedResponseDto>(
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

  /// Sign in with the verification code
  /// Step 2 of signing in, from the code screen of every app: exchanges the code sent by &#x60;POST /v1/public/auth/otp/request&#x60; for an access token and a refresh token of that one audience. Only the newest code of the phone and audience works, once, before it expires, and for a limited number of attempts (5 by default). A customer signing in for the first time gets a new account; staff need access granted by an admin.  Keep the refresh token in secure storage and send the access token as &#x60;Authorization: Bearer &lt;token&gt;&#x60;. For a customer, &#x60;profileComplete&#x60; false means the app may show the profile completion screen (skippable).  Errors: - OTP_INVALID (422): the code is wrong, or the phone has no access to this staff audience. The attempt is counted; let the user retype it. - OTP_EXPIRED (410): no code can be verified any more (none requested, expired, already used, or attempts used up). Ask for a new code. - ACCOUNT_DISABLED (403): the account is disabled; signing in again will not help (contact support). - VENDOR_SUSPENDED (403): vendor sign-in only; the store is suspended until an admin reinstates it. - TRANSACTION_CONFLICT (409): a rare clash with another change to the same account; send the same request again. - RATE_LIMITED (429): too many attempts from this network address; wait &#x60;Retry-After&#x60; seconds. - SERVICE_UNAVAILABLE (503): the limits cannot be checked or the database cannot be reached right now; retry shortly.
  ///
  /// Parameters:
  /// * [verifyOtpDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [SignedInResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<SignedInResponseDto>> publicVerifyOtp({ 
    required VerifyOtpDto verifyOtpDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/auth/otp/verify';
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      contentType: 'application/json',
      validateStatus: validateStatus,
    );

    dynamic _bodyData;

    try {
_bodyData=jsonEncode(verifyOtpDto);
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

    SignedInResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<SignedInResponseDto, SignedInResponseDto>(rawData, 'SignedInResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<SignedInResponseDto>(
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
