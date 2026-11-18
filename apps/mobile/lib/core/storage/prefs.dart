import 'package:shared_preferences/shared_preferences.dart';

/// Non-secret preferences (language, onboarding seen, selected location).
class Prefs {
  Prefs(this._p);

  final SharedPreferences _p;

  static Future<Prefs> load() async => Prefs(await SharedPreferences.getInstance());

  String? get languageCode => _p.getString('locale');
  Future<void> setLanguageCode(String code) => _p.setString('locale', code);

  bool get onboardingSeen => _p.getBool('onboardingSeen') ?? false;
  Future<void> setOnboardingSeen() => _p.setBool('onboardingSeen', true);

  /// The user chose to browse without an account (kept across restarts until they sign in).
  bool get guest => _p.getBool('guest') ?? false;
  Future<void> setGuest({required bool value}) => value ? _p.setBool('guest', true) : _p.remove('guest');

  String? getString(String key) => _p.getString(key);
  Future<void> setString(String key, String value) => _p.setString(key, value);
  Future<void> remove(String key) => _p.remove(key);

  /// Keeps the language and the selected location (they belong to the device). Signing out keeps the onboarding as seen; deleting the account shows it again.
  Future<void> clearAccountData({bool keepOnboarding = true}) async {
    for (final key in _p.getKeys().where(
      (k) => k != 'locale' && !k.startsWith('location.') && (!keepOnboarding || k != 'onboardingSeen'),
    )) {
      await _p.remove(key);
    }
  }
}
