import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/l10n/app_localizations.dart';

extension PumpApp on WidgetTester {
  /// Pumps [widget] inside the app theme and localisations (Arabic by default) on a Scaffold.
  Future<void> pumpApp(Widget widget, {Locale locale = const Locale('ar')}) {
    return pumpWidget(
      MaterialApp(
        theme: buildJazlahTheme(),
        locale: locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(body: Center(child: widget)),
      ),
    );
  }
}
