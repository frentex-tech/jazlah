import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/profile/domain/customer_profile.dart';

abstract interface class ProfileRepository {
  Future<CustomerProfile> me();

  /// Sends only the given fields. An empty [email] removes it.
  Future<CustomerProfile> update({String? fullName, String? email, String? preferredLanguage});

  Future<bool> setMarketingConsent({required bool granted});

  /// Throws [ApiError] `RECENT_SIGN_IN_REQUIRED` when the sign-in is older than 10 minutes.
  Future<void> deleteAccount(DeleteReason? reason);
}

class ApiProfileRepository implements ProfileRepository {
  ApiProfileRepository(this._api);

  final JazlaApi _api;

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<CustomerProfile> me() => _call(() async {
    final m = (await _api.getCustomerAccountApi().customerGetMe()).data!;
    return CustomerProfile(
      phone: m.phone,
      fullName: m.fullName,
      email: m.email,
      preferredLanguage: m.preferredLanguage == CustomerMeResponseDtoPreferredLanguageEnum.en ? 'en' : 'ar',
      marketingConsent: m.marketingConsent.granted,
    );
  });

  @override
  Future<CustomerProfile> update({String? fullName, String? email, String? preferredLanguage}) => _call(() async {
    await _api.getCustomerProfileApi().customerUpdateProfile(
      updateCustomerProfileDto: UpdateCustomerProfileDto(
        fullName: fullName,
        email: email,
        preferredLanguage: switch (preferredLanguage) {
          'en' => UpdateCustomerProfileDtoPreferredLanguageEnum.en,
          'ar' => UpdateCustomerProfileDtoPreferredLanguageEnum.ar,
          _ => null,
        },
      ),
    );
    return me();
  });

  @override
  Future<bool> setMarketingConsent({required bool granted}) => _call(() async {
    final res = await _api.getCustomerProfileApi().customerSetMarketingConsent(
      setMarketingConsentDto: SetMarketingConsentDto(granted: granted),
    );
    return res.data!.granted;
  });

  @override
  Future<void> deleteAccount(DeleteReason? reason) =>
      _call(() => _api.getCustomerAccountApi().customerDeleteAccount(reason: reason?.apiValue));
}

class MockProfileRepository implements ProfileRepository {
  MockProfileRepository({bool complete = true})
    : _profile = CustomerProfile(
        phone: '+966551234567',
        fullName: complete ? 'عبدالرحمن المطيري' : null,
        email: null,
        preferredLanguage: 'ar',
        marketingConsent: false,
      );

  CustomerProfile _profile;

  /// Set to make the next delete answer RECENT_SIGN_IN_REQUIRED once.
  bool requireRecentSignIn = false;

  static const _delay = Duration(milliseconds: 500);

  @override
  Future<CustomerProfile> me() async {
    await Future<void>.delayed(_delay);
    return _profile;
  }

  @override
  Future<CustomerProfile> update({String? fullName, String? email, String? preferredLanguage}) async {
    await Future<void>.delayed(_delay);
    return _profile = _profile.copyWith(fullName: fullName, email: email, preferredLanguage: preferredLanguage);
  }

  @override
  Future<bool> setMarketingConsent({required bool granted}) async {
    _profile = _profile.copyWith(marketingConsent: granted);
    return granted;
  }

  @override
  Future<void> deleteAccount(DeleteReason? reason) async {
    await Future<void>.delayed(_delay);
    if (requireRecentSignIn) {
      requireRecentSignIn = false;
      throw const ApiError(code: 'RECENT_SIGN_IN_REQUIRED');
    }
  }
}
