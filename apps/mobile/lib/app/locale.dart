import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';

const supportedLanguages = ['ar', 'en'];

/// The language the user picked in the app, or null to follow the device.
final localeProvider = NotifierProvider<LocaleController, Locale?>(LocaleController.new);

class LocaleController extends Notifier<Locale?> {
  @override
  Locale? build() {
    final saved = ref.watch(prefsProvider).languageCode;
    return saved == null ? null : Locale(saved);
  }

  /// Switches at runtime: MaterialApp rebuilds with the new locale and text direction, no restart.
  Future<void> set(String languageCode) async {
    await ref.read(prefsProvider).setLanguageCode(languageCode);
    state = Locale(languageCode);
  }
}

/// What the app actually shows: the saved choice, else the device language if supported, else Arabic.
/// A function, not a cached provider, so a device language change is picked up at once.
String effectiveLanguage(Locale? chosen) {
  if (chosen != null) return chosen.languageCode;
  final device = PlatformDispatcher.instance.locale.languageCode;
  return supportedLanguages.contains(device) ? device : 'ar';
}
