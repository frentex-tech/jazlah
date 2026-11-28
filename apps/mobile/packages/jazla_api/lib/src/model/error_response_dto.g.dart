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
  ErrorCode.PERMISSION_DENIED: 'PERMISSION_DENIED',
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
  ErrorCode.VENDOR_CR_EXISTS: 'VENDOR_CR_EXISTS',
  ErrorCode.PRODUCT_NOT_EDITABLE: 'PRODUCT_NOT_EDITABLE',
  ErrorCode.PRODUCT_NOT_SUBMITTABLE: 'PRODUCT_NOT_SUBMITTABLE',
  ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED:
      'PRODUCT_CHANGE_REQUEST_SUPERSEDED',
  ErrorCode.ADDRESS_LIMIT_REACHED: 'ADDRESS_LIMIT_REACHED',
  ErrorCode.ADDRESS_IN_USE: 'ADDRESS_IN_USE',
  ErrorCode.ACCOUNT_HAS_STAFF_ACCESS: 'ACCOUNT_HAS_STAFF_ACCESS',
  ErrorCode.ACCOUNT_HAS_ACTIVE_ORDERS: 'ACCOUNT_HAS_ACTIVE_ORDERS',
  ErrorCode.RECENT_SIGN_IN_REQUIRED: 'RECENT_SIGN_IN_REQUIRED',
  ErrorCode.INVALID_POLYGON: 'INVALID_POLYGON',
  ErrorCode.NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  ErrorCode.CART_EMPTY: 'CART_EMPTY',
  ErrorCode.CART_VENDOR_MISMATCH: 'CART_VENDOR_MISMATCH',
  ErrorCode.PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
  ErrorCode.SIZE_UNAVAILABLE: 'SIZE_UNAVAILABLE',
  ErrorCode.OPTION_NOT_IN_PRODUCT: 'OPTION_NOT_IN_PRODUCT',
  ErrorCode.INCOMPATIBLE_CUTTING_PACKAGING: 'INCOMPATIBLE_CUTTING_PACKAGING',
  ErrorCode.OPTION_REQUIRED: 'OPTION_REQUIRED',
  ErrorCode.PRICE_CHANGED: 'PRICE_CHANGED',
  ErrorCode.ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  ErrorCode.MIN_ORDER_NOT_MET: 'MIN_ORDER_NOT_MET',
  ErrorCode.COUPON_NOT_FOUND: 'COUPON_NOT_FOUND',
  ErrorCode.COUPON_EXPIRED: 'COUPON_EXPIRED',
  ErrorCode.COUPON_NOT_APPLICABLE: 'COUPON_NOT_APPLICABLE',
  ErrorCode.COUPON_MIN_ORDER: 'COUPON_MIN_ORDER',
  ErrorCode.COUPON_LIMIT_REACHED: 'COUPON_LIMIT_REACHED',
  ErrorCode.COUPON_CODE_TAKEN: 'COUPON_CODE_TAKEN',
  ErrorCode.FULFILMENT_REQUIRED: 'FULFILMENT_REQUIRED',
  ErrorCode.FULFILMENT_NOT_SUPPORTED: 'FULFILMENT_NOT_SUPPORTED',
  ErrorCode.ADDRESS_NOT_COVERED: 'ADDRESS_NOT_COVERED',
  ErrorCode.DAY_FULL: 'DAY_FULL',
  ErrorCode.DAY_NOT_AVAILABLE: 'DAY_NOT_AVAILABLE',
  ErrorCode.ORDERING_PAUSED: 'ORDERING_PAUSED',
  ErrorCode.PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  ErrorCode.WALLET_INSUFFICIENT: 'WALLET_INSUFFICIENT',
  ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE: 'PAYMENT_METHOD_NOT_AVAILABLE',
  ErrorCode.ORDER_NOT_PAYABLE: 'ORDER_NOT_PAYABLE',
  ErrorCode.PAYMENT_IN_PROGRESS: 'PAYMENT_IN_PROGRESS',
  ErrorCode.IDEMPOTENCY_KEY_REUSED: 'IDEMPOTENCY_KEY_REUSED',
  ErrorCode.ORDER_TRANSITION_NOT_ALLOWED: 'ORDER_TRANSITION_NOT_ALLOWED',
  ErrorCode.unknownDefaultOpenApi: 'unknown_default_open_api',
};
