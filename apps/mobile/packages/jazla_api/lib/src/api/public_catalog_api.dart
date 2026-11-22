//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/product_card_page_response_dto.dart';
import 'package:jazla_api/src/model/public_category_list_response_dto.dart';
import 'package:jazla_api/src/model/public_product_response_dto.dart';

class PublicCatalogApi {

  final Dio _dio;

  const PublicCatalogApi(this._dio);

  /// One product with every option
  /// Customer app and web, product page; public, no sign-in needed. The product with what a customer chooses from: sizes (approximate weight, price, availability, the default one), cutting styles (extra price), packagings, \&quot;without\&quot; items, the cutting and packaging pairs that may not be chosen together, and how it is fulfilled (delivery, pickup or both). Prices are integer halalas, VAT included. A product switched off (out of stock) is returned with &#x60;isAvailable&#x60; false: show it out of stock. NOT_FOUND for an unknown id and also for a product not published, of a suspended vendor or in an inactive category: show it as no longer available.
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
  /// Returns a [Future] containing a [Response] with a [PublicProductResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<PublicProductResponseDto>> publicGetProduct({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/products/{id}'.replaceAll('{' r'id' '}', id.toString());
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
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

    PublicProductResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<PublicProductResponseDto, PublicProductResponseDto>(rawData, 'PublicProductResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<PublicProductResponseDto>(
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

  /// The active categories, in the order admins set
  /// Customer app and web, home screen and category menu; public, no sign-in needed. Every active category, by &#x60;sortOrder&#x60; (lower first), then oldest first. The whole list in one answer, not paged. An inactive category is left out, and so are its products everywhere in the public catalog. Filter products by a category with GET /v1/public/products?categoryId&#x3D;….
  ///
  /// Parameters:
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [PublicCategoryListResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<PublicCategoryListResponseDto>> publicListCategories({ 
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/categories';
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
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

    PublicCategoryListResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<PublicCategoryListResponseDto, PublicCategoryListResponseDto>(rawData, 'PublicCategoryListResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<PublicCategoryListResponseDto>(
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

  /// Products, newest first, with filters
  /// Customer app and web, product lists (home, a category, a store, search by price); public, no sign-in needed. Only products customers can buy: published, switched on (available), of an active (not suspended) vendor, in an active category. Newest first; keyset paging: send &#x60;nextCursor&#x60; back as &#x60;cursor&#x60; until it is null; no total count. Optional filters, combined: &#x60;categoryId&#x60;, &#x60;vendorId&#x60;, &#x60;meatTypeId&#x60;, and a range on the product’s lowest size price in halalas, VAT included (&#x60;minPriceHalalas&#x60;, &#x60;maxPriceHalalas&#x60;, both ends included; a range with min above max simply finds nothing), and &#x60;q&#x60;, a text of 2 to 100 characters the Arabic or English name must contain (Arabic diacritics, tatweel, alef forms, alef maqsura, teh marbuta and English case ignored). An unknown id finds nothing rather than an error.
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [q] - Only products where every word of this text (split on spaces, in any order; words of one letter are ignored) appears anywhere in the product's name, or at the start of a word of its store's name, in Arabic or English; surrounding spaces are removed, then 2 to 100 characters. Matching ignores Arabic diacritics and tatweel, reads أ إ آ ٱ as ا, ى as ي and ة as ه, and ignores English letter case; `%` and `_` match themselves. Combined with every other filter and the paging. No match: an empty page. Left out: no text search.
  /// * [categoryId] - Only products of this category (its id, a UUID, from GET /v1/public/categories). Left out: every category.
  /// * [vendorId] - Only products of this vendor (its id, a UUID, from the public vendor list). Left out: every vendor.
  /// * [meatTypeId] - Only products of this meat type (its id, a UUID). Left out: every meat type.
  /// * [minPriceHalalas] - Only products whose lowest size price is at least this, in halalas, VAT included (`50000` is 500.00 SAR); included.
  /// * [maxPriceHalalas] - Only products whose lowest size price is at most this, in halalas, VAT included (`150000` is 1,500.00 SAR); included.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ProductCardPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ProductCardPageResponseDto>> publicListProducts({ 
    String? cursor,
    num? limit = 20,
    String? q,
    String? categoryId,
    String? vendorId,
    String? meatTypeId,
    num? minPriceHalalas,
    num? maxPriceHalalas,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/public/products';
    final _options = Options(
      method: r'GET',
      headers: <String, dynamic>{
        ...?headers,
      },
      extra: <String, dynamic>{
        'secure': <Map<String, String>>[],
        ...?extra,
      },
      validateStatus: validateStatus,
    );

    final _queryParameters = <String, dynamic>{
      if (cursor != null) r'cursor': cursor,
      if (limit != null) r'limit': limit,
      if (q != null) r'q': q,
      if (categoryId != null) r'categoryId': categoryId,
      if (vendorId != null) r'vendorId': vendorId,
      if (meatTypeId != null) r'meatTypeId': meatTypeId,
      if (minPriceHalalas != null) r'minPriceHalalas': minPriceHalalas,
      if (maxPriceHalalas != null) r'maxPriceHalalas': maxPriceHalalas,
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

}
