//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/create_cutting_packaging_incompatibility_dto.dart';
import 'package:jazla_api/src/model/create_reference_item_dto.dart';
import 'package:jazla_api/src/model/cutting_packaging_incompatibility_page_response_dto.dart';
import 'package:jazla_api/src/model/cutting_packaging_incompatibility_response_dto.dart';
import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/reference_item_page_response_dto.dart';
import 'package:jazla_api/src/model/reference_item_response_dto.dart';
import 'package:jazla_api/src/model/update_reference_item_dto.dart';

class AdminCatalogListsApi {

  final Dio _dio;

  const AdminCatalogListsApi(this._dio);

  /// Add an entry to a list (it starts active)
  /// Admin dashboard, catalog settings. Adds an entry, with its Arabic and English name, to one of the lists products are built from: &#x60;categories&#x60;, &#x60;meat-types&#x60;, &#x60;cutting-styles&#x60; or &#x60;exclusion-items&#x60; (the \&quot;without\&quot; items a customer can ask to leave out). It starts active, so vendors can choose it at once. Only a category takes a display order (&#x60;sortOrder&#x60;, lower first, 0 when left out); on another list it is refused with VALIDATION_FAILED &#x60;isOrderedList&#x60;. Only a category takes an image (&#x60;imageMediaId&#x60;: upload it first with POST /v1/admin/media/uploads, purpose &#x60;catalog.category-image&#x60;, then confirm it; MEDIA_NOT_FOUND for another user’s or another purpose’s file, MEDIA_NOT_READY before confirmation); on another list VALIDATION_FAILED &#x60;isCategoryList&#x60;. Names need not be unique.
  ///
  /// Parameters:
  /// * [list] - Which list: `categories`, `meat-types`, `cutting-styles` or `exclusion-items` (the \"without\" items a customer can ask to leave out). Another value is VALIDATION_FAILED on `list`.
  /// * [createReferenceItemDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ReferenceItemResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ReferenceItemResponseDto>> adminCreateCatalogListEntry({ 
    required String list,
    required CreateReferenceItemDto createReferenceItemDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/lists/{list}'.replaceAll('{' r'list' '}', list.toString());
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
_bodyData=jsonEncode(createReferenceItemDto);
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

    ReferenceItemResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ReferenceItemResponseDto, ReferenceItemResponseDto>(rawData, 'ReferenceItemResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ReferenceItemResponseDto>(
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

  /// Forbid a cutting style with a packaging
  /// Admin dashboard, catalog settings. Adds a global rule: products may not offer this cutting style together with this packaging. Products already published keep their options; the rule applies to every later submission, publication and change request, refused with PRODUCT_NOT_SUBMITTABLE (INCOMPATIBLE_CUTTING_PACKAGING) while they offer the pair. Errors: VALIDATION_FAILED &#x60;isActiveCuttingStyle&#x60; when the cutting style is not an active entry; CONFLICT when the same rule exists already.
  ///
  /// Parameters:
  /// * [createCuttingPackagingIncompatibilityDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CuttingPackagingIncompatibilityResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CuttingPackagingIncompatibilityResponseDto>> adminCreateCuttingPackagingIncompatibility({ 
    required CreateCuttingPackagingIncompatibilityDto createCuttingPackagingIncompatibilityDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/cutting-packaging-incompatibilities';
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
_bodyData=jsonEncode(createCuttingPackagingIncompatibilityDto);
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

    CuttingPackagingIncompatibilityResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CuttingPackagingIncompatibilityResponseDto, CuttingPackagingIncompatibilityResponseDto>(rawData, 'CuttingPackagingIncompatibilityResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CuttingPackagingIncompatibilityResponseDto>(
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

  /// Remove a cutting and packaging rule
  /// Admin dashboard, catalog settings. Deletes the rule at once: products may offer the pair again from their next submission or edit. NOT_FOUND for an unknown id, also when it was removed already.
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
  Future<Response<void>> adminDeleteCuttingPackagingIncompatibility({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/cutting-packaging-incompatibilities/{id}'.replaceAll('{' r'id' '}', id.toString());
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

  /// The entries of a list, newest first
  /// Admin dashboard, catalog settings, and the pickers of the JAZLA product form. The entries of one list (&#x60;categories&#x60;, &#x60;meat-types&#x60;, &#x60;cutting-styles&#x60;, &#x60;exclusion-items&#x60;), active and inactive, newest first; &#x60;isActive&#x60; keeps only one kind. Keyset paging: send &#x60;nextCursor&#x60; back as &#x60;cursor&#x60; until it is null; no total count. The public order of categories is their &#x60;sortOrder&#x60;, not this order.
  ///
  /// Parameters:
  /// * [list] - Which list: `categories`, `meat-types`, `cutting-styles` or `exclusion-items` (the \"without\" items a customer can ask to leave out). Another value is VALIDATION_FAILED on `list`.
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [isActive] - `true`: only active entries (the ones vendors can choose); `false`: only inactive ones. Left out: both.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ReferenceItemPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ReferenceItemPageResponseDto>> adminListCatalogListEntries({ 
    required String list,
    String? cursor,
    num? limit = 20,
    String? isActive,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/lists/{list}'.replaceAll('{' r'list' '}', list.toString());
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
      if (isActive != null) r'isActive': isActive,
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    ReferenceItemPageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ReferenceItemPageResponseDto, ReferenceItemPageResponseDto>(rawData, 'ReferenceItemPageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ReferenceItemPageResponseDto>(
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

  /// The cutting and packaging rules, newest first
  /// Admin dashboard, catalog settings. Every cutting style and packaging pair products may not combine, newest first, by id (the cutting style names come from GET /v1/admin/lists/cutting-styles). Keyset paging: send &#x60;nextCursor&#x60; back as &#x60;cursor&#x60; until it is null; no total count.
  ///
  /// Parameters:
  /// * [cursor] - The `nextCursor` of the previous page; omit it for the first page. Opaque: never build or change it.
  /// * [limit] - How many items to return, 1 to 50.
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [CuttingPackagingIncompatibilityPageResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<CuttingPackagingIncompatibilityPageResponseDto>> adminListCuttingPackagingIncompatibilities({ 
    String? cursor,
    num? limit = 20,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/cutting-packaging-incompatibilities';
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
    };

    final _response = await _dio.request<Object>(
      _path,
      options: _options,
      queryParameters: _queryParameters,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );

    CuttingPackagingIncompatibilityPageResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<CuttingPackagingIncompatibilityPageResponseDto, CuttingPackagingIncompatibilityPageResponseDto>(rawData, 'CuttingPackagingIncompatibilityPageResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<CuttingPackagingIncompatibilityPageResponseDto>(
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

  /// Rename an entry, switch it on or off, or reorder a category
  /// Admin dashboard, catalog settings. Changes only the fields sent: the name (both languages together), &#x60;isActive&#x60;, and for a category &#x60;sortOrder&#x60; (the public order, lower first; on another list VALIDATION_FAILED &#x60;isOrderedList&#x60;) and &#x60;imageMediaId&#x60; (a confirmed &#x60;catalog.category-image&#x60; upload of the signed-in admin, MEDIA_NOT_FOUND or MEDIA_NOT_READY otherwise; null removes the image; on another list VALIDATION_FAILED &#x60;isCategoryList&#x60;). Applies at once. Entries are never deleted: switch one off instead. An inactive entry can no longer be chosen for a product (VALIDATION_FAILED on the product form); products already using it keep it. An inactive category also hides all its products from the public catalog at once, until it is switched on again. NOT_FOUND for an id that is not an entry of this list.
  ///
  /// Parameters:
  /// * [list] - Which list: `categories`, `meat-types`, `cutting-styles` or `exclusion-items` (the \"without\" items a customer can ask to leave out). Another value is VALIDATION_FAILED on `list`.
  /// * [id] - The id (a UUID) of an entry of that list; another value is VALIDATION_FAILED on `id`.
  /// * [updateReferenceItemDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [ReferenceItemResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<ReferenceItemResponseDto>> adminUpdateCatalogListEntry({ 
    required String list,
    required String id,
    required UpdateReferenceItemDto updateReferenceItemDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/admin/lists/{list}/{id}'.replaceAll('{' r'list' '}', list.toString()).replaceAll('{' r'id' '}', id.toString());
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
_bodyData=jsonEncode(updateReferenceItemDto);
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

    ReferenceItemResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<ReferenceItemResponseDto, ReferenceItemResponseDto>(rawData, 'ReferenceItemResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<ReferenceItemResponseDto>(
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
