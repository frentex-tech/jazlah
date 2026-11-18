//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/customer_me_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';

class CustomerAccountApi {

  final Dio _dio;

  const CustomerAccountApi(this._dio);

  /// Delete my account
  /// Customer app, account screen (\&quot;Delete my account\&quot;), after the customer confirms. At once and for good: every session of the user ends (in every app), the profile, addresses and vendor applications not yet approved are removed, and the phone can sign up again as a new user. Afterwards delete the tokens from the device and go to the sign-in screen. The optional &#x60;reason&#x60; comes from a fixed list the app shows.  Errors: - RECENT_SIGN_IN_REQUIRED (403): the session was signed in more than 10 minutes ago. Sign the customer in again (code by SMS), then repeat the request. - ACCOUNT_HAS_STAFF_ACCESS (409): the account also has vendor, kitchen or admin access; it cannot be deleted in the app until that access is removed. - ACCOUNT_DISABLED (403): the account is disabled; deletion goes through support. - UNAUTHORIZED (401): also when the account is already deleted. - TRANSACTION_CONFLICT (409): a rare clash with another change to the same account; nothing was deleted, send the same request again.
  ///
  /// Parameters:
  /// * [reason] - Optional: why the customer leaves, one value of a fixed list the app shows (`not_using`, `privacy`, `bad_experience`, `other_account`, `other`; never free text). Kept in the audit log, with nothing that identifies the customer.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future]
  /// Throws [DioException] if API call or serialization fails
  Future<Response<void>> customerDeleteAccount({ 
    String? reason,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/me';
    final _options = Options(
      method: r'DELETE',
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
      if (reason != null) r'reason': reason,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    return _response;
  }

  /// Who is signed in, with my profile
  /// Customer app, at start-up and on the account screen: the signed-in customer, their own phone number in full (the only response that shows it unmasked), the profile and the marketing consent. &#x60;profileComplete&#x60; false: the app may show the profile completion screen.  Errors: - UNAUTHORIZED (401): also when the account has been deleted since the token was issued; go to the sign-in screen. - ACCOUNT_DISABLED (403): the account is disabled; show the support message.
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CustomerMeResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerMeResponseDto>> customerGetMe({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/me';
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

    CustomerMeResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerMeResponseDto, CustomerMeResponseDto>(rawData, 'CustomerMeResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerMeResponseDto>(
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

  /// Sign out of every customer session of this user
  /// Customer app, account or security screen (\&quot;Sign out of all devices\&quot;): ends every customer session of the user, this one included, so every refresh token stops working; delete the tokens from this device afterwards. Sessions of the same person in the vendor, kitchen or admin dashboards are not touched. Access tokens already issued keep working until they expire (15 minutes by default).
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future]
  /// Throws [DioException] if API call or serialization fails
  Future<Response<void>> customerLogoutAll({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/auth/logout-all';
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

    return _response;
  }

}
