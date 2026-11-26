//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/create_payment_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/order_with_payment_response_dto.dart';
import 'package:jazla_api/src/model/payment_method_list_response_dto.dart';
import 'package:jazla_api/src/model/place_order_dto.dart';

class CustomerCheckoutApi {

  final Dio _dio;

  const CustomerCheckoutApi(this._dio);

  /// Pay an unpaid order again
  /// Customer app, after a failed or abandoned payment, while the order is &#x60;pending_payment&#x60; (see &#x60;expiresAt&#x60;). One open payment per order: while the latest is still &#x60;initiated&#x60; with the same method, it is answered again (with its &#x60;nextAction&#x60;) and nothing new is made; with another method, PAYMENT_IN_PROGRESS (&#x60;details.paymentId&#x60;) until it ends. An &#x60;initiated&#x60; payment ends when the provider reports it, or 10 minutes after it started (then &#x60;cancelled&#x60;, checked when read, so another method can still be chosen before the order expires). &#x60;wallet&#x60; or a wallet part is taken at once; cash on delivery follows the confirmation setting. ORDER_NOT_PAYABLE: the order is paid, cancelled or expired. PAYMENT_METHOD_NOT_AVAILABLE (&#x60;details.method&#x60;); WALLET_INSUFFICIENT (&#x60;details.balanceHalalas&#x60;). NOT_FOUND for another customer’s order. Until PAY-API-1 lands: NOT_IMPLEMENTED.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [idempotencyKey] - A UUID the app makes once per attempt and sends again on a retry of the same attempt: the same key answers the first success again (the body is not compared); a refusal is not kept, so the same key may be sent again after fixing it. Missing or not a UUID: VALIDATION_FAILED on `Idempotency-Key`.
  /// * [createPaymentDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [OrderWithPaymentResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<OrderWithPaymentResponseDto>> customerCreateOrderPayment({ 
    required String id,
    required String idempotencyKey,
    required CreatePaymentDto createPaymentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/orders/{id}/payments'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        r'Idempotency-Key': idempotencyKey,
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
_bodyData=jsonEncode(createPaymentDto);
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

    OrderWithPaymentResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<OrderWithPaymentResponseDto, OrderWithPaymentResponseDto>(rawData, 'OrderWithPaymentResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<OrderWithPaymentResponseDto>(
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

  /// How I can pay
  /// Customer app, checkout payment step (or paying an unpaid order again with &#x60;orderId&#x60;): the methods for the cart’s (or the order’s) total and kinds, and the wallet balance. NOT_FOUND for an order that is not the customer’s; ORDER_NOT_PAYABLE for one no longer waiting for payment; CART_EMPTY without &#x60;orderId&#x60; and an empty cart. Sprint 3 lists cash on delivery only, with a wallet balance of 0; paying again with &#x60;orderId&#x60; answers NOT_IMPLEMENTED until PAY-API-1 lands.
  ///
  /// Parameters:
  /// * [orderId] - An unpaid order of the customer (UUID), to pay again; left out: the cart.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [PaymentMethodListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<PaymentMethodListResponseDto>> customerListPaymentMethods({ 
    String? orderId,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/checkout/payment-methods';
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
      if (orderId != null) r'orderId': orderId,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    PaymentMethodListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<PaymentMethodListResponseDto, PaymentMethodListResponseDto>(rawData, 'PaymentMethodListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<PaymentMethodListResponseDto>(
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

  /// Place my order
  /// Customer app, checkout \&quot;place order\&quot;. Checks the cart again, then in one transaction: reserves the day’s capacity, uses the coupon, takes the wallet part, creates the order (&#x60;pending_payment&#x60;, or &#x60;new&#x60;/&#x60;confirmed&#x60; for cash on delivery and wallet only) and its payment attempt, and empties the cart. Open &#x60;payment.nextAction.redirectUrl&#x60; when it is not null; an unpaid order is cancelled after 15 minutes (&#x60;order.expiresAt&#x60;), giving back the capacity, the coupon and the wallet part. Refusals send the customer back: to the cart for CART_EMPTY, PRICE_CHANGED and ITEM_UNAVAILABLE (&#x60;details.lineIds&#x60;), MIN_ORDER_NOT_MET (&#x60;details.minOrderHalalas&#x60;, &#x60;details.remainingHalalas&#x60;) and the coupon codes; to the fulfilment step for FULFILMENT_REQUIRED, ADDRESS_NOT_COVERED, DAY_FULL and DAY_NOT_AVAILABLE; to the payment step for PAYMENT_METHOD_NOT_AVAILABLE and WALLET_INSUFFICIENT; to the profile for PROFILE_INCOMPLETE (no full name). ORDERING_PAUSED while orders are paused (&#x60;details.messageAr&#x60;, &#x60;details.messageEn&#x60;: the admin’s message). Until ORD-API-1 lands: NOT_IMPLEMENTED.
  ///
  /// Parameters:
  /// * [idempotencyKey] - A UUID the app makes once per attempt and sends again on a retry of the same attempt: the same key answers the first success again (the body is not compared); a refusal is not kept, so the same key may be sent again after fixing it. Missing or not a UUID: VALIDATION_FAILED on `Idempotency-Key`.
  /// * [placeOrderDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [OrderWithPaymentResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<OrderWithPaymentResponseDto>> customerPlaceOrder({ 
    required String idempotencyKey,
    required PlaceOrderDto placeOrderDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/orders';
    final _options = Options(
      method: r'POST',
      headers: <String, dynamic>{
        r'Idempotency-Key': idempotencyKey,
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
_bodyData=jsonEncode(placeOrderDto);
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

    OrderWithPaymentResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<OrderWithPaymentResponseDto, OrderWithPaymentResponseDto>(rawData, 'OrderWithPaymentResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<OrderWithPaymentResponseDto>(
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
