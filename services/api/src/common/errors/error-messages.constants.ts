import type { LocalizedText } from '../i18n/localized-text.type';
import { ErrorCode } from './error-code.enum';

/** The message catalogue: the text a client sees for each error code. */
export const ERROR_MESSAGES: Readonly<Record<ErrorCode, LocalizedText>> = {
  [ErrorCode.VALIDATION_FAILED]: {
    ar: 'البيانات المرسلة غير صالحة.',
    en: 'The request data is invalid.',
  },
  [ErrorCode.BAD_REQUEST]: {
    ar: 'تعذّرت معالجة الطلب.',
    en: 'The request could not be processed.',
  },
  [ErrorCode.METHOD_NOT_ALLOWED]: {
    ar: 'طريقة الطلب غير مسموح بها لهذا المسار.',
    en: 'This request method is not allowed for this route.',
  },
  [ErrorCode.PAYLOAD_TOO_LARGE]: {
    ar: 'حجم الطلب أكبر من المسموح به.',
    en: 'The request is too large.',
  },
  [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: {
    ar: 'نوع محتوى الطلب غير مدعوم.',
    en: 'The request content type is not supported.',
  },
  [ErrorCode.NOT_FOUND]: {
    ar: 'المورد المطلوب غير موجود.',
    en: 'The requested resource was not found.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    ar: 'يلزم تسجيل الدخول.',
    en: 'Authentication is required.',
  },
  [ErrorCode.FORBIDDEN]: {
    ar: 'ليست لديك صلاحية لتنفيذ هذا الإجراء.',
    en: 'You do not have permission to perform this action.',
  },
  [ErrorCode.CONFLICT]: {
    ar: 'يتعارض الطلب مع الحالة الحالية للمورد.',
    en: 'The request conflicts with the current state of the resource.',
  },
  [ErrorCode.RATE_LIMITED]: {
    ar: 'عدد الطلبات كبير جدًا، يرجى المحاولة لاحقًا.',
    en: 'Too many requests. Please try again later.',
  },
  [ErrorCode.TRANSACTION_CONFLICT]: {
    ar: 'تعارض الطلب مع طلب آخر متزامن ولم يُحفظ شيء، يرجى إعادة المحاولة.',
    en: 'The request clashed with another one made at the same time and nothing was saved. Please try again.',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    ar: 'الخدمة غير متاحة مؤقتًا، يرجى المحاولة بعد قليل.',
    en: 'The service is temporarily unavailable. Please try again shortly.',
  },
  [ErrorCode.INTERNAL_ERROR]: {
    ar: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقًا.',
    en: 'An unexpected error occurred. Please try again later.',
  },
  [ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED]: {
    ar: 'نوع الملف غير مسموح به لهذا الغرض.',
    en: 'This file type is not allowed here.',
  },
  [ErrorCode.MEDIA_NOT_FOUND]: {
    ar: 'الملف غير موجود.',
    en: 'The file was not found.',
  },
  [ErrorCode.MEDIA_UPLOAD_EXPIRED]: {
    ar: 'انتهت مهلة تأكيد رفع الملف، يرجى رفعه من جديد.',
    en: 'The upload was not confirmed in time. Please upload the file again.',
  },
  [ErrorCode.MEDIA_UPLOAD_REJECTED]: {
    ar: 'رُفض الملف المرفوع لأنه لا يطابق الشروط المطلوبة، يرجى رفع ملف آخر.',
    en: 'The uploaded file was rejected because it does not meet the requirements. Please upload another file.',
  },
  [ErrorCode.MEDIA_NOT_READY]: {
    ar: 'الملف غير جاهز بعد.',
    en: 'The file is not ready yet.',
  },
};
