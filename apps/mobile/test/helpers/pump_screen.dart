import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/locale.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Pumps a full screen with Riverpod, go_router and the app's localisations on a 390x844 phone.
extension PumpScreen on WidgetTester {
  Future<ProviderContainer> pumpScreen(
    Widget screen, {
    List<dynamic> overrides = const [],
    Map<String, Object> prefs = const {'locale': 'ar', 'onboardingSeen': true},
  }) async {
    SharedPreferences.setMockInitialValues(prefs);
    final p = await Prefs.load();
    view
      ..physicalSize = const Size(390, 844)
      ..devicePixelRatio = 1;
    addTearDown(view.reset);
    final container = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(p),
        ...overrides.cast(),
      ],
    );
    addTearDown(container.dispose);
    final router = GoRouter(
      routes: [
        GoRoute(path: '/', builder: (_, _) => screen),
        GoRoute(path: '/:rest(.*)', builder: (_, s) => Text('route:${s.matchedLocation}')),
      ],
    );
    await pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: Consumer(
          builder: (context, ref, _) => MaterialApp.router(
            theme: buildJazlahTheme(),
            locale: ref.watch(localeProvider),
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
            routerConfig: router,
          ),
        ),
      ),
    );
    await pump();
    return container;
  }
}
