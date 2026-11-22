//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/checkout_day_list_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/fulfilment_method.dart';

class CustomerSchedulingApi {

  final Dio _dio;

  const CustomerSchedulingApi(this._dio);

  /// Days I can choose
  /// Customer app, checkout day picker. Every day of the booking horizon from today (Riyadh), for the cart’s store and kinds of order: the cut-offs and lead days, closed days, the store’s capacity and, for pickup, its hours decide each day. Refetch after changing the method or the address. Unpaid orders past &#x60;expiresAt&#x60; no longer count against a day. CART_EMPTY for an empty cart; FULFILMENT_NOT_SUPPORTED when the cart’s products do not allow the method. ORDERING_PAUSED while orders are paused (&#x60;details.messageAr&#x60;, &#x60;details.messageEn&#x60;: the admin’s message). Until SCH-API-2 lands: NOT_IMPLEMENTED.
  ///
  /// Parameters:
  /// * [method] - `delivery` or `pickup`.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CheckoutDayListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CheckoutDayListResponseDto>> customerListCheckoutDays({ 
    required FulfilmentMethod method,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/checkout/days';
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
      r'method': method,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    CheckoutDayListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CheckoutDayListResponseDto, CheckoutDayListResponseDto>(rawData, 'CheckoutDayListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CheckoutDayListResponseDto>(
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
