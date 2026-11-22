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

  /// No description provided for @back.
  ///
  /// In ar, this message translates to:
  /// **'رجوع'**
  String get back;

  /// No description provided for @onboardingTitle1.
  ///
  /// In ar, this message translates to:
  /// **'لحوم طازجة من أفضل المتاجر'**
  String get onboardingTitle1;

  /// No description provided for @onboardingBody1.
  ///
  /// In ar, this message translates to:
  /// **'اختر من متاجر موثّقة، واعرف وقت الذبح وجودة كل قطعة قبل أن تطلب.'**
  String get onboardingBody1;

  /// No description provided for @onboardingTitle2.
  ///
  /// In ar, this message translates to:
  /// **'وصّل طلبك في يومك'**
  String get onboardingTitle2;

  /// No description provided for @onboardingBody2.
  ///
  /// In ar, this message translates to:
  /// **'حدّد يوم التوصيل المناسب لك، وتابع طلبك لحظة بلحظة حتى باب البيت.'**
  String get onboardingBody2;

  /// No description provided for @onboardingTitle3.
  ///
  /// In ar, this message translates to:
  /// **'لكل مناسبة ما يناسبها'**
  String get onboardingTitle3;

  /// No description provided for @onboardingBody3.
  ///
  /// In ar, this message translates to:
  /// **'ولائم وعقائق وأضاحٍ وزيارات مزارع، ونطبخها لك إن أردت.'**
  String get onboardingBody3;

  /// No description provided for @onboardingNext.
  ///
  /// In ar, this message translates to:
  /// **'التالي'**
  String get onboardingNext;

  /// No description provided for @onboardingSkip.
  ///
  /// In ar, this message translates to:
  /// **'تخطي'**
  String get onboardingSkip;

  /// No description provided for @onboardingStart.
  ///
  /// In ar, this message translates to:
  /// **'ابدأ الآن'**
  String get onboardingStart;

  /// No description provided for @phoneTitle.
  ///
  /// In ar, this message translates to:
  /// **'أهلًا بك في جزلة'**
  String get phoneTitle;

  /// No description provided for @phoneSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رقم جوالك وسنرسل لك رمز التحقق.'**
  String get phoneSubtitle;

  /// No description provided for @phoneLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم الجوال'**
  String get phoneLabel;

  /// No description provided for @phoneHint.
  ///
  /// In ar, this message translates to:
  /// **'سنرسل لك رمز التحقق'**
  String get phoneHint;

  /// No description provided for @phoneInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رقم جوال سعودي صحيح مكوّن من 9 أرقام'**
  String get phoneInvalid;

  /// No description provided for @trustVerified.
  ///
  /// In ar, this message translates to:
  /// **'متاجر موثّقة'**
  String get trustVerified;

  /// No description provided for @trustFresh.
  ///
  /// In ar, this message translates to:
  /// **'طازج يوم الذبح'**
  String get trustFresh;

  /// No description provided for @trustDelivery.
  ///
  /// In ar, this message translates to:
  /// **'توصيل في يومك'**
  String get trustDelivery;

  /// No description provided for @termsNotice.
  ///
  /// In ar, this message translates to:
  /// **'بالمتابعة فأنت توافق على الشروط وسياسة الخصوصية.'**
  String get termsNotice;

  /// No description provided for @sendCode.
  ///
  /// In ar, this message translates to:
  /// **'إرسال الرمز'**
  String get sendCode;

  /// No description provided for @otpTitle.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رمز التحقق'**
  String get otpTitle;

  /// No description provided for @otpSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أرسلنا رمزًا من {length} أرقام إلى {phone}'**
  String otpSubtitle(int length, String phone);

  /// No description provided for @otpFieldLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز التحقق'**
  String get otpFieldLabel;

  /// No description provided for @otpResendIn.
  ///
  /// In ar, this message translates to:
  /// **'إعادة الإرسال بعد {time}'**
  String otpResendIn(String time);

  /// No description provided for @otpResend.
  ///
  /// In ar, this message translates to:
  /// **'إعادة إرسال الرمز'**
  String get otpResend;

  /// No description provided for @otpInvalid.
  ///
  /// In ar, this message translates to:
  /// **'الرمز غير صحيح، حاول مرة أخرى'**
  String get otpInvalid;

  /// No description provided for @otpExpired.
  ///
  /// In ar, this message translates to:
  /// **'انتهت صلاحية الرمز، اطلب رمزًا جديدًا'**
  String get otpExpired;

  /// No description provided for @otpReauthNotice.
  ///
  /// In ar, this message translates to:
  /// **'لأمانك، أكّد أنه أنت قبل حذف الحساب'**
  String get otpReauthNotice;

  /// No description provided for @confirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد'**
  String get confirm;

  /// No description provided for @profileTitle.
  ///
  /// In ar, this message translates to:
  /// **'أكمل ملفك'**
  String get profileTitle;

  /// No description provided for @profileSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'نحتاج اسمك لنُجهّز طلباتك ونتواصل معك.'**
  String get profileSubtitle;

  /// No description provided for @editProfileTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعديل الملف'**
  String get editProfileTitle;

  /// No description provided for @fullNameLabel.
  ///
  /// In ar, this message translates to:
  /// **'الاسم الكامل'**
  String get fullNameLabel;

  /// No description provided for @fieldPlaceholder.
  ///
  /// In ar, this message translates to:
  /// **'اكتب هنا'**
  String get fieldPlaceholder;

  /// No description provided for @nameRequired.
  ///
  /// In ar, this message translates to:
  /// **'الاسم مطلوب'**
  String get nameRequired;

  /// No description provided for @nameLength.
  ///
  /// In ar, this message translates to:
  /// **'الاسم من 2 إلى 60 حرفًا'**
  String get nameLength;

  /// No description provided for @emailLabel.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإلكتروني (اختياري)'**
  String get emailLabel;

  /// No description provided for @emailHint.
  ///
  /// In ar, this message translates to:
  /// **'لن نرسل لك إلا إشعارات طلباتك'**
  String get emailHint;

  /// No description provided for @emailInvalid.
  ///
  /// In ar, this message translates to:
  /// **'أدخل بريدًا إلكترونيًا صحيحًا'**
  String get emailInvalid;

  /// No description provided for @marketingConsent.
  ///
  /// In ar, this message translates to:
  /// **'أوافق على استلام العروض والأخبار'**
  String get marketingConsent;

  /// No description provided for @saveAndContinue.
  ///
  /// In ar, this message translates to:
  /// **'حفظ ومتابعة'**
  String get saveAndContinue;

  /// No description provided for @save.
  ///
  /// In ar, this message translates to:
  /// **'حفظ'**
  String get save;

  /// No description provided for @tabHome.
  ///
  /// In ar, this message translates to:
  /// **'الرئيسية'**
  String get tabHome;

  /// No description provided for @tabServices.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get tabServices;

  /// No description provided for @tabOrders.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات'**
  String get tabOrders;

  /// No description provided for @tabAccount.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get tabAccount;

  /// No description provided for @cart.
  ///
  /// In ar, this message translates to:
  /// **'السلة'**
  String get cart;

  /// No description provided for @accountTitle.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get accountTitle;

  /// No description provided for @editProfile.
  ///
  /// In ar, this message translates to:
  /// **'تعديل الملف'**
  String get editProfile;

  /// No description provided for @statOrders.
  ///
  /// In ar, this message translates to:
  /// **'طلبًا'**
  String get statOrders;

  /// No description provided for @statAddresses.
  ///
  /// In ar, this message translates to:
  /// **'عناوين'**
  String get statAddresses;

  /// No description provided for @statAnimals.
  ///
  /// In ar, this message translates to:
  /// **'مواشٍ'**
  String get statAnimals;

  /// No description provided for @statListings.
  ///
  /// In ar, this message translates to:
  /// **'إعلانات'**
  String get statListings;

  /// No description provided for @menuOrders.
  ///
  /// In ar, this message translates to:
  /// **'طلباتي'**
  String get menuOrders;

  /// No description provided for @menuOrdersActive.
  ///
  /// In ar, this message translates to:
  /// **'{count} طلب نشط'**
  String menuOrdersActive(int count);

  /// No description provided for @menuAddresses.
  ///
  /// In ar, this message translates to:
  /// **'عناويني'**
  String get menuAddresses;

  /// No description provided for @menuAnimals.
  ///
  /// In ar, this message translates to:
  /// **'مواشيّ'**
  String get menuAnimals;

  /// No description provided for @menuFeedListings.
  ///
  /// In ar, this message translates to:
  /// **'إعلاناتي في سوق الأعلاف'**
  String get menuFeedListings;

  /// No description provided for @menuPoints.
  ///
  /// In ar, this message translates to:
  /// **'نقاط جزلة'**
  String get menuPoints;

  /// No description provided for @menuPointsValue.
  ///
  /// In ar, this message translates to:
  /// **'{points} نقطة'**
  String menuPointsValue(int points);

  /// No description provided for @menuStories.
  ///
  /// In ar, this message translates to:
  /// **'قصص الاستلام'**
  String get menuStories;

  /// No description provided for @menuCharity.
  ///
  /// In ar, this message translates to:
  /// **'صدقاتي · سهم الخير'**
  String get menuCharity;

  /// No description provided for @menuNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get menuNotifications;

  /// No description provided for @menuSettings.
  ///
  /// In ar, this message translates to:
  /// **'الإعدادات'**
  String get menuSettings;

  /// No description provided for @menuHelp.
  ///
  /// In ar, this message translates to:
  /// **'المساعدة والدعم'**
  String get menuHelp;

  /// No description provided for @signOut.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الخروج'**
  String get signOut;

  /// No description provided for @settingsTitle.
  ///
  /// In ar, this message translates to:
  /// **'الإعدادات'**
  String get settingsTitle;

  /// No description provided for @settingsLanguage.
  ///
  /// In ar, this message translates to:
  /// **'اللغة'**
  String get settingsLanguage;

  /// No description provided for @settingsNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get settingsNotifications;

  /// No description provided for @settingsOrderNotifications.
  ///
  /// In ar, this message translates to:
  /// **'إشعارات الطلبات'**
  String get settingsOrderNotifications;

  /// No description provided for @settingsOffers.
  ///
  /// In ar, this message translates to:
  /// **'العروض والأخبار'**
  String get settingsOffers;

  /// No description provided for @settingsLoadError.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الإعدادات'**
  String get settingsLoadError;

  /// No description provided for @checkConnection.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم حاول مرة أخرى.'**
  String get checkConnection;

  /// No description provided for @deleteAccount.
  ///
  /// In ar, this message translates to:
  /// **'حذف الحساب'**
  String get deleteAccount;

  /// No description provided for @deleteAccountTitle.
  ///
  /// In ar, this message translates to:
  /// **'حذف الحساب؟'**
  String get deleteAccountTitle;

  /// No description provided for @deleteAccountBody.
  ///
  /// In ar, this message translates to:
  /// **'سيتم حذف حسابك وعناوينك وطلباتك السابقة نهائيًا، ولا يمكن التراجع عن ذلك.'**
  String get deleteAccountBody;

  /// No description provided for @cancel.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء'**
  String get cancel;

  /// No description provided for @deleteReasonTitle.
  ///
  /// In ar, this message translates to:
  /// **'لماذا تريد حذف حسابك؟'**
  String get deleteReasonTitle;

  /// No description provided for @deleteReasonHint.
  ///
  /// In ar, this message translates to:
  /// **'اختياري، يساعدنا على التحسّن.'**
  String get deleteReasonHint;

  /// No description provided for @deleteReasonNotUsing.
  ///
  /// In ar, this message translates to:
  /// **'لم أعد أستخدم التطبيق'**
  String get deleteReasonNotUsing;

  /// No description provided for @deleteReasonPrivacy.
  ///
  /// In ar, this message translates to:
  /// **'مخاوف تتعلق بالخصوصية'**
  String get deleteReasonPrivacy;

  /// No description provided for @deleteReasonBadExperience.
  ///
  /// In ar, this message translates to:
  /// **'مررت بتجربة سيئة'**
  String get deleteReasonBadExperience;

  /// No description provided for @deleteReasonOtherAccount.
  ///
  /// In ar, this message translates to:
  /// **'لدي حساب آخر'**
  String get deleteReasonOtherAccount;

  /// No description provided for @deleteReasonOther.
  ///
  /// In ar, this message translates to:
  /// **'سبب آخر'**
  String get deleteReasonOther;

  /// No description provided for @deleteAccountForever.
  ///
  /// In ar, this message translates to:
  /// **'حذف الحساب نهائيًا'**
  String get deleteAccountForever;

  /// No description provided for @accountDeleted.
  ///
  /// In ar, this message translates to:
  /// **'تم حذف حسابك'**
  String get accountDeleted;

  /// No description provided for @guestTitle.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك'**
  String get guestTitle;

  /// No description provided for @guestBody.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك لتتابع طلباتك وعناوينك.'**
  String get guestBody;

  /// No description provided for @signIn.
  ///
  /// In ar, this message translates to:
  /// **'تسجيل الدخول'**
  String get signIn;

  /// No description provided for @comingSoonTitle.
  ///
  /// In ar, this message translates to:
  /// **'قريبًا'**
  String get comingSoonTitle;

  /// No description provided for @comingSoonBody.
  ///
  /// In ar, this message translates to:
  /// **'هذا القسم قيد التجهيز.'**
  String get comingSoonBody;

  /// No description provided for @clear.
  ///
  /// In ar, this message translates to:
  /// **'مسح'**
  String get clear;

  /// No description provided for @locAddAddressTitle.
  ///
  /// In ar, this message translates to:
  /// **'إضافة عنوان'**
  String get locAddAddressTitle;

  /// No description provided for @locSearchHint.
  ///
  /// In ar, this message translates to:
  /// **'ابحث عن حي أو شارع'**
  String get locSearchHint;

  /// No description provided for @locSearchActiveHint.
  ///
  /// In ar, this message translates to:
  /// **'ابحث عن عنوان أو حي'**
  String get locSearchActiveHint;

  /// No description provided for @locMoveHint.
  ///
  /// In ar, this message translates to:
  /// **'حرّك الخريطة لضبط الدبوس على موقعك.'**
  String get locMoveHint;

  /// No description provided for @locConfirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد الموقع'**
  String get locConfirm;

  /// No description provided for @locPinLabel.
  ///
  /// In ar, this message translates to:
  /// **'موقع التوصيل'**
  String get locPinLabel;

  /// No description provided for @locOutOfCoverageBanner.
  ///
  /// In ar, this message translates to:
  /// **'عذرًا، لا نوصّل إلى هذا الموقع حاليًا.'**
  String get locOutOfCoverageBanner;

  /// No description provided for @locPermTitle.
  ///
  /// In ar, this message translates to:
  /// **'السماح بالوصول إلى موقعك'**
  String get locPermTitle;

  /// No description provided for @locPermBody.
  ///
  /// In ar, this message translates to:
  /// **'نستخدم موقعك لنعرض لك المتاجر القريبة ونحدد عنوان التوصيل بدقة.'**
  String get locPermBody;

  /// No description provided for @locPermManual.
  ///
  /// In ar, this message translates to:
  /// **'إدخال العنوان يدويًا'**
  String get locPermManual;

  /// No description provided for @locPermAllow.
  ///
  /// In ar, this message translates to:
  /// **'السماح أثناء الاستخدام'**
  String get locPermAllow;

  /// No description provided for @locPermDeniedTitle.
  ///
  /// In ar, this message translates to:
  /// **'إذن الموقع متوقف'**
  String get locPermDeniedTitle;

  /// No description provided for @locPermDeniedBody.
  ///
  /// In ar, this message translates to:
  /// **'فعّل إذن الموقع من إعدادات الجهاز، أو أدخل عنوانك يدويًا.'**
  String get locPermDeniedBody;

  /// No description provided for @locPermOpenSettings.
  ///
  /// In ar, this message translates to:
  /// **'فتح الإعدادات'**
  String get locPermOpenSettings;

  /// No description provided for @locPermLoadingTitle.
  ///
  /// In ar, this message translates to:
  /// **'نحدد موقعك'**
  String get locPermLoadingTitle;

  /// No description provided for @locPermLoadingBody.
  ///
  /// In ar, this message translates to:
  /// **'لحظات ونجد موقعك الحالي…'**
  String get locPermLoadingBody;

  /// No description provided for @locPermErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحديد موقعك'**
  String get locPermErrorTitle;

  /// No description provided for @locPermErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تأكد من تفعيل خدمة الموقع في جهازك ثم حاول مرة أخرى.'**
  String get locPermErrorBody;

  /// No description provided for @locOutScreenTitle.
  ///
  /// In ar, this message translates to:
  /// **'الموقع'**
  String get locOutScreenTitle;

  /// No description provided for @locOutTitle.
  ///
  /// In ar, this message translates to:
  /// **'خارج نطاق التوصيل'**
  String get locOutTitle;

  /// No description provided for @locOutBody.
  ///
  /// In ar, this message translates to:
  /// **'لا نوصّل إلى هذا الموقع حتى الآن. اختر موقعًا آخر داخل مناطق الخدمة.'**
  String get locOutBody;

  /// No description provided for @locOutChange.
  ///
  /// In ar, this message translates to:
  /// **'تغيير الموقع'**
  String get locOutChange;

  /// No description provided for @locOutPickup.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح واستلم من المتجر'**
  String get locOutPickup;

  /// No description provided for @locOutCities.
  ///
  /// In ar, this message translates to:
  /// **'المناطق المتاحة حاليًا: {cities}.'**
  String locOutCities(String cities);

  /// No description provided for @locOutChecking.
  ///
  /// In ar, this message translates to:
  /// **'نتحقق من تغطية موقعك…'**
  String get locOutChecking;

  /// No description provided for @locOutErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر التحقق من التغطية'**
  String get locOutErrorTitle;

  /// No description provided for @locOutErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء التحقق من موقعك. حاول مرة أخرى.'**
  String get locOutErrorBody;

  /// No description provided for @locHomeOutOfCoverage.
  ///
  /// In ar, this message translates to:
  /// **'خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'**
  String get locHomeOutOfCoverage;

  /// No description provided for @locChoose.
  ///
  /// In ar, this message translates to:
  /// **'اختر موقعك'**
  String get locChoose;

  /// No description provided for @listSeparator.
  ///
  /// In ar, this message translates to:
  /// **'، '**
  String get listSeparator;

  /// No description provided for @addrTitle.
  ///
  /// In ar, this message translates to:
  /// **'عناويني'**
  String get addrTitle;

  /// No description provided for @addrDefault.
  ///
  /// In ar, this message translates to:
  /// **'افتراضي'**
  String get addrDefault;

  /// No description provided for @addrOutOfCoverage.
  ///
  /// In ar, this message translates to:
  /// **'خارج النطاق'**
  String get addrOutOfCoverage;

  /// No description provided for @addrAdd.
  ///
  /// In ar, this message translates to:
  /// **'إضافة عنوان جديد'**
  String get addrAdd;

  /// No description provided for @addrAddShort.
  ///
  /// In ar, this message translates to:
  /// **'إضافة عنوان'**
  String get addrAddShort;

  /// No description provided for @addrEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد عناوين بعد'**
  String get addrEmptyTitle;

  /// No description provided for @addrEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'أضف عنوانك لنعرف المتاجر القريبة منك ونوصّل إليك.'**
  String get addrEmptyBody;

  /// No description provided for @addrLoadError.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل العناوين'**
  String get addrLoadError;

  /// No description provided for @addrLoadErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب عناوينك. حاول مرة أخرى.'**
  String get addrLoadErrorBody;

  /// No description provided for @addrEdit.
  ///
  /// In ar, this message translates to:
  /// **'تعديل العنوان'**
  String get addrEdit;

  /// No description provided for @addrNewTitle.
  ///
  /// In ar, this message translates to:
  /// **'عنوان جديد'**
  String get addrNewTitle;

  /// No description provided for @addrLabel.
  ///
  /// In ar, this message translates to:
  /// **'اسم العنوان'**
  String get addrLabel;

  /// No description provided for @addrLabelRequired.
  ///
  /// In ar, this message translates to:
  /// **'اسم العنوان مطلوب'**
  String get addrLabelRequired;

  /// No description provided for @addrCity.
  ///
  /// In ar, this message translates to:
  /// **'المدينة'**
  String get addrCity;

  /// No description provided for @addrDistrict.
  ///
  /// In ar, this message translates to:
  /// **'الحي'**
  String get addrDistrict;

  /// No description provided for @addrDistrictRequired.
  ///
  /// In ar, this message translates to:
  /// **'الحي مطلوب'**
  String get addrDistrictRequired;

  /// No description provided for @addrStreet.
  ///
  /// In ar, this message translates to:
  /// **'الشارع وتفاصيل المبنى'**
  String get addrStreet;

  /// No description provided for @addrDriverNotes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات للسائق (اختياري)'**
  String get addrDriverNotes;

  /// No description provided for @addrDriverNotesHint.
  ///
  /// In ar, this message translates to:
  /// **'مثلًا: البوابة الخلفية، الدور الثاني'**
  String get addrDriverNotesHint;

  /// No description provided for @addrMakeDefault.
  ///
  /// In ar, this message translates to:
  /// **'اجعله العنوان الافتراضي'**
  String get addrMakeDefault;

  /// No description provided for @addrChangeOnMap.
  ///
  /// In ar, this message translates to:
  /// **'تغيير الموقع على الخريطة'**
  String get addrChangeOnMap;

  /// No description provided for @addrSave.
  ///
  /// In ar, this message translates to:
  /// **'حفظ التغييرات'**
  String get addrSave;

  /// No description provided for @addrSaveNew.
  ///
  /// In ar, this message translates to:
  /// **'حفظ العنوان'**
  String get addrSaveNew;

  /// No description provided for @addrDelete.
  ///
  /// In ar, this message translates to:
  /// **'حذف العنوان'**
  String get addrDelete;

  /// No description provided for @addrDeleteTitle.
  ///
  /// In ar, this message translates to:
  /// **'حذف العنوان؟'**
  String get addrDeleteTitle;

  /// No description provided for @addrDeleteBody.
  ///
  /// In ar, this message translates to:
  /// **'لن تتمكن من استرجاع هذا العنوان بعد الحذف.'**
  String get addrDeleteBody;

  /// No description provided for @delete.
  ///
  /// In ar, this message translates to:
  /// **'حذف'**
  String get delete;

  /// No description provided for @addrLockedNotice.
  ///
  /// In ar, this message translates to:
  /// **'هذا العنوان مرتبط بطلب قيد التنفيذ، ولا يمكن تعديله أو حذفه حتى يكتمل الطلب.'**
  String get addrLockedNotice;

  /// No description provided for @addrLockedLabel.
  ///
  /// In ar, this message translates to:
  /// **'عنوان مقفل'**
  String get addrLockedLabel;

  /// No description provided for @addrOutOfCoverageNotice.
  ///
  /// In ar, this message translates to:
  /// **'هذا العنوان خارج نطاق التوصيل حاليًا. يمكنك حفظه، والاستلام من المتجر متاح.'**
  String get addrOutOfCoverageNotice;

  /// No description provided for @addrLimitReached.
  ///
  /// In ar, this message translates to:
  /// **'وصلت إلى الحد الأقصى من العناوين ({limit}). احذف عنوانًا لإضافة آخر.'**
  String addrLimitReached(int limit);

  /// No description provided for @seeAll.
  ///
  /// In ar, this message translates to:
  /// **'الكل'**
  String get seeAll;

  /// No description provided for @filters.
  ///
  /// In ar, this message translates to:
  /// **'تصفية'**
  String get filters;

  /// No description provided for @currency.
  ///
  /// In ar, this message translates to:
  /// **'ر.س'**
  String get currency;

  /// No description provided for @addToCart.
  ///
  /// In ar, this message translates to:
  /// **'أضف إلى السلة'**
  String get addToCart;

  /// No description provided for @freshToday.
  ///
  /// In ar, this message translates to:
  /// **'ذُبح اليوم'**
  String get freshToday;

  /// No description provided for @unavailableNow.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح حاليًا'**
  String get unavailableNow;

  /// No description provided for @offlineTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد اتصال بالإنترنت'**
  String get offlineTitle;

  /// No description provided for @offlineBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم أعد المحاولة.'**
  String get offlineBody;

  /// No description provided for @loadMoreFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل المزيد.'**
  String get loadMoreFailed;

  /// No description provided for @timeAm.
  ///
  /// In ar, this message translates to:
  /// **'ص'**
  String get timeAm;

  /// No description provided for @timePm.
  ///
  /// In ar, this message translates to:
  /// **'م'**
  String get timePm;

  /// No description provided for @homeSearchHint.
  ///
  /// In ar, this message translates to:
  /// **'ابحث عن لحوم أو متاجر'**
  String get homeSearchHint;

  /// No description provided for @homeCategories.
  ///
  /// In ar, this message translates to:
  /// **'الأقسام'**
  String get homeCategories;

  /// No description provided for @homeBestSellers.
  ///
  /// In ar, this message translates to:
  /// **'الأكثر مبيعًا'**
  String get homeBestSellers;

  /// No description provided for @homePartnerStores.
  ///
  /// In ar, this message translates to:
  /// **'متاجر شريكة'**
  String get homePartnerStores;

  /// No description provided for @homeStoresPaused.
  ///
  /// In ar, this message translates to:
  /// **'المتاجر القريبة منك متوقفة مؤقتًا. تصفّح الآن واطلب عند عودتها.'**
  String get homeStoresPaused;

  /// No description provided for @homeEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد متاجر في منطقتك بعد'**
  String get homeEmptyTitle;

  /// No description provided for @homeEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'نعمل على الوصول إلى حيّك قريبًا. جرّب عنوانًا آخر.'**
  String get homeEmptyBody;

  /// No description provided for @homeChangeAddress.
  ///
  /// In ar, this message translates to:
  /// **'تغيير العنوان'**
  String get homeChangeAddress;

  /// No description provided for @homeErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الصفحة الرئيسية'**
  String get homeErrorTitle;

  /// No description provided for @homeErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب المتاجر والمنتجات. حاول مرة أخرى.'**
  String get homeErrorBody;

  /// No description provided for @categoriesSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'اختر القسم الذي يناسب طلبك.'**
  String get categoriesSubtitle;

  /// No description provided for @categoriesComing.
  ///
  /// In ar, this message translates to:
  /// **'أقسام قادمة'**
  String get categoriesComing;

  /// No description provided for @categoriesEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد أقسام متاحة'**
  String get categoriesEmptyTitle;

  /// No description provided for @categoriesEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'لا تتوفر أقسام في منطقتك حاليًا. تحقق مرة أخرى قريبًا.'**
  String get categoriesEmptyBody;

  /// No description provided for @backToHome.
  ///
  /// In ar, this message translates to:
  /// **'العودة للرئيسية'**
  String get backToHome;

  /// No description provided for @categoriesErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الأقسام'**
  String get categoriesErrorTitle;

  /// No description provided for @categoriesErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب الأقسام. حاول مرة أخرى.'**
  String get categoriesErrorBody;

  /// No description provided for @categoryEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد منتجات في هذا القسم بعد'**
  String get categoryEmptyTitle;

  /// No description provided for @categoryEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح الأقسام الأخرى أو عُد لاحقًا.'**
  String get categoryEmptyBody;

  /// No description provided for @productsErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل المنتجات'**
  String get productsErrorTitle;

  /// No description provided for @productsErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب المنتجات. حاول مرة أخرى.'**
  String get productsErrorBody;

  /// No description provided for @sortPopular.
  ///
  /// In ar, this message translates to:
  /// **'الأكثر مبيعًا'**
  String get sortPopular;

  /// No description provided for @sortPriceAsc.
  ///
  /// In ar, this message translates to:
  /// **'الأقل سعرًا'**
  String get sortPriceAsc;

  /// No description provided for @sortPriceDesc.
  ///
  /// In ar, this message translates to:
  /// **'الأعلى سعرًا'**
  String get sortPriceDesc;

  /// No description provided for @storeRating.
  ///
  /// In ar, this message translates to:
  /// **'{rating} ({count} تقييم)'**
  String storeRating(String rating, int count);

  /// No description provided for @storeOpenUntil.
  ///
  /// In ar, this message translates to:
  /// **'مفتوح حتى {time}'**
  String storeOpenUntil(String time);

  /// No description provided for @storeClosedNow.
  ///
  /// In ar, this message translates to:
  /// **'مغلق الآن'**
  String get storeClosedNow;

  /// No description provided for @storeDeliveryIn.
  ///
  /// In ar, this message translates to:
  /// **'توصيل خلال {minutes} دقيقة'**
  String storeDeliveryIn(int minutes);

  /// No description provided for @storeMinOrder.
  ///
  /// In ar, this message translates to:
  /// **'الحد الأدنى للطلب {amount} ر.س'**
  String storeMinOrder(String amount);

  /// No description provided for @storeClosedOpensTomorrow.
  ///
  /// In ar, this message translates to:
  /// **'المتجر مغلق الآن ويفتح غدًا {time}. يمكنك تصفّح المنتجات والطلب عند فتحه.'**
  String storeClosedOpensTomorrow(String time);

  /// No description provided for @storeClosedOpensAt.
  ///
  /// In ar, this message translates to:
  /// **'المتجر مغلق الآن ويفتح {time}. يمكنك تصفّح المنتجات والطلب عند فتحه.'**
  String storeClosedOpensAt(String time);

  /// No description provided for @storeClosedNotice.
  ///
  /// In ar, this message translates to:
  /// **'المتجر مغلق الآن. يمكنك تصفّح المنتجات والطلب عند فتحه.'**
  String get storeClosedNotice;

  /// No description provided for @storeEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد منتجات حاليًا'**
  String get storeEmptyTitle;

  /// No description provided for @storeEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'لم يضف هذا المتجر منتجات بعد. جرّب متجرًا آخر.'**
  String get storeEmptyBody;

  /// No description provided for @storeBrowseStores.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح المتاجر'**
  String get storeBrowseStores;

  /// No description provided for @storeErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل المتجر'**
  String get storeErrorTitle;

  /// No description provided for @storeErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب بيانات المتجر. حاول مرة أخرى.'**
  String get storeErrorBody;

  /// No description provided for @storeInfo.
  ///
  /// In ar, this message translates to:
  /// **'معلومات المتجر'**
  String get storeInfo;

  /// No description provided for @storeHours.
  ///
  /// In ar, this message translates to:
  /// **'ساعات العمل'**
  String get storeHours;

  /// No description provided for @storeHoursValue.
  ///
  /// In ar, this message translates to:
  /// **'{opens} – {closes}'**
  String storeHoursValue(String opens, String closes);

  /// No description provided for @storeLocation.
  ///
  /// In ar, this message translates to:
  /// **'الموقع'**
  String get storeLocation;

  /// No description provided for @storePickup.
  ///
  /// In ar, this message translates to:
  /// **'الاستلام من المتجر'**
  String get storePickup;

  /// No description provided for @storePickupYes.
  ///
  /// In ar, this message translates to:
  /// **'متاح'**
  String get storePickupYes;

  /// No description provided for @storePickupNo.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح'**
  String get storePickupNo;

  /// No description provided for @storesTitle.
  ///
  /// In ar, this message translates to:
  /// **'المتاجر'**
  String get storesTitle;

  /// No description provided for @searchTitle.
  ///
  /// In ar, this message translates to:
  /// **'البحث'**
  String get searchTitle;

  /// No description provided for @searchRecent.
  ///
  /// In ar, this message translates to:
  /// **'عمليات البحث الأخيرة'**
  String get searchRecent;

  /// No description provided for @searchPopular.
  ///
  /// In ar, this message translates to:
  /// **'الأكثر بحثًا'**
  String get searchPopular;

  /// No description provided for @searchResultsFor.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{نتيجة واحدة} =2{نتيجتان} few{{count} نتائج} other{{count} نتيجة}} لـ «{query}»'**
  String searchResultsFor(int count, String query);

  /// No description provided for @searchResults.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{نتيجة واحدة} =2{نتيجتان} few{{count} نتائج} other{{count} نتيجة}}'**
  String searchResults(int count);

  /// No description provided for @searchNoResultsFor.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد نتائج لـ «{query}»'**
  String searchNoResultsFor(String query);

  /// No description provided for @searchNoResults.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد نتائج'**
  String get searchNoResults;

  /// No description provided for @searchNoResultsBody.
  ///
  /// In ar, this message translates to:
  /// **'جرّب كلمات أخرى أو غيّر عوامل التصفية.'**
  String get searchNoResultsBody;

  /// No description provided for @searchClearFilters.
  ///
  /// In ar, this message translates to:
  /// **'مسح التصفية'**
  String get searchClearFilters;

  /// No description provided for @searchErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تنفيذ البحث'**
  String get searchErrorTitle;

  /// No description provided for @searchErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء البحث. حاول مرة أخرى.'**
  String get searchErrorBody;

  /// No description provided for @searchFilterCount.
  ///
  /// In ar, this message translates to:
  /// **'تصفية ({count})'**
  String searchFilterCount(int count);

  /// No description provided for @searchFiltersTitle.
  ///
  /// In ar, this message translates to:
  /// **'تصفية النتائج'**
  String get searchFiltersTitle;

  /// No description provided for @searchPrice.
  ///
  /// In ar, this message translates to:
  /// **'السعر (ر.س)'**
  String get searchPrice;

  /// No description provided for @searchPriceMin.
  ///
  /// In ar, this message translates to:
  /// **'من {price} ر.س'**
  String searchPriceMin(String price);

  /// No description provided for @searchPriceMax.
  ///
  /// In ar, this message translates to:
  /// **'إلى {price} ر.س'**
  String searchPriceMax(String price);

  /// No description provided for @searchPriceUpTo.
  ///
  /// In ar, this message translates to:
  /// **'حتى {price} ر.س'**
  String searchPriceUpTo(String price);

  /// No description provided for @searchPriceRange.
  ///
  /// In ar, this message translates to:
  /// **'{min}–{max} ر.س'**
  String searchPriceRange(String min, String max);

  /// No description provided for @searchStore.
  ///
  /// In ar, this message translates to:
  /// **'المتجر'**
  String get searchStore;

  /// No description provided for @searchCategory.
  ///
  /// In ar, this message translates to:
  /// **'القسم'**
  String get searchCategory;

  /// No description provided for @searchSort.
  ///
  /// In ar, this message translates to:
  /// **'الترتيب'**
  String get searchSort;

  /// No description provided for @searchAvailableOnly.
  ///
  /// In ar, this message translates to:
  /// **'المتاح الآن فقط'**
  String get searchAvailableOnly;

  /// No description provided for @searchAvailable.
  ///
  /// In ar, this message translates to:
  /// **'المتاح الآن'**
  String get searchAvailable;

  /// No description provided for @searchShowCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{لا توجد نتائج} =1{عرض نتيجة واحدة} =2{عرض نتيجتين} few{عرض {count} نتائج} other{عرض {count} نتيجة}}'**
  String searchShowCount(int count);

  /// No description provided for @searchShowResults.
  ///
  /// In ar, this message translates to:
  /// **'عرض النتائج'**
  String get searchShowResults;

  /// No description provided for @searchReset.
  ///
  /// In ar, this message translates to:
  /// **'إعادة ضبط'**
  String get searchReset;

  /// No description provided for @productTitle.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل المنتج'**
  String get productTitle;

  /// No description provided for @productUnavailableNotice.
  ///
  /// In ar, this message translates to:
  /// **'هذا المنتج غير متاح حاليًا.'**
  String get productUnavailableNotice;

  /// No description provided for @productSlaughteredAt.
  ///
  /// In ar, this message translates to:
  /// **'ذُبح اليوم {time}'**
  String productSlaughteredAt(String time);

  /// No description provided for @productDeliveredWithin.
  ///
  /// In ar, this message translates to:
  /// **'{hours, plural, =1{يُبرَّد ويُسلَّم طازجًا خلال ساعة} =2{يُبرَّد ويُسلَّم طازجًا خلال ساعتين} few{يُبرَّد ويُسلَّم طازجًا خلال {hours} ساعات} other{يُبرَّد ويُسلَّم طازجًا خلال {hours} ساعة}}'**
  String productDeliveredWithin(int hours);

  /// No description provided for @productSize.
  ///
  /// In ar, this message translates to:
  /// **'الحجم'**
  String get productSize;

  /// No description provided for @productRequiredOne.
  ///
  /// In ar, this message translates to:
  /// **'مطلوب · اختر واحدًا'**
  String get productRequiredOne;

  /// No description provided for @productCut.
  ///
  /// In ar, this message translates to:
  /// **'التقطيع'**
  String get productCut;

  /// No description provided for @productPackaging.
  ///
  /// In ar, this message translates to:
  /// **'التغليف'**
  String get productPackaging;

  /// No description provided for @productPackagingHint.
  ///
  /// In ar, this message translates to:
  /// **'بعض الخيارات تتغيّر حسب التقطيع'**
  String get productPackagingHint;

  /// No description provided for @productExclusions.
  ///
  /// In ar, this message translates to:
  /// **'الاستثناءات'**
  String get productExclusions;

  /// No description provided for @productExclusionsHint.
  ///
  /// In ar, this message translates to:
  /// **'اختياري · نُزيلها لك أثناء التقطيع'**
  String get productExclusionsHint;

  /// No description provided for @productNotes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات للجزّار (اختياري)'**
  String get productNotes;

  /// No description provided for @productNotesPlaceholder.
  ///
  /// In ar, this message translates to:
  /// **'اكتب هنا'**
  String get productNotesPlaceholder;

  /// No description provided for @productNotesExample.
  ///
  /// In ar, this message translates to:
  /// **'مثال: شرائح رفيعة وبدون تتبيل'**
  String get productNotesExample;

  /// No description provided for @productQuantity.
  ///
  /// In ar, this message translates to:
  /// **'الكمية'**
  String get productQuantity;

  /// No description provided for @productDecrease.
  ///
  /// In ar, this message translates to:
  /// **'إنقاص الكمية'**
  String get productDecrease;

  /// No description provided for @productIncrease.
  ///
  /// In ar, this message translates to:
  /// **'زيادة الكمية'**
  String get productIncrease;

  /// No description provided for @productFree.
  ///
  /// In ar, this message translates to:
  /// **'مجاني'**
  String get productFree;

  /// No description provided for @productExtra.
  ///
  /// In ar, this message translates to:
  /// **'+{amount} ر.س'**
  String productExtra(String amount);

  /// No description provided for @productPrice.
  ///
  /// In ar, this message translates to:
  /// **'{amount} ر.س'**
  String productPrice(String amount);

  /// No description provided for @weightGrams.
  ///
  /// In ar, this message translates to:
  /// **'{n} جم'**
  String weightGrams(String n);

  /// No description provided for @weightKg.
  ///
  /// In ar, this message translates to:
  /// **'{n} كجم'**
  String weightKg(String n);

  /// No description provided for @productIncompatible.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح مع التقطيع المختار: {cut}'**
  String productIncompatible(String cut);

  /// No description provided for @productIncompatibleHelp.
  ///
  /// In ar, this message translates to:
  /// **'غيّر التقطيع إلى {cuts} لاختيار هذا الخيار.'**
  String productIncompatibleHelp(String cuts);

  /// No description provided for @productQuoted.
  ///
  /// In ar, this message translates to:
  /// **'«{name}»'**
  String productQuoted(String name);

  /// No description provided for @productOr.
  ///
  /// In ar, this message translates to:
  /// **' أو '**
  String get productOr;

  /// No description provided for @productTotal.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي'**
  String get productTotal;

  /// No description provided for @productPriceDetails.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل السعر'**
  String get productPriceDetails;

  /// No description provided for @productCutLine.
  ///
  /// In ar, this message translates to:
  /// **'التقطيع ({cut})'**
  String productCutLine(String cut);

  /// No description provided for @productDelivery.
  ///
  /// In ar, this message translates to:
  /// **'التوصيل'**
  String get productDelivery;

  /// No description provided for @productDeliveryAtCheckout.
  ///
  /// In ar, this message translates to:
  /// **'يُحسب في الدفع'**
  String get productDeliveryAtCheckout;

  /// No description provided for @productUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح'**
  String get productUnavailable;

  /// No description provided for @productChooseCut.
  ///
  /// In ar, this message translates to:
  /// **'اختر طريقة التقطيع قبل الإضافة إلى السلة'**
  String get productChooseCut;

  /// No description provided for @productErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل المنتج'**
  String get productErrorTitle;

  /// No description provided for @productErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'حدث خطأ أثناء جلب تفاصيل المنتج. حاول مرة أخرى.'**
  String get productErrorBody;

  /// No description provided for @productAdded.
  ///
  /// In ar, this message translates to:
  /// **'أُضيفت القطعة إلى السلة'**
  String get productAdded;

  /// No description provided for @checkoutTitle.
  ///
  /// In ar, this message translates to:
  /// **'إتمام الطلب'**
  String get checkoutTitle;

  /// No description provided for @cartReplaceTitle.
  ///
  /// In ar, this message translates to:
  /// **'استبدال السلة؟'**
  String get cartReplaceTitle;

  /// No description provided for @cartReplaceBody.
  ///
  /// In ar, this message translates to:
  /// **'سلتك فيها منتجات من {vendor}. السلة تجمع متجرًا واحدًا، فإضافة هذا المنتج تفرّغها وتبدأ سلة جديدة.'**
  String cartReplaceBody(String vendor);

  /// No description provided for @cartAnotherStore.
  ///
  /// In ar, this message translates to:
  /// **'متجر آخر'**
  String get cartAnotherStore;

  /// No description provided for @cartReplace.
  ///
  /// In ar, this message translates to:
  /// **'استبدال'**
  String get cartReplace;

  /// No description provided for @cartEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'سلتك فارغة'**
  String get cartEmptyTitle;

  /// No description provided for @cartEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'أضف منتجات من المتاجر وسنجهّزها لك طازجة.'**
  String get cartEmptyBody;

  /// No description provided for @cartBrowse.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح المنتجات'**
  String get cartBrowse;

  /// No description provided for @cartErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل السلة'**
  String get cartErrorTitle;

  /// No description provided for @cartErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم حاول مرة أخرى.'**
  String get cartErrorBody;

  /// No description provided for @cartMinOrder.
  ///
  /// In ar, this message translates to:
  /// **'الحد الأدنى للطلب {amount} ر.س'**
  String cartMinOrder(String amount);

  /// No description provided for @cartMinOrderRemaining.
  ///
  /// In ar, this message translates to:
  /// **'أضف {amount} ر.س من المنتجات لإكمال طلبك.'**
  String cartMinOrderRemaining(String amount);

  /// No description provided for @cartCouponLabel.
  ///
  /// In ar, this message translates to:
  /// **'رمز الخصم · اختياري'**
  String get cartCouponLabel;

  /// No description provided for @cartCouponPlaceholder.
  ///
  /// In ar, this message translates to:
  /// **'أدخل رمز الخصم'**
  String get cartCouponPlaceholder;

  /// No description provided for @cartCouponApply.
  ///
  /// In ar, this message translates to:
  /// **'تطبيق'**
  String get cartCouponApply;

  /// No description provided for @cartCouponRemove.
  ///
  /// In ar, this message translates to:
  /// **'إزالة'**
  String get cartCouponRemove;

  /// No description provided for @cartCouponApplied.
  ///
  /// In ar, this message translates to:
  /// **'تم تطبيق الرمز {code}'**
  String cartCouponApplied(String code);

  /// No description provided for @cartSubtotal.
  ///
  /// In ar, this message translates to:
  /// **'المجموع الفرعي'**
  String get cartSubtotal;

  /// No description provided for @cartDeliveryFee.
  ///
  /// In ar, this message translates to:
  /// **'رسوم التوصيل'**
  String get cartDeliveryFee;

  /// No description provided for @cartVat.
  ///
  /// In ar, this message translates to:
  /// **'منها ضريبة القيمة المضافة 15%'**
  String get cartVat;

  /// No description provided for @cartTotal.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي'**
  String get cartTotal;

  /// No description provided for @cartCheckout.
  ///
  /// In ar, this message translates to:
  /// **'متابعة إلى الدفع'**
  String get cartCheckout;

  /// No description provided for @cartCheckoutSoon.
  ///
  /// In ar, this message translates to:
  /// **'الدفع من التطبيق قادم قريبًا، وسلتك محفوظة على هذا الجهاز.'**
  String get cartCheckoutSoon;

  /// No description provided for @cartRemove.
  ///
  /// In ar, this message translates to:
  /// **'حذف'**
  String get cartRemove;

  /// No description provided for @cartUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'غير متوفر'**
  String get cartUnavailable;

  /// No description provided for @cartItemGone.
  ///
  /// In ar, this message translates to:
  /// **'منتج لم يعد متوفرًا'**
  String get cartItemGone;

  /// No description provided for @cartIssueUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'«{name}» لم يعد متوفرًا. احذفه لإكمال طلبك.'**
  String cartIssueUnavailable(String name);

  /// No description provided for @cartIssuePrice.
  ///
  /// In ar, this message translates to:
  /// **'تغيّر سعر «{name}» من {old} إلى {now} ر.س.'**
  String cartIssuePrice(String name, String old, String now);

  /// No description provided for @cartIssueAccept.
  ///
  /// In ar, this message translates to:
  /// **'موافق'**
  String get cartIssueAccept;

  /// No description provided for @cartMergeReplaced.
  ///
  /// In ar, this message translates to:
  /// **'استبدلنا سلتك السابقة بالمنتجات التي أضفتها قبل تسجيل الدخول.'**
  String get cartMergeReplaced;

  /// No description provided for @cartMergeSkipped.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{لم ننقل منتجًا واحدًا لأنه لم يعد متوفرًا.} =2{لم ننقل منتجين لأنهما لم يعودا متوفرين.} few{لم ننقل {count} منتجات لأنها لم تعد متوفرة.} many{لم ننقل {count} منتجًا لأنها لم تعد متوفرة.} other{لم ننقل {count} منتج لأنها لم تعد متوفرة.}}'**
  String cartMergeSkipped(int count);

  /// No description provided for @errCouponNotFound.
  ///
  /// In ar, this message translates to:
  /// **'رمز الخصم غير صحيح.'**
  String get errCouponNotFound;

  /// No description provided for @errCouponExpired.
  ///
  /// In ar, this message translates to:
  /// **'انتهت صلاحية رمز الخصم.'**
  String get errCouponExpired;

  /// No description provided for @errCouponMinOrder.
  ///
  /// In ar, this message translates to:
  /// **'قيمة سلتك أقل من الحد الأدنى لهذا الرمز.'**
  String get errCouponMinOrder;

  /// No description provided for @errCouponNotApplicable.
  ///
  /// In ar, this message translates to:
  /// **'هذا الرمز لا ينطبق على منتجات سلتك.'**
  String get errCouponNotApplicable;

  /// No description provided for @errCouponLimitReached.
  ///
  /// In ar, this message translates to:
  /// **'وصل هذا الرمز إلى حد الاستخدام.'**
  String get errCouponLimitReached;

  /// No description provided for @cartDiscountCode.
  ///
  /// In ar, this message translates to:
  /// **'الخصم ({code})'**
  String cartDiscountCode(String code);

  /// No description provided for @cartCouponDropped.
  ///
  /// In ar, this message translates to:
  /// **'لم يعد الرمز {code} ينطبق على سلتك، فأُزيل الخصم.'**
  String cartCouponDropped(String code);

  /// No description provided for @cartWeightEach.
  ///
  /// In ar, this message translates to:
  /// **'{weight} للقطعة'**
  String cartWeightEach(String weight);

  /// No description provided for @cartWeightAbout.
  ///
  /// In ar, this message translates to:
  /// **'نحو {weight}'**
  String cartWeightAbout(String weight);

  /// No description provided for @checkoutStep.
  ///
  /// In ar, this message translates to:
  /// **'الخطوة {step} من {total}: {name}'**
  String checkoutStep(int step, int total, String name);

  /// No description provided for @checkoutStepFulfilment.
  ///
  /// In ar, this message translates to:
  /// **'الاستلام واليوم'**
  String get checkoutStepFulfilment;

  /// No description provided for @checkoutDelivery.
  ///
  /// In ar, this message translates to:
  /// **'توصيل للعنوان'**
  String get checkoutDelivery;

  /// No description provided for @checkoutPickup.
  ///
  /// In ar, this message translates to:
  /// **'استلام من المتجر'**
  String get checkoutPickup;

  /// No description provided for @checkoutDeliveryAddress.
  ///
  /// In ar, this message translates to:
  /// **'عنوان التوصيل'**
  String get checkoutDeliveryAddress;

  /// No description provided for @checkoutOutOfCoverage.
  ///
  /// In ar, this message translates to:
  /// **'خارج نطاق التغطية'**
  String get checkoutOutOfCoverage;

  /// No description provided for @checkoutNoCoveredTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا يوجد عنوان داخل التغطية'**
  String get checkoutNoCoveredTitle;

  /// No description provided for @checkoutNoCoveredBody.
  ///
  /// In ar, this message translates to:
  /// **'أضف عنوانًا داخل نطاق التغطية لنوصّل لك، أو اختر الاستلام من المتجر.'**
  String get checkoutNoCoveredBody;

  /// No description provided for @checkoutPickupPlace.
  ///
  /// In ar, this message translates to:
  /// **'موقع الاستلام'**
  String get checkoutPickupPlace;

  /// No description provided for @checkoutPickupHours.
  ///
  /// In ar, this message translates to:
  /// **'الاستلام من {open} إلى {close}'**
  String checkoutPickupHours(String open, String close);

  /// No description provided for @checkoutDeliveryDay.
  ///
  /// In ar, this message translates to:
  /// **'يوم التوصيل'**
  String get checkoutDeliveryDay;

  /// No description provided for @checkoutPickupDay.
  ///
  /// In ar, this message translates to:
  /// **'يوم الاستلام'**
  String get checkoutPickupDay;

  /// No description provided for @checkoutCalendar.
  ///
  /// In ar, this message translates to:
  /// **'التقويم'**
  String get checkoutCalendar;

  /// No description provided for @checkoutDeliveryWindow.
  ///
  /// In ar, this message translates to:
  /// **'يصل بين {start} و {end}'**
  String checkoutDeliveryWindow(String start, String end);

  /// No description provided for @checkoutPickupWindow.
  ///
  /// In ar, this message translates to:
  /// **'جاهز للاستلام بين {start} و {end}'**
  String checkoutPickupWindow(String start, String end);

  /// No description provided for @checkoutRiyadhTime.
  ///
  /// In ar, this message translates to:
  /// **'{date} · بتوقيت الرياض'**
  String checkoutRiyadhTime(String date);

  /// No description provided for @checkoutPickAnother.
  ///
  /// In ar, this message translates to:
  /// **'{date} · اختر يومًا آخر متاحًا'**
  String checkoutPickAnother(String date);

  /// No description provided for @checkoutDaysLegend.
  ///
  /// In ar, this message translates to:
  /// **'دليل الأيام'**
  String get checkoutDaysLegend;

  /// No description provided for @checkoutDayClosed.
  ///
  /// In ar, this message translates to:
  /// **'مغلق: عطلة المتجر'**
  String get checkoutDayClosed;

  /// No description provided for @checkoutDayFull.
  ///
  /// In ar, this message translates to:
  /// **'مكتمل: لا توجد سعة'**
  String get checkoutDayFull;

  /// No description provided for @checkoutDayPastCutoff.
  ///
  /// In ar, this message translates to:
  /// **'انتهى وقت الطلب لهذا اليوم'**
  String get checkoutDayPastCutoff;

  /// No description provided for @checkoutDayVendorClosed.
  ///
  /// In ar, this message translates to:
  /// **'مغلق: المتجر لا يعمل في هذا اليوم'**
  String get checkoutDayVendorClosed;

  /// No description provided for @checkoutDayOutsideHorizon.
  ///
  /// In ar, this message translates to:
  /// **'خارج فترة الحجز المتاحة'**
  String get checkoutDayOutsideHorizon;

  /// No description provided for @checkoutDayUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح'**
  String get checkoutDayUnavailable;

  /// No description provided for @checkoutDaysErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الأيام المتاحة'**
  String get checkoutDaysErrorTitle;

  /// No description provided for @checkoutDaysErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من الاتصال ثم أعد المحاولة.'**
  String get checkoutDaysErrorBody;

  /// No description provided for @checkoutPausedTitle.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات متوقفة مؤقتًا، سنعود قريبًا'**
  String get checkoutPausedTitle;

  /// No description provided for @checkoutChooseDeliveryDay.
  ///
  /// In ar, this message translates to:
  /// **'اختر يوم التوصيل'**
  String get checkoutChooseDeliveryDay;

  /// No description provided for @checkoutChoosePickupDay.
  ///
  /// In ar, this message translates to:
  /// **'اختر يوم الاستلام'**
  String get checkoutChoosePickupDay;

  /// No description provided for @checkoutConfirmDay.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد اليوم'**
  String get checkoutConfirmDay;

  /// No description provided for @checkoutPreviousMonth.
  ///
  /// In ar, this message translates to:
  /// **'الشهر السابق'**
  String get checkoutPreviousMonth;

  /// No description provided for @checkoutNextMonth.
  ///
  /// In ar, this message translates to:
  /// **'الشهر التالي'**
  String get checkoutNextMonth;

  /// No description provided for @clockAm.
  ///
  /// In ar, this message translates to:
  /// **'صباحًا'**
  String get clockAm;

  /// No description provided for @clockPm.
  ///
  /// In ar, this message translates to:
  /// **'مساءً'**
  String get clockPm;

  /// No description provided for @clockAmShort.
  ///
  /// In ar, this message translates to:
  /// **'ص'**
  String get clockAmShort;

  /// No description provided for @clockPmShort.
  ///
  /// In ar, this message translates to:
  /// **'م'**
  String get clockPmShort;

  /// No description provided for @errOrderingPaused.
  ///
  /// In ar, this message translates to:
  /// **'الطلبات متوقفة مؤقتًا، حاول لاحقًا.'**
  String get errOrderingPaused;

  /// No description provided for @errFulfilmentNotSupported.
  ///
  /// In ar, this message translates to:
  /// **'بعض منتجات سلتك لا تتوفر بطريقة الاستلام هذه.'**
  String get errFulfilmentNotSupported;

  /// No description provided for @errAddressNotCovered.
  ///
  /// In ar, this message translates to:
  /// **'هذا العنوان خارج نطاق التوصيل.'**
  String get errAddressNotCovered;

  /// No description provided for @errDayFull.
  ///
  /// In ar, this message translates to:
  /// **'اكتمل هذا اليوم، اختر يومًا آخر.'**
  String get errDayFull;

  /// No description provided for @reviewTitle.
  ///
  /// In ar, this message translates to:
  /// **'الدفع والمراجعة'**
  String get reviewTitle;

  /// No description provided for @reviewItemsFrom.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{منتج واحد من {vendor}} =2{منتجان من {vendor}} few{{count} منتجات من {vendor}} many{{count} منتجًا من {vendor}} other{{count} منتج من {vendor}}}'**
  String reviewItemsFrom(int count, String vendor);

  /// No description provided for @reviewDeliveryTo.
  ///
  /// In ar, this message translates to:
  /// **'توصيل إلى {place}'**
  String reviewDeliveryTo(String place);

  /// No description provided for @reviewPickupFrom.
  ///
  /// In ar, this message translates to:
  /// **'استلام من {place}'**
  String reviewPickupFrom(String place);

  /// No description provided for @reviewPaymentMethod.
  ///
  /// In ar, this message translates to:
  /// **'طريقة الدفع'**
  String get reviewPaymentMethod;

  /// No description provided for @reviewTerms.
  ///
  /// In ar, this message translates to:
  /// **'بتأكيد الطلب فأنت توافق على الشروط والأحكام وسياسة الإلغاء.'**
  String get reviewTerms;

  /// No description provided for @reviewConfirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد الطلب'**
  String get reviewConfirm;

  /// No description provided for @payMadaCard.
  ///
  /// In ar, this message translates to:
  /// **'بطاقة مدى'**
  String get payMadaCard;

  /// No description provided for @payMada.
  ///
  /// In ar, this message translates to:
  /// **'مدى'**
  String get payMada;

  /// No description provided for @payCard.
  ///
  /// In ar, this message translates to:
  /// **'بطاقة ائتمانية'**
  String get payCard;

  /// No description provided for @payApplePay.
  ///
  /// In ar, this message translates to:
  /// **'Apple Pay'**
  String get payApplePay;

  /// No description provided for @payWallet.
  ///
  /// In ar, this message translates to:
  /// **'محفظة جزلة'**
  String get payWallet;

  /// No description provided for @payCod.
  ///
  /// In ar, this message translates to:
  /// **'الدفع عند الاستلام'**
  String get payCod;

  /// No description provided for @payEndingIn.
  ///
  /// In ar, this message translates to:
  /// **'تنتهي بـ {last4}'**
  String payEndingIn(String last4);

  /// No description provided for @payReasonWalletInsufficient.
  ///
  /// In ar, this message translates to:
  /// **'الرصيد غير كافٍ'**
  String get payReasonWalletInsufficient;

  /// No description provided for @payReasonUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'غير متاح لهذا الطلب'**
  String get payReasonUnavailable;

  /// No description provided for @errPriceChanged.
  ///
  /// In ar, this message translates to:
  /// **'تغيّرت أسعار بعض المنتجات، راجع سلتك.'**
  String get errPriceChanged;

  /// No description provided for @errItemUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'بعض المنتجات لم تعد متوفرة، راجع سلتك.'**
  String get errItemUnavailable;

  /// No description provided for @errMinOrderNotMet.
  ///
  /// In ar, this message translates to:
  /// **'سلتك أقل من الحد الأدنى للطلب.'**
  String get errMinOrderNotMet;

  /// No description provided for @placedTitle.
  ///
  /// In ar, this message translates to:
  /// **'تم استلام طلبك'**
  String get placedTitle;

  /// No description provided for @placedNumber.
  ///
  /// In ar, this message translates to:
  /// **'رقم الطلب {number}'**
  String placedNumber(String number);

  /// No description provided for @placedFresh.
  ///
  /// In ar, this message translates to:
  /// **'ذبح وتجهيز طازج صباح {weekday}'**
  String placedFresh(String weekday);

  /// No description provided for @placedDateVendor.
  ///
  /// In ar, this message translates to:
  /// **'{date} · بإشراف {vendor}'**
  String placedDateVendor(String date, String vendor);

  /// No description provided for @placedDeliveryWindow.
  ///
  /// In ar, this message translates to:
  /// **'توصيل بين {start} و{end}'**
  String placedDeliveryWindow(String start, String end);

  /// No description provided for @placedPickupWindow.
  ///
  /// In ar, this message translates to:
  /// **'استلام بين {start} و{end}'**
  String placedPickupWindow(String start, String end);

  /// No description provided for @placedTotal.
  ///
  /// In ar, this message translates to:
  /// **'{amount} ر.س شامل الضريبة'**
  String placedTotal(String amount);

  /// No description provided for @placedTrack.
  ///
  /// In ar, this message translates to:
  /// **'تتبع الطلب'**
  String get placedTrack;

  /// No description provided for @placedHome.
  ///
  /// In ar, this message translates to:
  /// **'العودة للرئيسية'**
  String get placedHome;

  /// No description provided for @payFakeTitle.
  ///
  /// In ar, this message translates to:
  /// **'بوابة الدفع التجريبية'**
  String get payFakeTitle;

  /// No description provided for @payFakeBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق 3DS لمبلغ {amount} ر.س. هذه صفحة المزوّد التجريبي.'**
  String payFakeBody(String amount);

  /// No description provided for @payFakeApprove.
  ///
  /// In ar, this message translates to:
  /// **'موافقة'**
  String get payFakeApprove;

  /// No description provided for @payFakeDecline.
  ///
  /// In ar, this message translates to:
  /// **'رفض'**
  String get payFakeDecline;

  /// No description provided for @payUseWallet.
  ///
  /// In ar, this message translates to:
  /// **'استخدام رصيد المحفظة · {amount} ر.س'**
  String payUseWallet(String amount);

  /// No description provided for @payRemaining.
  ///
  /// In ar, this message translates to:
  /// **'المتبقي {amount} ر.س بطريقة الدفع المختارة'**
  String payRemaining(String amount);

  /// No description provided for @payChooseMethod.
  ///
  /// In ar, this message translates to:
  /// **'اختر طريقة دفع للمتابعة'**
  String get payChooseMethod;

  /// No description provided for @payDeclined.
  ///
  /// In ar, this message translates to:
  /// **'تم رفض الدفع من البنك، جرّب بطاقة أخرى أو وسيلة دفع مختلفة'**
  String get payDeclined;

  /// No description provided for @payNotCompleted.
  ///
  /// In ar, this message translates to:
  /// **'لم يكتمل الدفع، أعد المحاولة أو اختر وسيلة أخرى'**
  String get payNotCompleted;

  /// No description provided for @payExpired.
  ///
  /// In ar, this message translates to:
  /// **'أُلغي الطلب لانتهاء مهلة الدفع (15 دقيقة).'**
  String get payExpired;

  /// No description provided for @payWalletPart.
  ///
  /// In ar, this message translates to:
  /// **'يُدفع {amount} ر.س من رصيد المحفظة.'**
  String payWalletPart(String amount);

  /// No description provided for @payWalletRestored.
  ///
  /// In ar, this message translates to:
  /// **'أُعيد {amount} ر.س إلى محفظتك.'**
  String payWalletRestored(String amount);

  /// No description provided for @placedUnderReview.
  ///
  /// In ar, this message translates to:
  /// **'سنراجع طلبك ونؤكده قريبًا.'**
  String get placedUnderReview;

  /// No description provided for @placedConfirmed.
  ///
  /// In ar, this message translates to:
  /// **'تم تأكيد طلبك.'**
  String get placedConfirmed;

  /// No description provided for @payStillProcessing.
  ///
  /// In ar, this message translates to:
  /// **'لا يزال الدفع قيد المعالجة، سنحدّث حالة طلبك فور وصول النتيجة.'**
  String get payStillProcessing;

  /// No description provided for @payOrderGone.
  ///
  /// In ar, this message translates to:
  /// **'هذا الطلب لم يعد متاحًا.'**
  String get payOrderGone;

  /// No description provided for @ordersAll.
  ///
  /// In ar, this message translates to:
  /// **'الكل'**
  String get ordersAll;

  /// No description provided for @ordersCurrent.
  ///
  /// In ar, this message translates to:
  /// **'الجارية'**
  String get ordersCurrent;

  /// No description provided for @ordersPast.
  ///
  /// In ar, this message translates to:
  /// **'المكتملة'**
  String get ordersPast;

  /// No description provided for @ordersNumber.
  ///
  /// In ar, this message translates to:
  /// **'طلب {number}'**
  String ordersNumber(String number);

  /// No description provided for @ordersToday.
  ///
  /// In ar, this message translates to:
  /// **'اليوم'**
  String get ordersToday;

  /// No description provided for @ordersTodayAt.
  ///
  /// In ar, this message translates to:
  /// **'اليوم، {time}'**
  String ordersTodayAt(String time);

  /// No description provided for @ordersEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا توجد طلبات بعد'**
  String get ordersEmptyTitle;

  /// No description provided for @ordersEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'طلباتك السابقة والحالية ستظهر هنا.'**
  String get ordersEmptyBody;

  /// No description provided for @ordersEmptyAction.
  ///
  /// In ar, this message translates to:
  /// **'ابدأ أول طلب'**
  String get ordersEmptyAction;

  /// No description provided for @ordersErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الطلبات'**
  String get ordersErrorTitle;

  /// No description provided for @ordersErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم حاول مرة أخرى.'**
  String get ordersErrorBody;

  /// No description provided for @ordersSignInTitle.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك لعرض الطلبات'**
  String get ordersSignInTitle;

  /// No description provided for @ordersSignInBody.
  ///
  /// In ar, this message translates to:
  /// **'طلباتك محفوظة في حسابك. سجّل الدخول لمتابعتها.'**
  String get ordersSignInBody;

  /// No description provided for @orderDetailTitle.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل الطلب'**
  String get orderDetailTitle;

  /// No description provided for @orderErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر تحميل الطلب'**
  String get orderErrorTitle;

  /// No description provided for @orderDeniedTitle.
  ///
  /// In ar, this message translates to:
  /// **'لا يمكنك عرض هذا الطلب'**
  String get orderDeniedTitle;

  /// No description provided for @orderDeniedBody.
  ///
  /// In ar, this message translates to:
  /// **'هذا الطلب مرتبط بحساب آخر.'**
  String get orderDeniedBody;

  /// No description provided for @orderLineDelivery.
  ///
  /// In ar, this message translates to:
  /// **'{vendor} · توصيل {day} بين {start} و{end} إلى {place}'**
  String orderLineDelivery(String vendor, String day, String start, String end, String place);

  /// No description provided for @orderLinePickup.
  ///
  /// In ar, this message translates to:
  /// **'{vendor} · استلام {day} بين {start} و{end} من {place}'**
  String orderLinePickup(String vendor, String day, String start, String end, String place);

  /// No description provided for @orderStatusTitle.
  ///
  /// In ar, this message translates to:
  /// **'حالة الطلب'**
  String get orderStatusTitle;

  /// No description provided for @orderTrackingTitle.
  ///
  /// In ar, this message translates to:
  /// **'تتبع التوصيل'**
  String get orderTrackingTitle;

  /// No description provided for @orderTrackingNotStarted.
  ///
  /// In ar, this message translates to:
  /// **'لم يبدأ التوصيل بعد'**
  String get orderTrackingNotStarted;

  /// No description provided for @orderTrackingNotStartedBody.
  ///
  /// In ar, this message translates to:
  /// **'سيُعيّن مندوب التوصيل ويصلك إشعار فور خروج الطلب.'**
  String get orderTrackingNotStartedBody;

  /// No description provided for @orderFreshnessTitle.
  ///
  /// In ar, this message translates to:
  /// **'شهادة الطزاجة'**
  String get orderFreshnessTitle;

  /// No description provided for @orderFreshnessWaiting.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار الذبح والتجهيز'**
  String get orderFreshnessWaiting;

  /// No description provided for @orderFreshnessWaitingBody.
  ///
  /// In ar, this message translates to:
  /// **'ستظهر هنا صور الذبح ووقته فور رفعها من المتجر.'**
  String get orderFreshnessWaitingBody;

  /// No description provided for @orderItems.
  ///
  /// In ar, this message translates to:
  /// **'المنتجات'**
  String get orderItems;

  /// No description provided for @orderPayment.
  ///
  /// In ar, this message translates to:
  /// **'الدفع'**
  String get orderPayment;

  /// No description provided for @orderPaid.
  ///
  /// In ar, this message translates to:
  /// **'مدفوع'**
  String get orderPaid;

  /// No description provided for @orderAwaitingPayment.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار الدفع'**
  String get orderAwaitingPayment;

  /// No description provided for @orderPayNow.
  ///
  /// In ar, this message translates to:
  /// **'إكمال الدفع'**
  String get orderPayNow;

  /// No description provided for @orderNotes.
  ///
  /// In ar, this message translates to:
  /// **'ملاحظات: {notes}'**
  String orderNotes(String notes);

  /// No description provided for @stepReceived.
  ///
  /// In ar, this message translates to:
  /// **'تم استلام الطلب'**
  String get stepReceived;

  /// No description provided for @stepPreparing.
  ///
  /// In ar, this message translates to:
  /// **'الذبح والتجهيز'**
  String get stepPreparing;

  /// No description provided for @stepReadyDelivery.
  ///
  /// In ar, this message translates to:
  /// **'جاهز للتوصيل'**
  String get stepReadyDelivery;

  /// No description provided for @stepReadyPickup.
  ///
  /// In ar, this message translates to:
  /// **'جاهز للاستلام'**
  String get stepReadyPickup;

  /// No description provided for @stepOnTheWay.
  ///
  /// In ar, this message translates to:
  /// **'في الطريق إليك'**
  String get stepOnTheWay;

  /// No description provided for @stepDelivered.
  ///
  /// In ar, this message translates to:
  /// **'تم التسليم'**
  String get stepDelivered;

  /// No description provided for @stepCollected.
  ///
  /// In ar, this message translates to:
  /// **'تم الاستلام'**
  String get stepCollected;

  /// No description provided for @statusPendingPayment.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار الدفع'**
  String get statusPendingPayment;

  /// No description provided for @statusNew.
  ///
  /// In ar, this message translates to:
  /// **'بانتظار التأكيد'**
  String get statusNew;

  /// No description provided for @statusConfirmed.
  ///
  /// In ar, this message translates to:
  /// **'مؤكد'**
  String get statusConfirmed;

  /// No description provided for @statusPreparing.
  ///
  /// In ar, this message translates to:
  /// **'قيد التجهيز'**
  String get statusPreparing;

  /// No description provided for @statusReady.
  ///
  /// In ar, this message translates to:
  /// **'جاهز'**
  String get statusReady;

  /// No description provided for @statusOnTheWay.
  ///
  /// In ar, this message translates to:
  /// **'في الطريق'**
  String get statusOnTheWay;

  /// No description provided for @statusDelivered.
  ///
  /// In ar, this message translates to:
  /// **'تم التسليم'**
  String get statusDelivered;

  /// No description provided for @statusCollected.
  ///
  /// In ar, this message translates to:
  /// **'تم الاستلام'**
  String get statusCollected;

  /// No description provided for @statusCancelled.
  ///
  /// In ar, this message translates to:
  /// **'ملغي'**
  String get statusCancelled;

  /// No description provided for @statusDeliveryFailed.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر التوصيل'**
  String get statusDeliveryFailed;

  /// No description provided for @statusReturned.
  ///
  /// In ar, this message translates to:
  /// **'مرتجع'**
  String get statusReturned;

  /// No description provided for @checkoutCallStore.
  ///
  /// In ar, this message translates to:
  /// **'اتصال بالمتجر'**
  String get checkoutCallStore;

  /// No description provided for @checkoutDirections.
  ///
  /// In ar, this message translates to:
  /// **'الاتجاهات'**
  String get checkoutDirections;

  /// No description provided for @errDayNotAvailable.
  ///
  /// In ar, this message translates to:
  /// **'هذا اليوم لم يعد متاحًا، اختر يومًا آخر.'**
  String get errDayNotAvailable;

  /// No description provided for @errFulfilmentRequired.
  ///
  /// In ar, this message translates to:
  /// **'اختر طريقة الاستلام واليوم أولًا.'**
  String get errFulfilmentRequired;

  /// No description provided for @errCartEmpty.
  ///
  /// In ar, this message translates to:
  /// **'سلتك فارغة.'**
  String get errCartEmpty;

  /// No description provided for @errWalletInsufficient.
  ///
  /// In ar, this message translates to:
  /// **'رصيد محفظتك لم يعد يكفي، اختر طريقة الدفع من جديد.'**
  String get errWalletInsufficient;

  /// No description provided for @errOrderNotPayable.
  ///
  /// In ar, this message translates to:
  /// **'هذا الطلب لم يعد بانتظار الدفع.'**
  String get errOrderNotPayable;

  /// No description provided for @errPaymentInProgress.
  ///
  /// In ar, this message translates to:
  /// **'هناك عملية دفع لم تنتهِ بعد لهذا الطلب.'**
  String get errPaymentInProgress;

  /// No description provided for @payCheckStatus.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من حالة الدفع'**
  String get payCheckStatus;

  /// No description provided for @payCancelPage.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء الدفع'**
  String get payCancelPage;

  /// No description provided for @productSizeNoId.
  ///
  /// In ar, this message translates to:
  /// **'لا يمكن إضافة هذا المقاس إلى السلة حاليًا.'**
  String get productSizeNoId;

  /// No description provided for @payPageErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'تعذّر فتح صفحة الدفع'**
  String get payPageErrorTitle;

  /// No description provided for @payPageErrorBody.
  ///
  /// In ar, this message translates to:
  /// **'تحقق من اتصالك ثم أعد المحاولة.'**
  String get payPageErrorBody;

  /// No description provided for @payPageClose.
  ///
  /// In ar, this message translates to:
  /// **'إغلاق'**
  String get payPageClose;

  /// No description provided for @payContinue.
  ///
  /// In ar, this message translates to:
  /// **'متابعة الدفع'**
  String get payContinue;
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
