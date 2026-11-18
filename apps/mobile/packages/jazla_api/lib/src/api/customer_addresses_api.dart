//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/create_customer_address_dto.dart';
import 'package:jazla_api/src/model/customer_address_list_response_dto.dart';
import 'package:jazla_api/src/model/customer_address_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/update_customer_address_dto.dart';

class CustomerAddressesApi {

  final Dio _dio;

  const CustomerAddressesApi(this._dio);

  /// Save an address
  /// Customer app, \&quot;add address\&quot;: the customer picks a point on the map, the app fills the readable fields from it (reverse geocoding) and the customer may edit them. Saved at once. label and location are required; the readable fields are optional, and blank or null is saved as null. The first address becomes the default; isDefault true makes a later one the default instead of the current one. At most 10 addresses per customer. Whether the point is inside a delivery area is not checked here. ADDRESS_LIMIT_REACHED: the customer already has 10 (details.limit); nothing was saved, ask them to delete one first. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
  ///
  /// Parameters:
  /// * [createCustomerAddressDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CustomerAddressResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerAddressResponseDto>> customerCreateAddress({ 
    required CreateCustomerAddressDto createCustomerAddressDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses';
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
_bodyData=jsonEncode(createCustomerAddressDto);
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

    CustomerAddressResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerAddressResponseDto, CustomerAddressResponseDto>(rawData, 'CustomerAddressResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerAddressResponseDto>(
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

  /// Delete a saved address
  /// Customer app, the address book. Deletes the address at once and for good. When it was the default, the newest remaining address becomes the default (reload the list to show it); deleting the last one leaves none. Orders placed earlier keep the address as it was at checkout. NOT_FOUND: no such address, or it belongs to another customer; also when it was already deleted (a repeated request, or another device), so treat it as gone and reload the list. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
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
  /// Returns a [Future]
  /// Throws [DioException] if API call or serialization fails
  Future<Response<void>> customerDeleteAddress({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses/{id}'.replaceAll('{' r'id' '}', id.toString());
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

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    return _response;
  }

  /// One of my saved addresses
  /// Customer app, the edit address screen. Returns one saved address of the signed-in customer. VALIDATION_FAILED: the id is not a UUID. NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out.
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
  /// Returns a [Future] containing a [Response] with a [CustomerAddressResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerAddressResponseDto>> customerGetAddress({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses/{id}'.replaceAll('{' r'id' '}', id.toString());
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

    CustomerAddressResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerAddressResponseDto, CustomerAddressResponseDto>(rawData, 'CustomerAddressResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerAddressResponseDto>(
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

  /// My saved addresses
  /// Customer app, the address book and the delivery address picker at checkout. Returns every address of the customer (at most 10): the default first, then newest first. Not paged (no cursor, no limit): the list is short by rule. An empty list means none is saved yet. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out.
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CustomerAddressListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerAddressListResponseDto>> customerListAddresses({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses';
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

    CustomerAddressListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerAddressListResponseDto, CustomerAddressListResponseDto>(rawData, 'CustomerAddressListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerAddressListResponseDto>(
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

  /// Make an address my default
  /// Customer app, the address book (\&quot;set as default\&quot;). No request body. Applied at once: this address becomes the default and the old default stops being one, so exactly one address is the default. Sent for the address that is already the default, it changes nothing (safe to repeat). NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
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
  /// Returns a [Future] containing a [Response] with a [CustomerAddressResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerAddressResponseDto>> customerSetDefaultAddress({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses/{id}/default'.replaceAll('{' r'id' '}', id.toString());
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

    CustomerAddressResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerAddressResponseDto, CustomerAddressResponseDto>(rawData, 'CustomerAddressResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerAddressResponseDto>(
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

  /// Change a saved address
  /// Customer app, the edit address screen. Saves the fields sent at once; a field left out keeps its value. For the readable fields (city, district, street, building, shortNationalAddress, driverInstructions), null or blank clears the field. label and location can be changed but not removed (null is VALIDATION_FAILED). Whether the address is the default does not change here: use POST /v1/customer/addresses/{id}/default. Orders placed earlier keep the address as it was at checkout. NOT_FOUND: no such address, or it belongs to another customer (both answer the same); it may have been deleted on another device, so reload the list. ACCOUNT_DISABLED: the account was disabled by the platform; show a message, do not retry. UNAUTHORIZED can also mean the account was deleted while the token was still valid: sign out. TRANSACTION_CONFLICT: another change to this account was saved at the same moment; send the request again.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [updateCustomerAddressDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CustomerAddressResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CustomerAddressResponseDto>> customerUpdateAddress({ 
    required String id,
    required UpdateCustomerAddressDto updateCustomerAddressDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/customer/addresses/{id}'.replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(updateCustomerAddressDto);
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

    CustomerAddressResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CustomerAddressResponseDto, CustomerAddressResponseDto>(rawData, 'CustomerAddressResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CustomerAddressResponseDto>(
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
