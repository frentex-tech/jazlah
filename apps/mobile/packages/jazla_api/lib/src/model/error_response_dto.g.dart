// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'error_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ErrorResponseDto _$ErrorResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ErrorResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['code', 'message', 'requestId']);
      final val = ErrorResponseDto(
        code: $checkedConvert(
          'code',
          (v) => $enumDecode(
            _$ErrorCodeEnumMap,
            v,
            unknownValue: ErrorCode.unknownDefaultOpenApi,
          ),
        ),
        message: $checkedConvert('message', (v) => v as String),
        details: $checkedConvert(
          'details',
          (v) => v == null ? null : ErrorResponseDtoDetails.fromJson(v),
        ),
        requestId: $checkedConvert('requestId', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$ErrorResponseDtoToJson(ErrorResponseDto instance) =>
    <String, dynamic>{
      'code': _$ErrorCodeEnumMap[instance.code]!,
      'message': instance.message,
      'details': ?instance.details?.toJson(),
      'requestId': instance.requestId,
    };

const _$ErrorCodeEnumMap = {
  ErrorCode.VALIDATION_FAILED: 'VALIDATION_FAILED',
  ErrorCode.BAD_REQUEST: 'BAD_REQUEST',
  ErrorCode.NOT_FOUND: 'NOT_FOUND',
  ErrorCode.METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  ErrorCode.UNAUTHORIZED: 'UNAUTHORIZED',
  ErrorCode.FORBIDDEN: 'FORBIDDEN',
  ErrorCode.CONFLICT: 'CONFLICT',
  ErrorCode.PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  ErrorCode.UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  ErrorCode.RATE_LIMITED: 'RATE_LIMITED',
  ErrorCode.TRANSACTION_CONFLICT: 'TRANSACTION_CONFLICT',
  ErrorCode.SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  ErrorCode.INTERNAL_ERROR: 'INTERNAL_ERROR',
  ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED: 'MEDIA_CONTENT_TYPE_NOT_ALLOWED',
  ErrorCode.MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
  ErrorCode.MEDIA_UPLOAD_EXPIRED: 'MEDIA_UPLOAD_EXPIRED',
  ErrorCode.MEDIA_UPLOAD_REJECTED: 'MEDIA_UPLOAD_REJECTED',
  ErrorCode.MEDIA_NOT_READY: 'MEDIA_NOT_READY',
  ErrorCode.OTP_INVALID: 'OTP_INVALID',
  ErrorCode.OTP_EXPIRED: 'OTP_EXPIRED',
  ErrorCode.REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  ErrorCode.ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
  ErrorCode.ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING:
      'VENDOR_APPLICATION_ALREADY_PENDING',
  ErrorCode.VENDOR_APPLICATION_NOT_PENDING: 'VENDOR_APPLICATION_NOT_PENDING',
  ErrorCode.VENDOR_SUSPENDED: 'VENDOR_SUSPENDED',
  ErrorCode.VENDOR_ACCESS_ALREADY_HELD: 'VENDOR_ACCESS_ALREADY_HELD',
  ErrorCode.PRODUCT_NOT_EDITABLE: 'PRODUCT_NOT_EDITABLE',
  ErrorCode.PRODUCT_NOT_SUBMITTABLE: 'PRODUCT_NOT_SUBMITTABLE',
  ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED:
      'PRODUCT_CHANGE_REQUEST_SUPERSEDED',
  ErrorCode.ADDRESS_LIMIT_REACHED: 'ADDRESS_LIMIT_REACHED',
  ErrorCode.ACCOUNT_HAS_STAFF_ACCESS: 'ACCOUNT_HAS_STAFF_ACCESS',
  ErrorCode.RECENT_SIGN_IN_REQUIRED: 'RECENT_SIGN_IN_REQUIRED',
  ErrorCode.unknownDefaultOpenApi: 'unknown_default_open_api',
};
