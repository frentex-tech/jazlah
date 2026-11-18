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

  String? getString(String key) => _p.getString(key);
  Future<void> setString(String key, String value) => _p.setString(key, value);
  Future<void> remove(String key) => _p.remove(key);

  /// Keeps the language: deleting the account or signing out does not reset it.
  Future<void> clearAccountData() async {
    for (final key in _p.getKeys().where((k) => k != 'locale' && k != 'onboardingSeen')) {
      await _p.remove(key);
    }
  }
}
