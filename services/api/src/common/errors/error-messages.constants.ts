import type { LocalizedText } from '../i18n/localized-text.type';
import { ErrorCode } from './error-code.enum';

/**
 * The message catalogue: the text a client sees for each error code.
 *
 * Arabic is written in simple Saudi dialect, the product's voice: everyday wording a
 * customer in Riyadh would use, polite and short. Not formal Arabic, not heavy slang, no
 * Egyptian or Levantine words. Say what happened and what to do next, in one sentence
 * where possible; no technical terms, no error jargon, no blame on the user; no full
 * stop at the end. For example «الرمز انتهى، اطلب رمز جديد», not «انتهت صلاحية رمز التحقق».
 * The backend owner reviews Arabic wording before release. English stays plain English.
 */
export const ERROR_MESSAGES: Readonly<Record<ErrorCode, LocalizedText>> = {
  [ErrorCode.VALIDATION_FAILED]: {
    ar: 'فيه بيانات ناقصة أو غير صحيحة، راجعها وجرّب مرة ثانية',
    en: 'The request data is invalid.',
  },
  [ErrorCode.BAD_REQUEST]: {
    ar: 'ما قدرنا ننفّذ طلبك، جرّب مرة ثانية',
    en: 'The request could not be processed.',
  },
  [ErrorCode.METHOD_NOT_ALLOWED]: {
    ar: 'هذا الطلب غير متاح، حدّث التطبيق وجرّب مرة ثانية',
    en: 'This request method is not allowed for this route.',
  },
  [ErrorCode.PAYLOAD_TOO_LARGE]: {
    ar: 'حجم البيانات كبير، صغّرها وجرّب مرة ثانية',
    en: 'The request is too large.',
  },
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: {
    ar: 'هذا النوع من البيانات ما نقبله، حدّث التطبيق وجرّب مرة ثانية',
    en: 'The request content type is not supported.',
  },
  [ErrorCode.NOT_FOUND]: {
    ar: 'ما لقينا اللي تدوّر عليه',
    en: 'The requested resource was not found.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    ar: 'سجّل دخولك عشان تكمل',
    en: 'Authentication is required.',
  },
  [ErrorCode.FORBIDDEN]: {
    ar: 'هذا الإجراء غير متاح لحسابك',
    en: 'You do not have permission to perform this action.',
  },
  [ErrorCode.PERMISSION_DENIED]: {
    ar: 'ما عندك صلاحية لهالإجراء، كلّم مدير الحساب',
    en: 'Your account does not have the permission for this action.',
  },
  [ErrorCode.CONFLICT]: {
    ar: 'ما قدرنا ننفّذ طلبك لأن البيانات تغيّرت، حدّث الصفحة وجرّب مرة ثانية',
    en: 'The request conflicts with the current state of the resource.',
  },
  [ErrorCode.RATE_LIMITED]: {
    ar: 'حاولت كثير، انتظر شوي وجرّب بعدين',
    en: 'Too many requests. Please try again later.',
  },
  [ErrorCode.TRANSACTION_CONFLICT]: {
    ar: 'ما انحفظ طلبك لأن فيه طلب ثاني بنفس الوقت، جرّب مرة ثانية',
    en: 'The request clashed with another one made at the same time and nothing was saved. Please try again.',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    ar: 'الخدمة متوقفة مؤقتًا، جرّب بعد شوي',
    en: 'The service is temporarily unavailable. Please try again shortly.',
  },
  [ErrorCode.INTERNAL_ERROR]: {
    ar: 'صار خطأ عندنا، جرّب بعد شوي',
    en: 'An unexpected error occurred. Please try again later.',
  },
  [ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED]: {
    ar: 'نوع الملف هذا ما نقبله هنا، ارفع ملف بنوع ثاني',
    en: 'This file type is not allowed here.',
  },
  [ErrorCode.MEDIA_NOT_FOUND]: {
    ar: 'ما لقينا الملف',
    en: 'The file was not found.',
  },
  [ErrorCode.MEDIA_UPLOAD_EXPIRED]: {
    ar: 'انتهى وقت رفع الملف، ارفعه مرة ثانية',
    en: 'The upload was not confirmed in time. Please upload the file again.',
  },
  [ErrorCode.MEDIA_UPLOAD_REJECTED]: {
    ar: 'الملف ما يطابق الشروط المطلوبة، ارفع ملف ثاني',
    en: 'The uploaded file was rejected because it does not meet the requirements. Please upload another file.',
  },
  [ErrorCode.MEDIA_NOT_READY]: {
    ar: 'الملف للحين ما جهز، جرّب بعد شوي',
    en: 'The file is not ready yet.',
  },
  [ErrorCode.OTP_INVALID]: {
    ar: 'الرمز غير صحيح، تأكد منه وجرّب مرة ثانية',
    en: 'The verification code is incorrect.',
  },
  [ErrorCode.OTP_EXPIRED]: {
    ar: 'الرمز انتهى، اطلب رمز جديد',
    en: 'The verification code is no longer valid. Please request a new one.',
  },
  [ErrorCode.REFRESH_TOKEN_INVALID]: {
    ar: 'انتهت جلستك، سجّل دخولك من جديد',
    en: 'Your session has ended. Please sign in again.',
  },
  [ErrorCode.ACCESS_TOKEN_EXPIRED]: {
    ar: 'انتهت مدة الدخول، جرّب مرة ثانية',
    en: 'The access token has expired. Please refresh it.',
  },
  [ErrorCode.ACCOUNT_DISABLED]: {
    ar: 'حسابك موقوف، تواصل معنا عشان نساعدك',
    en: 'This account has been disabled.',
  },
  [ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING]: {
    ar: 'عندك طلب انضمام تحت المراجعة، انتظر ردّنا عليه',
    en: 'You already have a vendor application under review.',
  },
  [ErrorCode.VENDOR_APPLICATION_NOT_PENDING]: {
    ar: 'هذا الطلب انراجع من قبل، حدّث الصفحة',
    en: 'This vendor application has already been reviewed.',
  },
  [ErrorCode.VENDOR_SUSPENDED]: {
    ar: 'متجرك موقوف حاليًا، تواصل معنا عشان نساعدك',
    en: 'This vendor account is suspended.',
  },
  [ErrorCode.VENDOR_ACCESS_ALREADY_HELD]: {
    ar: 'حسابك مرتبط بمتجر من قبل، ما تقدر تقدّم طلب متجر جديد',
    en: 'This account already works for a vendor.',
  },
  [ErrorCode.VENDOR_CR_EXISTS]: {
    ar: 'رقم السجل التجاري مسجّل لمتجر عندنا، تأكد من الرقم أو تواصل معنا',
    en: 'A store with this commercial registration number is already registered.',
  },
  [ErrorCode.PRODUCT_NOT_EDITABLE]: {
    ar: 'ما تقدر تعدّل المنتج وهو بهالحالة، حدّث الصفحة وشوف حالته',
    en: 'This product cannot be changed in its current state.',
  },
  [ErrorCode.PRODUCT_NOT_SUBMITTABLE]: {
    ar: 'المنتج ناقص: أضف صورة وحجم واحد على الأقل',
    en: 'Add at least one image and one size.',
  },
  [ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED]: {
    ar: 'التاجر عدّل المنتج بعد هالطلب، حدّث الصفحة وراجع التعديل الجديد',
    en: 'The vendor has edited this product again since this request. Reload and review the newer request.',
  },
  [ErrorCode.ADDRESS_LIMIT_REACHED]: {
    ar: 'وصلت للحد الأعلى من العناوين، احذف عنوان عشان تضيف جديد',
    en: 'You have reached the maximum number of addresses. Delete one to add another.',
  },
  [ErrorCode.ACCOUNT_HAS_STAFF_ACCESS]: {
    ar: 'حسابك عنده صلاحية تاجر أو مطبخ أو إدارة، تواصل معنا نشيلها قبل حذف الحساب',
    en: 'Your account has vendor, kitchen or admin access. Contact us to remove it before deleting your account.',
  },
  [ErrorCode.RECENT_SIGN_IN_REQUIRED]: {
    ar: 'عشان نحمي حسابك، سجّل دخولك مرة ثانية وبعدها احذف الحساب',
    en: 'For your security, sign in again, then delete your account.',
  },
  [ErrorCode.INVALID_POLYGON]: {
    ar: 'حدود المنطقة غير صحيحة، تأكد إن الشكل مقفول وإن خطوطه ما تتقاطع',
    en: 'The zone boundary is not a valid shape. Make sure it is closed and its edges do not cross.',
  },
  [ErrorCode.NOT_IMPLEMENTED]: {
    ar: 'هالخدمة جاية قريب، جرّب بعدين',
    en: 'This is not available yet.',
  },
  [ErrorCode.CART_EMPTY]: {
    ar: 'السلة فاضية، أضف منتجات أول',
    en: 'Your cart is empty.',
  },
  [ErrorCode.CART_VENDOR_MISMATCH]: {
    ar: 'سلتك فيها منتجات من متجر ثاني، تبي تفضّيها وتبدأ من هالمتجر؟',
    en: 'Your cart has products from another store.',
  },
  [ErrorCode.PRODUCT_UNAVAILABLE]: {
    ar: 'هالمنتج غير متوفر الحين',
    en: 'This product is not available right now.',
  },
  [ErrorCode.SIZE_UNAVAILABLE]: {
    ar: 'هالحجم خلص، اختر حجم ثاني',
    en: 'This size is out of stock.',
  },
  [ErrorCode.OPTION_NOT_IN_PRODUCT]: {
    ar: 'أحد الخيارات ما عاد موجود، حدّث الصفحة واختر من جديد',
    en: 'One of the chosen options is not offered for this product.',
  },
  [ErrorCode.INCOMPATIBLE_CUTTING_PACKAGING]: {
    ar: 'هالتقطيع ما يمشي مع هالتغليف، غيّر واحد منهم',
    en: 'This cut cannot be packed this way.',
  },
  [ErrorCode.OPTION_REQUIRED]: {
    ar: 'اختر طريقة التقطيع',
    en: 'Choose a cut.',
  },
  [ErrorCode.PRICE_CHANGED]: {
    ar: 'تغيّر سعر بعض المنتجات في سلتك، راجعها قبل تكمل',
    en: 'Some prices in your cart have changed.',
  },
  [ErrorCode.ITEM_UNAVAILABLE]: {
    ar: 'فيه منتج في سلتك ما عاد متوفر، شيله وكمّل',
    en: 'An item in your cart is no longer available.',
  },
  [ErrorCode.MIN_ORDER_NOT_MET]: {
    ar: 'باقي لك شوي توصل للحد الأدنى للطلب',
    en: 'Your order is below the minimum.',
  },
  [ErrorCode.COUPON_NOT_FOUND]: {
    ar: 'الكود غير صحيح، تأكد منه',
    en: 'This coupon code is not valid.',
  },
  [ErrorCode.COUPON_EXPIRED]: {
    ar: 'انتهت صلاحية الكود',
    en: 'This coupon has expired.',
  },
  [ErrorCode.COUPON_NOT_APPLICABLE]: {
    ar: 'الكود ما ينطبق على سلتك',
    en: 'This coupon does not apply to your cart.',
  },
  [ErrorCode.COUPON_MIN_ORDER]: {
    ar: 'الكود يحتاج طلب أكبر، زد سلتك وجرّب',
    en: 'Your cart is below this coupon’s minimum.',
  },
  [ErrorCode.COUPON_LIMIT_REACHED]: {
    ar: 'الكود استُخدم للحد المسموح',
    en: 'This coupon has reached its limit.',
  },
  [ErrorCode.COUPON_CODE_TAKEN]: {
    ar: 'فيه كوبون بنفس الكود، اختر كود ثاني',
    en: 'A coupon with this code already exists.',
  },
  [ErrorCode.FULFILMENT_REQUIRED]: {
    ar: 'اختر التوصيل أو الاستلام والموعد أول',
    en: 'Choose delivery or pickup and a day first.',
  },
  [ErrorCode.FULFILMENT_NOT_SUPPORTED]: {
    ar: 'بعض المنتجات ما تدعم هالطريقة، اختر الطريقة الثانية',
    en: 'Some items do not support this option.',
  },
  [ErrorCode.ADDRESS_NOT_COVERED]: {
    ar: 'للأسف ما نوصّل لهالعنوان حاليًا',
    en: 'We do not deliver to this address yet.',
  },
  [ErrorCode.DAY_FULL]: {
    ar: 'هاليوم اكتمل، اختر يوم ثاني',
    en: 'This day is fully booked.',
  },
  [ErrorCode.DAY_NOT_AVAILABLE]: {
    ar: 'هاليوم غير متاح، اختر يوم ثاني',
    en: 'This day is not available.',
  },
  [ErrorCode.ORDERING_PAUSED]: {
    ar: 'الطلبات متوقفة مؤقتًا، جرّب بعدين',
    en: 'Ordering is paused for now.',
  },
  [ErrorCode.PROFILE_INCOMPLETE]: {
    ar: 'أضف اسمك في الملف الشخصي قبل تطلب',
    en: 'Add your name to your profile first.',
  },
  [ErrorCode.WALLET_INSUFFICIENT]: {
    ar: 'رصيد المحفظة ما يكفي',
    en: 'Your wallet balance is not enough.',
  },
  [ErrorCode.PAYMENT_METHOD_NOT_AVAILABLE]: {
    ar: 'طريقة الدفع هذي غير متاحة لطلبك، اختر طريقة ثانية',
    en: 'This payment method is not available for your order.',
  },
  [ErrorCode.ORDER_NOT_PAYABLE]: {
    ar: 'هالطلب ما يحتاج دفع الحين',
    en: 'This order cannot be paid now.',
  },
  [ErrorCode.PAYMENT_IN_PROGRESS]: {
    ar: 'فيه عملية دفع مفتوحة لهالطلب، كمّلها أو انتظر شوي',
    en: 'A payment for this order is still in progress.',
  },
  [ErrorCode.ORDER_TRANSITION_NOT_ALLOWED]: {
    ar: 'ما يمكن تغيير حالة الطلب لهالخطوة، حدّث الصفحة',
    en: 'This order cannot be moved to that status.',
  },
};
