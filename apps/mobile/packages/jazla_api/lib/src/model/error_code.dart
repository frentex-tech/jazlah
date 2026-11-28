//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// Stable error code. Clients branch on it; it is never renamed or reused.
enum ErrorCode {
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VALIDATION_FAILED')
      VALIDATION_FAILED(r'VALIDATION_FAILED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'BAD_REQUEST')
      BAD_REQUEST(r'BAD_REQUEST'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'NOT_FOUND')
      NOT_FOUND(r'NOT_FOUND'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'METHOD_NOT_ALLOWED')
      METHOD_NOT_ALLOWED(r'METHOD_NOT_ALLOWED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'UNAUTHORIZED')
      UNAUTHORIZED(r'UNAUTHORIZED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'FORBIDDEN')
      FORBIDDEN(r'FORBIDDEN'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PERMISSION_DENIED')
      PERMISSION_DENIED(r'PERMISSION_DENIED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'CONFLICT')
      CONFLICT(r'CONFLICT'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PAYLOAD_TOO_LARGE')
      PAYLOAD_TOO_LARGE(r'PAYLOAD_TOO_LARGE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'UNSUPPORTED_MEDIA_TYPE')
      UNSUPPORTED_MEDIA_TYPE(r'UNSUPPORTED_MEDIA_TYPE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'RATE_LIMITED')
      RATE_LIMITED(r'RATE_LIMITED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'TRANSACTION_CONFLICT')
      TRANSACTION_CONFLICT(r'TRANSACTION_CONFLICT'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'SERVICE_UNAVAILABLE')
      SERVICE_UNAVAILABLE(r'SERVICE_UNAVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'INTERNAL_ERROR')
      INTERNAL_ERROR(r'INTERNAL_ERROR'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MEDIA_CONTENT_TYPE_NOT_ALLOWED')
      MEDIA_CONTENT_TYPE_NOT_ALLOWED(r'MEDIA_CONTENT_TYPE_NOT_ALLOWED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MEDIA_NOT_FOUND')
      MEDIA_NOT_FOUND(r'MEDIA_NOT_FOUND'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MEDIA_UPLOAD_EXPIRED')
      MEDIA_UPLOAD_EXPIRED(r'MEDIA_UPLOAD_EXPIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MEDIA_UPLOAD_REJECTED')
      MEDIA_UPLOAD_REJECTED(r'MEDIA_UPLOAD_REJECTED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MEDIA_NOT_READY')
      MEDIA_NOT_READY(r'MEDIA_NOT_READY'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'OTP_INVALID')
      OTP_INVALID(r'OTP_INVALID'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'OTP_EXPIRED')
      OTP_EXPIRED(r'OTP_EXPIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'REFRESH_TOKEN_INVALID')
      REFRESH_TOKEN_INVALID(r'REFRESH_TOKEN_INVALID'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ACCESS_TOKEN_EXPIRED')
      ACCESS_TOKEN_EXPIRED(r'ACCESS_TOKEN_EXPIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ACCOUNT_DISABLED')
      ACCOUNT_DISABLED(r'ACCOUNT_DISABLED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VENDOR_APPLICATION_ALREADY_PENDING')
      VENDOR_APPLICATION_ALREADY_PENDING(r'VENDOR_APPLICATION_ALREADY_PENDING'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VENDOR_APPLICATION_NOT_PENDING')
      VENDOR_APPLICATION_NOT_PENDING(r'VENDOR_APPLICATION_NOT_PENDING'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VENDOR_SUSPENDED')
      VENDOR_SUSPENDED(r'VENDOR_SUSPENDED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VENDOR_ACCESS_ALREADY_HELD')
      VENDOR_ACCESS_ALREADY_HELD(r'VENDOR_ACCESS_ALREADY_HELD'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'VENDOR_CR_EXISTS')
      VENDOR_CR_EXISTS(r'VENDOR_CR_EXISTS'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PRODUCT_NOT_EDITABLE')
      PRODUCT_NOT_EDITABLE(r'PRODUCT_NOT_EDITABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PRODUCT_NOT_SUBMITTABLE')
      PRODUCT_NOT_SUBMITTABLE(r'PRODUCT_NOT_SUBMITTABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PRODUCT_CHANGE_REQUEST_SUPERSEDED')
      PRODUCT_CHANGE_REQUEST_SUPERSEDED(r'PRODUCT_CHANGE_REQUEST_SUPERSEDED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ADDRESS_LIMIT_REACHED')
      ADDRESS_LIMIT_REACHED(r'ADDRESS_LIMIT_REACHED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ADDRESS_IN_USE')
      ADDRESS_IN_USE(r'ADDRESS_IN_USE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ACCOUNT_HAS_STAFF_ACCESS')
      ACCOUNT_HAS_STAFF_ACCESS(r'ACCOUNT_HAS_STAFF_ACCESS'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ACCOUNT_HAS_ACTIVE_ORDERS')
      ACCOUNT_HAS_ACTIVE_ORDERS(r'ACCOUNT_HAS_ACTIVE_ORDERS'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'RECENT_SIGN_IN_REQUIRED')
      RECENT_SIGN_IN_REQUIRED(r'RECENT_SIGN_IN_REQUIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'INVALID_POLYGON')
      INVALID_POLYGON(r'INVALID_POLYGON'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'NOT_IMPLEMENTED')
      NOT_IMPLEMENTED(r'NOT_IMPLEMENTED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'CART_EMPTY')
      CART_EMPTY(r'CART_EMPTY'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'CART_VENDOR_MISMATCH')
      CART_VENDOR_MISMATCH(r'CART_VENDOR_MISMATCH'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PRODUCT_UNAVAILABLE')
      PRODUCT_UNAVAILABLE(r'PRODUCT_UNAVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'SIZE_UNAVAILABLE')
      SIZE_UNAVAILABLE(r'SIZE_UNAVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'OPTION_NOT_IN_PRODUCT')
      OPTION_NOT_IN_PRODUCT(r'OPTION_NOT_IN_PRODUCT'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'INCOMPATIBLE_CUTTING_PACKAGING')
      INCOMPATIBLE_CUTTING_PACKAGING(r'INCOMPATIBLE_CUTTING_PACKAGING'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'OPTION_REQUIRED')
      OPTION_REQUIRED(r'OPTION_REQUIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PRICE_CHANGED')
      PRICE_CHANGED(r'PRICE_CHANGED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ITEM_UNAVAILABLE')
      ITEM_UNAVAILABLE(r'ITEM_UNAVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'MIN_ORDER_NOT_MET')
      MIN_ORDER_NOT_MET(r'MIN_ORDER_NOT_MET'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_NOT_FOUND')
      COUPON_NOT_FOUND(r'COUPON_NOT_FOUND'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_EXPIRED')
      COUPON_EXPIRED(r'COUPON_EXPIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_NOT_APPLICABLE')
      COUPON_NOT_APPLICABLE(r'COUPON_NOT_APPLICABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_MIN_ORDER')
      COUPON_MIN_ORDER(r'COUPON_MIN_ORDER'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_LIMIT_REACHED')
      COUPON_LIMIT_REACHED(r'COUPON_LIMIT_REACHED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'COUPON_CODE_TAKEN')
      COUPON_CODE_TAKEN(r'COUPON_CODE_TAKEN'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'FULFILMENT_REQUIRED')
      FULFILMENT_REQUIRED(r'FULFILMENT_REQUIRED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'FULFILMENT_NOT_SUPPORTED')
      FULFILMENT_NOT_SUPPORTED(r'FULFILMENT_NOT_SUPPORTED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ADDRESS_NOT_COVERED')
      ADDRESS_NOT_COVERED(r'ADDRESS_NOT_COVERED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'DAY_FULL')
      DAY_FULL(r'DAY_FULL'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'DAY_NOT_AVAILABLE')
      DAY_NOT_AVAILABLE(r'DAY_NOT_AVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ORDERING_PAUSED')
      ORDERING_PAUSED(r'ORDERING_PAUSED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PROFILE_INCOMPLETE')
      PROFILE_INCOMPLETE(r'PROFILE_INCOMPLETE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'WALLET_INSUFFICIENT')
      WALLET_INSUFFICIENT(r'WALLET_INSUFFICIENT'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PAYMENT_METHOD_NOT_AVAILABLE')
      PAYMENT_METHOD_NOT_AVAILABLE(r'PAYMENT_METHOD_NOT_AVAILABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ORDER_NOT_PAYABLE')
      ORDER_NOT_PAYABLE(r'ORDER_NOT_PAYABLE'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'PAYMENT_IN_PROGRESS')
      PAYMENT_IN_PROGRESS(r'PAYMENT_IN_PROGRESS'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'IDEMPOTENCY_KEY_REUSED')
      IDEMPOTENCY_KEY_REUSED(r'IDEMPOTENCY_KEY_REUSED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'ORDER_TRANSITION_NOT_ALLOWED')
      ORDER_TRANSITION_NOT_ALLOWED(r'ORDER_TRANSITION_NOT_ALLOWED'),
          /// Stable error code. Clients branch on it; it is never renamed or reused.
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const ErrorCode(this.value);

  final String value;

  @override
  String toString() => value;
}
