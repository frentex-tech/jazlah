import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[Locale('ar'), Locale('en')];

  /// No description provided for @appName.
  ///
  /// In ar, this message translates to:
  /// **'جزلة'**
  String get appName;

  /// No description provided for @languageName.
  ///
  /// In ar, this message translates to:
  /// **'العربية'**
  String get languageName;

  /// No description provided for @otherLanguageCode.
  ///
  /// In ar, this message translates to:
  /// **'EN'**
  String get otherLanguageCode;

  /// No description provided for @otherLanguageName.
  ///
  /// In ar, this message translates to:
  /// **'English'**
  String get otherLanguageName;

  /// No description provided for @errorGeneric.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ غير متوقع. حاول مرة أخرى.'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.'**
  String get errorNetwork;

  /// No description provided for @retry.
  ///
  /// In ar, this message translates to:
  /// **'إعادة المحاولة'**
  String get retry;

  /// No description provided for @galleryTitle.
  ///
  /// In ar, this message translates to:
  /// **'معرض المكوّنات'**
  String get galleryTitle;

  /// No description provided for @galleryLangAr.
  ///
  /// In ar, this message translates to:
  /// **'العربية'**
  String get galleryLangAr;

  /// No description provided for @galleryLangEn.
  ///
  /// In ar, this message translates to:
  /// **'English'**
  String get galleryLangEn;

  /// No description provided for @galleryInteractiveNote.
  ///
  /// In ar, this message translates to:
  /// **'حالات الضغط والتركيز تظهر عند التفاعل'**
  String get galleryInteractiveNote;

  /// No description provided for @galleryButtons.
  ///
  /// In ar, this message translates to:
  /// **'الأزرار'**
  String get galleryButtons;

  /// No description provided for @galleryInputs.
  ///
  /// In ar, this message translates to:
  /// **'حقول الإدخال'**
  String get galleryInputs;

  /// No description provided for @galleryPhone.
  ///
  /// In ar, this message translates to:
  /// **'حقل رقم الجوال'**
  String get galleryPhone;

  /// No description provided for @galleryOtp.
  ///
  /// In ar, this message translates to:
  /// **'رمز التحقق'**
  String get galleryOtp;

  /// No description provided for @galleryChips.
  ///
  /// In ar, this message translates to:
  /// **'الرقائق'**
  String get galleryChips;

  /// No description provided for @galleryChoices.
  ///
  /// In ar, this message translates to:
  /// **'مربع الاختيار والراديو والمفتاح'**
  String get galleryChoices;

  /// No description provided for @galleryBadges.
  ///
  /// In ar, this message translates to:
  /// **'الشارات'**
  String get galleryBadges;

  /// No description provided for @galleryCards.
  ///
  /// In ar, this message translates to:
  /// **'البطاقات'**
  String get galleryCards;

  /// No description provided for @galleryProductCards.
  ///
  /// In ar, this message translates to:
  /// **'بطاقات المنتجات'**
  String get galleryProductCards;

  /// No description provided for @galleryHeaders.
  ///
  /// In ar, this message translates to:
  /// **'رأس الصفحة'**
  String get galleryHeaders;

  /// No description provided for @galleryTabBar.
  ///
  /// In ar, this message translates to:
  /// **'شريط التبويب'**
  String get galleryTabBar;

  /// No description provided for @gallerySearch.
  ///
  /// In ar, this message translates to:
  /// **'شريط البحث'**
  String get gallerySearch;

  /// No description provided for @galleryMapPins.
  ///
  /// In ar, this message translates to:
  /// **'دبابيس الخريطة'**
  String get galleryMapPins;

  /// No description provided for @galleryTimeline.
  ///
  /// In ar, this message translates to:
  /// **'مراحل الطلب'**
  String get galleryTimeline;

  /// No description provided for @galleryStates.
  ///
  /// In ar, this message translates to:
  /// **'حالات الشاشة'**
  String get galleryStates;

  /// No description provided for @gallerySkeleton.
  ///
  /// In ar, this message translates to:
  /// **'هيكل التحميل'**
  String get gallerySkeleton;

  /// No description provided for @galleryOverlays.
  ///
  /// In ar, this message translates to:
  /// **'النوافذ والتنبيهات'**
  String get galleryOverlays;

  /// No description provided for @galleryOrderNow.
  ///
  /// In ar, this message translates to:
  /// **'اطلب الآن'**
  String get galleryOrderNow;

  /// No description provided for @galleryFullName.
  ///
  /// In ar, this message translates to:
  /// **'الاسم الكامل'**
  String get galleryFullName;

  /// No description provided for @galleryTypeHere.
  ///
  /// In ar, this message translates to:
  /// **'اكتب هنا'**
  String get galleryTypeHere;

  /// No description provided for @galleryHelper.
  ///
  /// In ar, this message translates to:
  /// **'نص مساعد'**
  String get galleryHelper;

  /// No description provided for @galleryNameValue.
  ///
  /// In ar, this message translates to:
  /// **'عبدالرحمن محمد'**
  String get galleryNameValue;

  /// No description provided for @galleryRequired.
  ///
  /// In ar, this message translates to:
  /// **'هذا الحقل مطلوب'**
  String get galleryRequired;

  /// No description provided for @galleryPhoneLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم الجوال'**
  String get galleryPhoneLabel;

  /// No description provided for @galleryPhoneHint.
  ///
  /// In ar, this message translates to:
  /// **'سنرسل لك رمز التحقق'**
  String get galleryPhoneHint;

  /// No description provided for @galleryPhoneError.
  ///
  /// In ar, this message translates to:
  /// **'رقم الجوال غير مكتمل'**
  String get galleryPhoneError;

  /// No description provided for @galleryOtpError.
  ///
  /// In ar, this message translates to:
  /// **'الرمز غير صحيح، حاول مرة أخرى'**
  String get galleryOtpError;

  /// No description provided for @galleryChipLabel.
  ///
  /// In ar, this message translates to:
  /// **'خروف نعيمي'**
  String get galleryChipLabel;

  /// No description provided for @galleryGiftWrap.
  ///
  /// In ar, this message translates to:
  /// **'إضافة تغليف هدية'**
  String get galleryGiftWrap;

  /// No description provided for @galleryBadgeNew.
  ///
  /// In ar, this message translates to:
  /// **'جديد'**
  String get galleryBadgeNew;

  /// No description provided for @galleryBadgeReview.
  ///
  /// In ar, this message translates to:
  /// **'قيد المراجعة'**
  String get galleryBadgeReview;

  /// No description provided for @galleryBadgePreparing.
  ///
  /// In ar, this message translates to:
  /// **'قيد التجهيز'**
  String get galleryBadgePreparing;

  /// No description provided for @galleryBadgeDelivered.
  ///
  /// In ar, this message translates to:
  /// **'تم التسليم'**
  String get galleryBadgeDelivered;

  /// No description provided for @galleryBadgeCancelled.
  ///
  /// In ar, this message translates to:
  /// **'ملغي'**
  String get galleryBadgeCancelled;

  /// No description provided for @galleryBadgeToday.
  ///
  /// In ar, this message translates to:
  /// **'ذُبح اليوم'**
  String get galleryBadgeToday;

  /// No description provided for @galleryCardTitle.
  ///
  /// In ar, this message translates to:
  /// **'عنوان البطاقة'**
  String get galleryCardTitle;

  /// No description provided for @galleryCardBody.
  ///
  /// In ar, this message translates to:
  /// **'نص توضيحي قصير يصف محتوى البطاقة.'**
  String get galleryCardBody;

  /// No description provided for @galleryVendor.
  ///
  /// In ar, this message translates to:
  /// **'مجازر الفلاح'**
  String get galleryVendor;

  /// No description provided for @galleryProduct.
  ///
  /// In ar, this message translates to:
  /// **'ريب آي بقري طازج'**
  String get galleryProduct;

  /// No description provided for @galleryProductMeta.
  ///
  /// In ar, this message translates to:
  /// **'500 جم · تقطيع شرائح'**
  String get galleryProductMeta;

  /// No description provided for @galleryCurrency.
  ///
  /// In ar, this message translates to:
  /// **'ر.س'**
  String get galleryCurrency;

  /// No description provided for @galleryAdd.
  ///
  /// In ar, this message translates to:
  /// **'أضف إلى السلة'**
  String get galleryAdd;

  /// No description provided for @galleryLocation.
  ///
  /// In ar, this message translates to:
  /// **'التوصيل إلى الملقا، الرياض'**
  String get galleryLocation;

  /// No description provided for @galleryNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get galleryNotifications;

  /// No description provided for @galleryCart.
  ///
  /// In ar, this message translates to:
  /// **'السلة'**
  String get galleryCart;

  /// No description provided for @galleryPageTitle.
  ///
  /// In ar, this message translates to:
  /// **'عنوان الصفحة'**
  String get galleryPageTitle;

  /// No description provided for @galleryTabHome.
  ///
  /// In ar, this message translates to:
  /// **'الرئيسية'**
  String get galleryTabHome;

  /// No description provided for @galleryTabServices.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get galleryTabServices;

  /// No description provided for @galleryTabOrders.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات'**
  String get galleryTabOrders;

  /// No description provided for @galleryTabAccount.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get galleryTabAccount;

  /// No description provided for @gallerySearchHint.
  ///
  /// In ar, this message translates to:
  /// **'ابحث عن لحوم أو متاجر'**
  String get gallerySearchHint;

  /// No description provided for @galleryFilter.
  ///
  /// In ar, this message translates to:
  /// **'التصفية'**
  String get galleryFilter;

  /// No description provided for @galleryClear.
  ///
  /// In ar, this message translates to:
  /// **'مسح'**
  String get galleryClear;

  /// No description provided for @galleryPinAddress.
  ///
  /// In ar, this message translates to:
  /// **'موقع التوصيل'**
  String get galleryPinAddress;

  /// No description provided for @galleryPinCourier.
  ///
  /// In ar, this message translates to:
  /// **'المندوب'**
  String get galleryPinCourier;

  /// No description provided for @galleryStepReceived.
  ///
  /// In ar, this message translates to:
  /// **'تم استلام الطلب'**
  String get galleryStepReceived;

  /// No description provided for @galleryStepPreparing.
  ///
  /// In ar, this message translates to:
  /// **'جارٍ التجهيز'**
  String get galleryStepPreparing;

  /// No description provided for @galleryStepSlaughtered.
  ///
  /// In ar, this message translates to:
  /// **'ذُبح وجُهّز'**
  String get galleryStepSlaughtered;

  /// No description provided for @galleryStepOnTheWay.
  ///
  /// In ar, this message translates to:
  /// **'في الطريق'**
  String get galleryStepOnTheWay;

  /// No description provided for @galleryStepDelivered.
  ///
  /// In ar, this message translates to:
  /// **'تم التسليم'**
  String get galleryStepDelivered;

  /// No description provided for @galleryTime1.
  ///
  /// In ar, this message translates to:
  /// **'10:02 ص'**
  String get galleryTime1;

  /// No description provided for @galleryTime2.
  ///
  /// In ar, this message translates to:
  /// **'10:15 ص'**
  String get galleryTime2;

  /// No description provided for @galleryTime3.
  ///
  /// In ar, this message translates to:
  /// **'11:30 ص'**
  String get galleryTime3;

  /// No description provided for @galleryTime4.
  ///
  /// In ar, this message translates to:
  /// **'12:10 م'**
  String get galleryTime4;

  /// No description provided for @galleryTime5.
  ///
  /// In ar, this message translates to:
  /// **'12:40 م'**
  String get galleryTime5;

  /// No description provided for @galleryCartTitle.
  ///
  /// In ar, this message translates to:
  /// **'سلتك فارغة'**
  String get galleryCartTitle;

  /// No description provided for @galleryCartBody.
  ///
  /// In ar, this message translates to:
  /// **'أضف منتجات من المتاجر وسنجهّزها لك طازجة.'**
  String get galleryCartBody;

  /// No description provided for @galleryCartAction.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح المنتجات'**
  String get galleryCartAction;

  /// No description provided for @galleryOrdersTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد طلبات بعد'**
  String get galleryOrdersTitle;

  /// No description provided for @galleryOrdersBody.
  ///
  /// In ar, this message translates to:
  /// **'طلباتك السابقة والحالية ستظهر هنا.'**
  String get galleryOrdersBody;

  /// No description provided for @galleryOrdersAction.
  ///
  /// In ar, this message translates to:
  /// **'ابدأ أول طلب'**
  String get galleryOrdersAction;

  /// No description provided for @gallerySearchTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد نتائج'**
  String get gallerySearchTitle;

  /// No description provided for @gallerySearchBody.
  ///
  /// In ar, this message translates to:
  /// **'جرّب كلمات أخرى أو غيّر عوامل التصفية.'**
  String get gallerySearchBody;

  /// No description provided for @gallerySearchAction.
  ///
  /// In ar, this message translates to:
  /// **'مسح التصفية'**
  String get gallerySearchAction;

  /// No description provided for @galleryErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ غير متوقع'**
  String get galleryErrorTitle;

  /// No description provided for @galleryErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل البيانات. حاول مرة أخرى.'**
  String get galleryErrorBody;

  /// No description provided for @galleryOfflineTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد اتصال بالإنترنت'**
  String get galleryOfflineTitle;

  /// No description provided for @galleryOfflineBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم أعد المحاولة.'**
  String get galleryOfflineBody;

  /// No description provided for @galleryDeniedTitle.
  ///
  /// In ar, this message translates to:
  /// **'ليست لديك صلاحية'**
  String get galleryDeniedTitle;

  /// No description provided for @galleryDeniedBody.
  ///
  /// In ar, this message translates to:
  /// **'تواصل مع مدير الحساب للحصول على الوصول.'**
  String get galleryDeniedBody;

  /// No description provided for @galleryBack.
  ///
  /// In ar, this message translates to:
  /// **'رجوع'**
  String get galleryBack;

  /// No description provided for @gallerySheetTitle.
  ///
  /// In ar, this message translates to:
  /// **'اختر الحجم'**
  String get gallerySheetTitle;

  /// No description provided for @gallerySheetContent.
  ///
  /// In ar, this message translates to:
  /// **'المحتوى'**
  String get gallerySheetContent;

  /// No description provided for @galleryShowSheet.
  ///
  /// In ar, this message translates to:
  /// **'عرض النافذة السفلية'**
  String get galleryShowSheet;

  /// No description provided for @galleryShowDialog.
  ///
  /// In ar, this message translates to:
  /// **'عرض نافذة التأكيد'**
  String get galleryShowDialog;

  /// No description provided for @galleryShowDestructive.
  ///
  /// In ar, this message translates to:
  /// **'عرض نافذة الحذف'**
  String get galleryShowDestructive;

  /// No description provided for @galleryShowToast.
  ///
  /// In ar, this message translates to:
  /// **'عرض تنبيه'**
  String get galleryShowToast;

  /// No description provided for @galleryDialogTitle.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد الطلب؟'**
  String get galleryDialogTitle;

  /// No description provided for @galleryDialogBody.
  ///
  /// In ar, this message translates to:
  /// **'سيتم إرسال طلبك إلى المتجر فور التأكيد.'**
  String get galleryDialogBody;

  /// No description provided for @galleryConfirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد'**
  String get galleryConfirm;

  /// No description provided for @galleryCancel.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء'**
  String get galleryCancel;

  /// No description provided for @galleryDeleteTitle.
  ///
  /// In ar, this message translates to:
  /// **'حذف العنوان؟'**
  String get galleryDeleteTitle;

  /// No description provided for @galleryDeleteBody.
  ///
  /// In ar, this message translates to:
  /// **'لن تتمكن من استرجاع هذا العنوان بعد الحذف.'**
  String get galleryDeleteBody;

  /// No description provided for @galleryDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف'**
  String get galleryDelete;

  /// No description provided for @galleryToastSuccess.
  ///
  /// In ar, this message translates to:
  /// **'تمت إضافة المنتج إلى السلة'**
  String get galleryToastSuccess;

  /// No description provided for @galleryToastError.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر إتمام العملية، حاول مرة أخرى'**
  String get galleryToastError;

  /// No description provided for @galleryToastWarning.
  ///
  /// In ar, this message translates to:
  /// **'الكمية المتاحة محدودة'**
  String get galleryToastWarning;

  /// No description provided for @galleryToastInfo.
  ///
  /// In ar, this message translates to:
  /// **'سيصلك إشعار عند تجهيز الطلب'**
  String get galleryToastInfo;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
