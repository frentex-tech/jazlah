//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

import 'dart:async';

// ignore: unused_import
import 'dart:convert';
import 'package:jazla_api/src/deserialize.dart';
import 'package:dio/dio.dart';

import 'package:jazla_api/src/model/error_response_dto.dart';
import 'package:jazla_api/src/model/media_file_response_dto.dart';
import 'package:jazla_api/src/model/request_vendor_upload_dto.dart';
import 'package:jazla_api/src/model/upload_ticket_response_dto.dart';

class VendorMediaApi {

  final Dio _dio;

  const VendorMediaApi(this._dio);

  /// Confirm an uploaded file
  /// Step 3 of a file upload: call it once the storage answered 204 to the upload, before the ticket &#x60;confirmBy&#x60;. The path id is the ticket &#x60;mediaId&#x60;.  The API checks the uploaded file: present, not empty, not larger than the purpose allows, its real type (read from the file first bytes) one the purpose accepts and equal to the &#x60;contentType&#x60; declared for the ticket. A file that passes is ready: give its &#x60;id&#x60; to the endpoint that uses it (a product &#x60;imageMediaIds&#x60;, the vendor &#x60;logoMediaId&#x60; or &#x60;coverMediaId&#x60;, the documents of a vendor application). A file that fails is deleted for good: request a new ticket and upload again. Confirming before the upload finished therefore rejects the file (OBJECT_MISSING).  Idempotent: confirming a ready file again returns it again; a rejected file answers the same MEDIA_UPLOAD_REJECTED again. Only the user who requested the ticket can confirm it.  Limit: 60 confirmations a minute per client address; over it, 429 RATE_LIMITED with Retry-After.  Errors: - MEDIA_NOT_FOUND (404): no such file for this user: an unknown id, a file another user uploaded, or an unconfirmed upload already removed after its &#x60;confirmBy&#x60;. - MEDIA_UPLOAD_EXPIRED (410): &#x60;confirmBy&#x60; has passed. Request a new ticket and upload again. - MEDIA_UPLOAD_REJECTED (422): the file failed a check and was deleted. &#x60;details.reason&#x60;: OBJECT_MISSING (nothing was uploaded with the ticket), EMPTY_FILE, TOO_LARGE, TYPE_NOT_ALLOWED (the content is none of the accepted types), CONTENT_TYPE_MISMATCH (the content is another type than the declared &#x60;contentType&#x60;, a PNG declared as image/jpeg for example), or OWNER_DELETED (the account was deleted). - VALIDATION_FAILED (400): the id is not a UUID. - SERVICE_UNAVAILABLE (503): the storage or the database cannot be reached, or the limit cannot be counted right now. Confirm again shortly, before &#x60;confirmBy&#x60;.
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
  /// Returns a [Future] containing a [Response] with a [MediaFileResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<MediaFileResponseDto>> vendorConfirmMediaUpload({ 
    required String id,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/media/{id}/confirm'.replaceAll('{' r'id' '}', id.toString());
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

    MediaFileResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<MediaFileResponseDto, MediaFileResponseDto>(rawData, 'MediaFileResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<MediaFileResponseDto>(
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

  /// Get a ticket to upload one file
  /// Called by the vendor dashboard to upload the store logo and product images. The confirmed ids go in the vendor profile &#x60;logoMediaId&#x60; and a product &#x60;imageMediaIds&#x60;.  Step 1 of 3 of a file upload. The file never passes through this API: this returns a ticket for a direct upload to storage.  1. Call this with the purpose, the file Content-Type and, optionally, its name. Nothing is uploaded yet. 2. Before &#x60;expiresAt&#x60; (5 minutes after the request by default), send &#x60;POST&#x60; to &#x60;url&#x60; as &#x60;multipart/form-data&#x60;: first one text part for every entry of &#x60;fields&#x60;, name and value exactly as given (add none, change none), then the file itself as the **last** part, named &#x60;file&#x60;. Send no Authorization header to the storage. The storage answers 204 with no body when it stored the file. It refuses an empty file, a file larger than the purpose allows, a changed field or an expired ticket with an error status (4xx) and an XML body of its own, not this API error format. Until &#x60;expiresAt&#x60; the same ticket can be used again (after a network failure): the last upload replaces the earlier one. 3. Only after the storage answered 204, and before &#x60;confirmBy&#x60; (1 hour after the request by default), confirm the file: &#x60;POST .../media/{mediaId}/confirm&#x60;. Only a confirmed file can be used, and only by the user who uploaded it.  Read both times from the response: they are server settings and may change.  Limits: 30 ticket requests a minute per client address and 100 an hour per user; over them, 429 RATE_LIMITED with Retry-After.  Errors: - MEDIA_CONTENT_TYPE_NOT_ALLOWED (415): the purpose does not accept this &#x60;contentType&#x60;; &#x60;details.allowed&#x60; lists the types it accepts. Nothing was created. - VALIDATION_FAILED (400): a purpose this app may not upload, or a missing or too long &#x60;contentType&#x60; or &#x60;fileName&#x60;. - SERVICE_UNAVAILABLE (503): the storage or the database cannot be reached, or the upload limits cannot be counted right now (uploads are then refused). Nothing was created; try again shortly.  Purposes accepted here (accepted types; size; who can read the file): - &#x60;vendor.logo&#x60;: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - &#x60;vendor.cover&#x60;: image/jpeg, image/png, image/webp; 1 byte to 2 MiB (2097152 bytes); public (anyone can read it at a stable URL). - &#x60;catalog.product-image&#x60;: image/jpeg, image/png, image/webp; 1 byte to 5 MiB (5242880 bytes); public (anyone can read it at a stable URL).
  ///
  /// Parameters:
  /// * [requestVendorUploadDto] 
  /// * [cancelToken] - A [CancelToken] that can be used to cancel the operation
  /// * [headers] - Can be used to add additional headers to the request
  /// * [extras] - Can be used to add flags to the request
  /// * [validateStatus] - A [ValidateStatus] callback that can be used to determine request success based on the HTTP status of the response
  /// * [onSendProgress] - A [ProgressCallback] that can be used to get the send progress
  /// * [onReceiveProgress] - A [ProgressCallback] that can be used to get the receive progress
  ///
  /// Returns a [Future] containing a [Response] with a [UploadTicketResponseDto] as data
  /// Throws [DioException] if API call or serialization fails
  Future<Response<UploadTicketResponseDto>> vendorRequestMediaUpload({ 
    required RequestVendorUploadDto requestVendorUploadDto,
    CancelToken? cancelToken,
    Map<String, dynamic>? headers,
    Map<String, dynamic>? extra,
    ValidateStatus? validateStatus,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    final _path = r'/v1/vendor/media/uploads';
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
_bodyData=jsonEncode(requestVendorUploadDto);
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

    UploadTicketResponseDto? _responseData;

    try {
final rawData = _response.data;
_responseData = rawData == null ? null : deserialize<UploadTicketResponseDto, UploadTicketResponseDto>(rawData, 'UploadTicketResponseDto', growable: true);
    } catch (error, stackTrace) {
      throw DioException(
        requestOptions: _response.requestOptions,
        response: _response,
        type: DioExceptionType.unknown,
        error: error,
        stackTrace: stackTrace,
      );
    }

    return Response<UploadTicketResponseDto>(
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
