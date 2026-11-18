//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/change_product_prices_dto.dart';
import 'package:jazla_api/src/model/create_product_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/product_card_page_response_dto.dart';
import 'package:jazla_api/src/model/product_content_dto.dart';
import 'package:jazla_api/src/model/product_response_dto.dart';
import 'package:jazla_api/src/model/reason_dto.dart';
import 'package:jazla_api/src/model/set_product_availability_dto.dart';
import 'package:jazla_api/src/model/set_product_fulfilment_dto.dart';

class AdminProductsApi {

  final Dio _dio;

  const AdminProductsApi(this._dio);

  /// Approve a product under review: it is published
  /// Admin dashboard, review queue. Moves a &#x60;pending_review&#x60; product to &#x60;published&#x60;: customers see it at once if it is available, its vendor active and its category active. Later content edits by the vendor go through change requests. Recorded in the audit log. No body. Errors: PRODUCT_NOT_EDITABLE when the product is not under review, also when another admin decided first (&#x60;details.status&#x60;; reload the queue); NOT_FOUND for an unknown id.
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
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminApproveProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/approve'.replaceAll('{' r'id' '}', id.toString());
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Change a JAZLA product’s prices, at once
  /// Admin dashboard, JAZLA products, prices form. Sets new prices for some of the product’s existing sizes (by size id), cutting styles (by cutting style id) and packagings (by packaging); the others keep theirs. Integer halalas, VAT included. Applies at once, also on a published product; the lowest price is updated and each price that actually changed is recorded in the audit log. Errors: VALIDATION_FAILED for a size, cutting style or packaging that is not the product’s (&#x60;isSizeOfProduct&#x60;, &#x60;isCuttingOfProduct&#x60;, &#x60;isPackagingOfProduct&#x60;) or named twice (&#x60;isNotRepeated&#x60;); PRODUCT_NOT_EDITABLE for a product under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [changeProductPricesDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminChangePlatformProductPrices({ 
    required String id,
    required ChangeProductPricesDto changeProductPricesDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/prices'.replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(changeProductPricesDto);
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Create a JAZLA product (a draft of the platform vendor)
  /// Admin dashboard, JAZLA products, new product form. JAZLA sells its own products through the platform vendor, and admins write them directly, with no review. Creates a &#x60;draft&#x60; of the platform vendor, available, with the content and fulfilment sent; publish it with POST …/{id}/publish. Upload each image first (POST /v1/admin/media/uploads with purpose &#x60;catalog.product-image&#x60;, then POST /v1/admin/media/{id}/confirm) and send the media ids in display order: the first is the cover. A draft may be incomplete. Prices are integer halalas, VAT included. Errors: VALIDATION_FAILED also for an inactive category, meat type, cutting style or \&quot;without\&quot; item, or a repeat; MEDIA_NOT_FOUND / MEDIA_NOT_READY for an image not uploaded and confirmed by this admin (&#x60;details.mediaId&#x60;); NOT_FOUND with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
  ///
  /// Parameters:
  /// * [createProductDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminCreatePlatformProduct({ 
    required CreateProductDto createProductDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products';
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
_bodyData=jsonEncode(createProductDto);
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// One product of any vendor, with its latest change request
  /// Admin dashboard, product page and review screens. Any vendor’s product as it is live (or as the draft stands), with its status, review fields and latest change request (the pending one, or the last decided one; null for none). Open it beside a change request to compare the live product with the proposed content. NOT_FOUND for an unknown id.
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
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminGetProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}'.replaceAll('{' r'id' '}', id.toString());
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Products of every vendor, newest first
  /// Admin dashboard, products and the review queue. Products of every vendor (JAZLA’s own included) in every status, newest first, optionally of one &#x60;status&#x60; and one &#x60;vendorId&#x60;. &#x60;status&#x3D;pending_review&#x60; is the review queue of new products (approve or reject them with POST …/{id}/approve and …/{id}/reject); edits of published products wait in GET /v1/admin/product-change-requests instead. Keyset paging: send &#x60;nextCursor&#x60; back as &#x60;cursor&#x60; until it is null; no total count.
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [status] - Only products in this status: `draft` (not yet submitted), `pending_review` (waiting for admin review), `published` (live), `rejected` (sent back with a reason). Left out: every status.
  /// * [vendorId] - Only the products of this vendor (its id, a UUID; JAZLA’s own products are those of the platform vendor). Left out: every vendor.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductCardPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductCardPageResponseDto>> adminListProducts({ 
    String? cursor,
    num? limit = 20,
    String? status,
    String? vendorId,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products';
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
      if (status != null) r'status': status,
      if (vendorId != null) r'vendorId': vendorId,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    ProductCardPageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductCardPageResponseDto, ProductCardPageResponseDto>(rawData, 'ProductCardPageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductCardPageResponseDto>(
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

  /// Publish a JAZLA draft directly
  /// Admin dashboard, JAZLA products. Moves a platform vendor &#x60;draft&#x60; straight to &#x60;published&#x60;, without review; customers see it at once if it is available and its category active. Recorded in the audit log. No body. Errors: PRODUCT_NOT_SUBMITTABLE without a size or an image, or with a cutting style offered with a packaging it cannot be combined with (&#x60;details.reasons&#x60;, &#x60;details.pairs&#x60;); PRODUCT_NOT_EDITABLE when the product is not a draft (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
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
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminPublishPlatformProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/publish'.replaceAll('{' r'id' '}', id.toString());
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Reject a product under review with a reason
  /// Admin dashboard, review queue. Moves a &#x60;pending_review&#x60; product to &#x60;rejected&#x60; with the reason the vendor reads on the product (&#x60;rejectionReason&#x60;); the vendor edits it and submits it again. Recorded in the audit log. Errors: PRODUCT_NOT_EDITABLE when the product is not under review, also when another admin decided first (&#x60;details.status&#x60;; reload the queue); NOT_FOUND for an unknown id.
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
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminRejectProduct({ 
    required String id,
    required ReasonDto reasonDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/reject'.replaceAll('{' r'id' '}', id.toString());
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Switch a JAZLA product on or off, at once
  /// Admin dashboard, JAZLA products, the availability switch. Applies at once, also on a published product: an unavailable product leaves the public catalog until it is switched on again. Errors: PRODUCT_NOT_EDITABLE for a product under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [setProductAvailabilityDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminSetPlatformProductAvailability({ 
    required String id,
    required SetProductAvailabilityDto setProductAvailabilityDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/availability'.replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(setProductAvailabilityDto);
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Set delivery, pickup or both on a JAZLA product, at once
  /// Admin dashboard, JAZLA products. Sets how the product reaches the customer: &#x60;delivery&#x60;, &#x60;pickup&#x60; or &#x60;both&#x60;. Applies at once, also on a published product. Errors: PRODUCT_NOT_EDITABLE for a product under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [setProductFulfilmentDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminSetPlatformProductFulfilment({ 
    required String id,
    required SetProductFulfilmentDto setProductFulfilmentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}/fulfilment'.replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(setProductFulfilmentDto);
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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

  /// Replace a JAZLA product’s content
  /// Admin dashboard, JAZLA products, edit form. Replaces the whole content of a platform vendor product (send every field, lists in display order); availability, fulfilment and prices have their own endpoints. Applies at once, also when published: no change request. An edit of a published product is recorded in the audit log and must meet the submission rules (at least one size and one image, no cutting style offered with a packaging it cannot be combined with). Keep an existing size by sending its &#x60;id&#x60;; a size left out is removed; a size without &#x60;id&#x60; is new. Existing sizes, cutting styles and packagings must carry their current prices (VALIDATION_FAILED &#x60;isLivePrice&#x60;): change them with PATCH …/{id}/prices. Errors: VALIDATION_FAILED also for an inactive reference, a size id not of this product or a repeat; MEDIA_NOT_FOUND / MEDIA_NOT_READY for a new image not uploaded and confirmed by this admin; PRODUCT_NOT_SUBMITTABLE (published only) with &#x60;details.reasons&#x60; and &#x60;details.pairs&#x60;; PRODUCT_NOT_EDITABLE for a product under review; NOT_FOUND for an unknown id or a product of another vendor (admins act on other vendors’ products only through review), and with &#x60;details.reason&#x60; PLATFORM_VENDOR_MISSING while JAZLA’s own vendor has not been set up.
  ///
  /// Parameters:
  /// * [id] - The id (a UUID) of the item the path names; another value is VALIDATION_FAILED on `id`.
  /// * [productContentDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductResponseDto>> adminUpdatePlatformProductContent({ 
    required String id,
    required ProductContentDto productContentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/products/{id}'.replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(productContentDto);
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

    ProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ProductResponseDto, ProductResponseDto>(rawData, 'ProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ProductResponseDto>(
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
