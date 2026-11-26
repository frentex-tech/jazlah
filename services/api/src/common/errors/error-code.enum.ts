/**
 * Every error code the API returns. Clients branch on these values.
 *
 * A code is a contract with the mobile app: once released it is never renamed,
 * never removed and never reused for a different meaning. A new situation gets a
 * new code, with its messages in error-messages.constants.ts and its HTTP status
 * in error-statuses.constants.ts.
 */
export enum ErrorCode {
  /** The input was wrong. Produced only by the validation pipe, with per-field details. */
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  /** A 400 that is not a validation failure, and any 4xx without a code of its own. */
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  /**
   * Signed in with the right audience, but this staff user lacks the permission the
   * action needs (admin permissions, ADM-API-1). Unlike FORBIDDEN, the session is fine:
   * a client shows "not allowed" and keeps the user signed in. Details: `{ permission }`.
   */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFLICT = 'CONFLICT',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE',
  RATE_LIMITED = 'RATE_LIMITED',
  /**
   * Two requests changed the same data at the same time and this one lost, even after
   * retrying. Nothing was saved; the client may send the request again.
   */
  TRANSACTION_CONFLICT = 'TRANSACTION_CONFLICT',
  /** The API cannot reach a dependency it needs (the database) right now. Retryable. */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** The declared content type is not one the upload purpose accepts. Nothing was created. */
  MEDIA_CONTENT_TYPE_NOT_ALLOWED = 'MEDIA_CONTENT_TYPE_NOT_ALLOWED',
  /** No file with this id exists (never requested, or already cleaned up). */
  MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND',
  /** The upload was not confirmed in time; request a new upload. */
  MEDIA_UPLOAD_EXPIRED = 'MEDIA_UPLOAD_EXPIRED',
  /**
   * The uploaded file failed the checks at confirmation (missing, empty, too large, or
   * its real type not allowed) and was deleted. `details.reason` says which.
   */
  MEDIA_UPLOAD_REJECTED = 'MEDIA_UPLOAD_REJECTED',
  /** The file exists but its upload has not been confirmed, or was rejected. */
  MEDIA_NOT_READY = 'MEDIA_NOT_READY',
  /** The verification code is wrong; the attempt was counted. */
  OTP_INVALID = 'OTP_INVALID',
  /**
   * No code can be verified for this phone and audience: none was requested, it
   * expired, it was used, or its attempts ran out. Request a new code.
   */
  OTP_EXPIRED = 'OTP_EXPIRED',
  /**
   * The refresh token cannot be exchanged: unknown, expired, already used, or its
   * session has ended. Sign in again.
   */
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  /** The access token was valid and has expired: refresh it, no new sign-in needed. */
  ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
  /** The account has been disabled; signing in or refreshing will not help. */
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  /** The user already has a vendor application waiting for review; nothing was created. */
  VENDOR_APPLICATION_ALREADY_PENDING = 'VENDOR_APPLICATION_ALREADY_PENDING',
  /** The vendor application was already approved or rejected; it cannot be reviewed again. */
  VENDOR_APPLICATION_NOT_PENDING = 'VENDOR_APPLICATION_NOT_PENDING',
  /**
   * The vendor the user works for is suspended: vendor routes, signing in and refreshing
   * as that vendor are refused until an admin reinstates it.
   */
  VENDOR_SUSPENDED = 'VENDOR_SUSPENDED',
  /**
   * The user already works for a vendor (active vendor access): refused when applying to
   * become a vendor, and at approval when the access came after the application.
   */
  VENDOR_ACCESS_ALREADY_HELD = 'VENDOR_ACCESS_ALREADY_HELD',
  /**
   * A vendor with this commercial registration number exists already: refused when
   * applying, and at approval when that vendor was approved after the application.
   */
  VENDOR_CR_EXISTS = 'VENDOR_CR_EXISTS',
  /**
   * The product's status does not allow this: editing a product under review, or a
   * review step on a product that is not waiting for it. Details: `{ status }`.
   */
  PRODUCT_NOT_EDITABLE = 'PRODUCT_NOT_EDITABLE',
  /**
   * The product cannot go to review or be published as it is. Details: `{ reasons }`,
   * each NO_SIZE or NO_IMAGE.
   */
  PRODUCT_NOT_SUBMITTABLE = 'PRODUCT_NOT_SUBMITTABLE',
  /**
   * An admin approved or rejected a change request the vendor has since replaced with a
   * newer edit: the dashboard reloads and shows the newer request.
   */
  PRODUCT_CHANGE_REQUEST_SUPERSEDED = 'PRODUCT_CHANGE_REQUEST_SUPERSEDED',
  /**
   * The customer already has the most saved addresses allowed; nothing was added.
   * Details: `{ limit }`.
   */
  ADDRESS_LIMIT_REACHED = 'ADDRESS_LIMIT_REACHED',
  /**
   * The account holds vendor, kitchen or admin access, so it cannot be deleted through
   * the app until that access is removed.
   */
  ACCOUNT_HAS_STAFF_ACCESS = 'ACCOUNT_HAS_STAFF_ACCESS',
  /**
   * The action needs a recent sign-in (account deletion: within the last 10 minutes).
   * Sign in again, then repeat it. 403, not 401, so a client does not just refresh.
   */
  RECENT_SIGN_IN_REQUIRED = 'RECENT_SIGN_IN_REQUIRED',
  /**
   * A coverage zone's boundary is not a valid polygon: not closed, too few points, a
   * position out of range, or edges that cross (PostGIS ST_IsValid). Nothing was saved.
   */
  INVALID_POLYGON = 'INVALID_POLYGON',
  /** The route is in the contract but its task has not landed yet (`details.task`, the task key). Show "coming soon"; do not retry. */
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  /** The cart has no lines, so it cannot get a coupon, a fulfilment or be placed. */
  CART_EMPTY = 'CART_EMPTY',
  /** The cart holds another store’s products; one store per cart. Details: `{ vendorId, vendorName }` of the cart’s store. Ask, then send again with `replaceCart: true`. */
  CART_VENDOR_MISMATCH = 'CART_VENDOR_MISMATCH',
  /** The product cannot be ordered now: not published, switched off, or its store or category is not active. */
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  /** The chosen size is out of stock. */
  SIZE_UNAVAILABLE = 'SIZE_UNAVAILABLE',
  /** A chosen size, cutting style, packaging or "without" item is not one of the product’s. Refresh the product. */
  OPTION_NOT_IN_PRODUCT = 'OPTION_NOT_IN_PRODUCT',
  /** The chosen cutting style cannot be packed in the chosen packaging (an admin rule). */
  INCOMPATIBLE_CUTTING_PACKAGING = 'INCOMPATIBLE_CUTTING_PACKAGING',
  /** The product offers cutting styles and none was chosen. */
  OPTION_REQUIRED = 'OPTION_REQUIRED',
  /** A line’s price changed since it was added. Details: `{ lineIds }`. Show the new price; PATCH the line to accept it. */
  PRICE_CHANGED = 'PRICE_CHANGED',
  /** A line can no longer be ordered as chosen. Details: `{ lineIds }`. Remove it. */
  ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
  /** The subtotal is below the minimum order. Details: `{ minOrderHalalas, remainingHalalas }`. */
  MIN_ORDER_NOT_MET = 'MIN_ORDER_NOT_MET',
  /** No coupon with this code, or it is switched off. */
  COUPON_NOT_FOUND = 'COUPON_NOT_FOUND',
  /** The coupon has ended. */
  COUPON_EXPIRED = 'COUPON_EXPIRED',
  /** The coupon has not started yet, or is not for this store or these products. */
  COUPON_NOT_APPLICABLE = 'COUPON_NOT_APPLICABLE',
  /** The cart is below the coupon’s minimum. Details: `{ minOrderHalalas }`. */
  COUPON_MIN_ORDER = 'COUPON_MIN_ORDER',
  /** The coupon has been used as many times as allowed, in all or by this customer. */
  COUPON_LIMIT_REACHED = 'COUPON_LIMIT_REACHED',
  /** Another coupon has this code (in any case). */
  COUPON_CODE_TAKEN = 'COUPON_CODE_TAKEN',
  /** The cart has no fulfilment yet: choose delivery or pickup and the day first. */
  FULFILMENT_REQUIRED = 'FULFILMENT_REQUIRED',
  /** A product in the cart does not allow this fulfilment method. */
  FULFILMENT_NOT_SUPPORTED = 'FULFILMENT_NOT_SUPPORTED',
  /** The address is outside every active delivery zone. */
  ADDRESS_NOT_COVERED = 'ADDRESS_NOT_COVERED',
  /** The day has no capacity left for this store. */
  DAY_FULL = 'DAY_FULL',
  /** The day cannot be chosen. Details: `{ reason }`: PAST_CUTOFF, CLOSED, OUTSIDE_HORIZON or VENDOR_CLOSED. */
  DAY_NOT_AVAILABLE = 'DAY_NOT_AVAILABLE',
  /** New orders are paused by the platform. Details: `{ messageAr, messageEn }`, the admin’s message to show. */
  ORDERING_PAUSED = 'ORDERING_PAUSED',
  /** The profile has no full name yet; placing an order needs one. */
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',
  /** The wallet balance does not cover the amount. Details: `{ balanceHalalas }`. */
  WALLET_INSUFFICIENT = 'WALLET_INSUFFICIENT',
  /** The method is not offered for this order (cash on delivery off, over its limit or not for this kind of order). Details: `{ method }`. Refetch the methods. */
  PAYMENT_METHOD_NOT_AVAILABLE = 'PAYMENT_METHOD_NOT_AVAILABLE',
  /** The order is not waiting for payment: paid, cancelled or expired. */
  ORDER_NOT_PAYABLE = 'ORDER_NOT_PAYABLE',
  /** A payment of this order with another method is still open. Details: `{ paymentId }`. Finish or wait for it. */
  PAYMENT_IN_PROGRESS = 'PAYMENT_IN_PROGRESS',
  /** This `Idempotency-Key` was already used for a different request. Make a new key for a new attempt; send the same key only with the same body. */
  IDEMPOTENCY_KEY_REUSED = 'IDEMPOTENCY_KEY_REUSED',
  /** The order cannot move to that status now, or not by this caller. Details: `{ from, to }`. Reload the order. */
  ORDER_TRANSITION_NOT_ALLOWED = 'ORDER_TRANSITION_NOT_ALLOWED',
}
