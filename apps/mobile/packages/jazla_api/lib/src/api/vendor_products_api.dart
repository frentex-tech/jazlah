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
import 'package:jazla_api/src/model/set_product_availability_dto.dart';
import 'package:jazla_api/src/model/set_product_fulfilment_dto.dart';

class VendorProductsApi {

  final Dio _dio;

  const VendorProductsApi(this._dio);

  /// Change size, cutting and packaging prices
  /// Vendor dashboard, prices form. Sets new prices for some of the product’s existing sizes (by size id), cutting styles (by cutting style id) and packagings (by packaging); the others keep theirs. Prices are integer halalas, VAT included. Applies at once in every status but &#x60;pending_review&#x60;, also on a published product: no review; the lowest price is updated and each price that actually changed is recorded in the audit log. A pending change request is not touched. Errors: VALIDATION_FAILED for an invalid body, a size, cutting style or packaging that is not the product’s (&#x60;isSizeOfProduct&#x60;, &#x60;isCuttingOfProduct&#x60;, &#x60;isPackagingOfProduct&#x60;) or named twice (&#x60;isNotRepeated&#x60;); PRODUCT_NOT_EDITABLE while the product is under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or another vendor’s product.
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
  Future<Response<ProductResponseDto>> vendorChangeProductPrices({ 
    required String id,
    required ChangeProductPricesDto changeProductPricesDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}/prices'.replaceAll('{' r'id' '}', id.toString());
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

  /// Create a draft product
  /// Vendor dashboard, new product form. Creates a product of the signed-in vendor in status &#x60;draft&#x60;, available, with the content and fulfilment sent; nobody but the vendor and admins sees it until it is published. Upload each image first (POST /v1/vendor/media/uploads with purpose &#x60;catalog.product-image&#x60;, then POST /v1/vendor/media/{id}/confirm) and send the media ids in display order: the first is the cover. A draft may be incomplete (no size, no image): the submission rules apply only when it is submitted (POST …/{id}/submit). Prices are integer halalas, VAT included (&#x60;95000&#x60; is 950.00 SAR). Errors: VALIDATION_FAILED for an invalid body and also, with field details, for a category, meat type, cutting style or \&quot;without\&quot; item that is not an active entry (&#x60;isActiveCategory&#x60;, &#x60;isActiveMeatType&#x60;, &#x60;isActiveCuttingStyle&#x60;, &#x60;isActiveExclusionItem&#x60;) or a repeated cutting style (&#x60;isNotRepeated&#x60;); MEDIA_NOT_FOUND for an image id that is not a product image uploaded by this user; MEDIA_NOT_READY for an image whose upload was not confirmed (&#x60;details.mediaId&#x60; names it).
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
  Future<Response<ProductResponseDto>> vendorCreateProduct({ 
    required CreateProductDto createProductDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products';
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

  /// One of my products
  /// Vendor dashboard, product page and edit form. The product as it is live (or as the draft stands), with its status, the admin’s rejection reason when &#x60;rejected&#x60;, and its latest change request: the pending one with the proposed content, or the last decided one (approved, rejected with its reason, or superseded); null when there has never been one. NOT_FOUND for an unknown id and for another vendor’s product, answered the same way.
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
  Future<Response<ProductResponseDto>> vendorGetProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}'.replaceAll('{' r'id' '}', id.toString());
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

  /// My products, newest first
  /// Vendor dashboard, products list. The signed-in vendor’s own products in every status, newest first, optionally of one status (&#x60;draft&#x60;, &#x60;pending_review&#x60;, &#x60;published&#x60;, &#x60;rejected&#x60;). Keyset paging: send &#x60;nextCursor&#x60; back as &#x60;cursor&#x60; until it is null; no total count. Each card carries the lowest size price in halalas (VAT included) and the cover image URL. A pending change request does not show here: open the product (GET …/{id}).
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [status] - Only products in this status: `draft` (not yet submitted), `pending_review` (waiting for admin review), `published` (live), `rejected` (sent back with a reason). Left out: every status.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductCardPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductCardPageResponseDto>> vendorListProducts({ 
    String? cursor,
    num? limit = 20,
    String? status,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products';
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

  /// Switch a product on or off
  /// Vendor dashboard, the availability switches (out of stock, back in stock): the product, and optionally some of its sizes. Applies at once in every status but &#x60;pending_review&#x60;, also on a published product: no review. An unavailable published product leaves the public list at once (its page shows it out of stock) and comes back when switched on; an unavailable size stays on the page, not orderable. Errors: VALIDATION_FAILED for a size not of this product (&#x60;isSizeOfProduct&#x60;) or named twice (&#x60;isNotRepeated&#x60;); PRODUCT_NOT_EDITABLE while the product is under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or another vendor’s product.
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
  Future<Response<ProductResponseDto>> vendorSetProductAvailability({ 
    required String id,
    required SetProductAvailabilityDto setProductAvailabilityDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}/availability'.replaceAll('{' r'id' '}', id.toString());
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

  /// Set delivery, pickup or both
  /// Vendor dashboard, product page. Sets how the product reaches the customer: &#x60;delivery&#x60;, &#x60;pickup&#x60; or &#x60;both&#x60;. Applies at once in every status but &#x60;pending_review&#x60;, also on a published product: no review. Errors: PRODUCT_NOT_EDITABLE while the product is under review (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or another vendor’s product.
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
  Future<Response<ProductResponseDto>> vendorSetProductFulfilment({ 
    required String id,
    required SetProductFulfilmentDto setProductFulfilmentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}/fulfilment'.replaceAll('{' r'id' '}', id.toString());
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

  /// Send a draft or rejected product to review
  /// Vendor dashboard, \&quot;submit for review\&quot; on a draft or rejected product. Moves it to &#x60;pending_review&#x60;, where admins approve it (it becomes &#x60;published&#x60;) or reject it with a reason (&#x60;rejected&#x60;, editable and submittable again). While under review the product cannot be edited. No body. Errors: PRODUCT_NOT_SUBMITTABLE when the product has no size or no image: &#x60;details.reasons&#x60; lists every reason (NO_SIZE, NO_IMAGE); the cutting and packaging rules do not block a submission; PRODUCT_NOT_EDITABLE when the product is already under review or published (&#x60;details.status&#x60;); NOT_FOUND for an unknown id or another vendor’s product.
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
  Future<Response<ProductResponseDto>> vendorSubmitProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}/submit'.replaceAll('{' r'id' '}', id.toString());
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

  /// Replace a product’s content
  /// Vendor dashboard, edit product form. Replaces the whole content (names, description, category, meat type, images, sizes, cutting styles, packagings, \&quot;without\&quot; items); send every field, lists in display order. Availability, fulfilment and prices have their own endpoints and are not changed here. By status: &#x60;draft&#x60; or &#x60;rejected&#x60;: saved at once (a rejected product stays rejected until submitted again). &#x60;published&#x60;: nothing changes on the live product; the edit becomes a new pending change request for admin review (any pending one is closed as &#x60;superseded&#x60;), returned in &#x60;changeRequest&#x60;, and it must meet the submission rules (at least one size and one image; an incompatible cutting and packaging pair is refused when the customer picks it, not here). &#x60;pending_review&#x60;: refused with PRODUCT_NOT_EDITABLE until an admin decides. Keep an existing size by sending its &#x60;id&#x60;; a size left out is removed; a size without &#x60;id&#x60; is new. Existing sizes, cutting styles and packagings must carry their current prices (VALIDATION_FAILED &#x60;isLivePrice&#x60;): change prices with PATCH …/{id}/prices, which applies at once. New sizes, cutting styles and packagings take the prices sent (halalas, VAT included). Errors: VALIDATION_FAILED also for an inactive reference, a size id not of this product (&#x60;isSizeOfProduct&#x60;) or a repeat (&#x60;isNotRepeated&#x60;); MEDIA_NOT_FOUND / MEDIA_NOT_READY for a new image not uploaded and confirmed by this user; PRODUCT_NOT_SUBMITTABLE (published only) with &#x60;details.reasons&#x60; (NO_SIZE, NO_IMAGE); NOT_FOUND for an unknown id or another vendor’s product.
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
  Future<Response<ProductResponseDto>> vendorUpdateProductContent({ 
    required String id,
    required ProductContentDto productContentDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/products/{id}'.replaceAll('{' r'id' '}', id.toString());
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
