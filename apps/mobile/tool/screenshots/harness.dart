// Design QA: renders screens at Figma's 390x844 with the real fonts, to compare with
// docs/design/exports/app/<node-id>.png. Not part of `flutter test` (lives outside test/).
// Run: flutter test tool/screenshots --update-goldens  →  tool/screenshots/out/<node-id>.png
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

Future<void> loadFonts() async {
  Future<void> load(String family, List<String> assets) async {
    final loader = FontLoader(family);
    for (final a in assets) {
      loader.addFont(rootBundle.load(a));
    }
    await loader.load();
  }

  await load('ReadexPro', [
    'assets/fonts/ReadexPro-Regular.ttf',
    'assets/fonts/ReadexPro-Medium.ttf',
    'assets/fonts/ReadexPro-Bold.ttf',
  ]);
  await load('ElMessiri', ['assets/fonts/ElMessiri-Bold.ttf']);
  await load('packages/phosphor_flutter/PhosphorRegular', ['packages/phosphor_flutter/lib/fonts/Phosphor.ttf']);
  await load('packages/phosphor_flutter/PhosphorFill', ['packages/phosphor_flutter/lib/fonts/Phosphor-Fill.ttf']);
}

/// Pumps [screen] in a phone frame (44 status bar like Figma) and runs [act] to reach a state.
Future<void> shoot(
  WidgetTester tester,
  String name,
  Widget screen, {
  List<dynamic> overrides = const [],
  String lang = 'ar',
  Future<void> Function(WidgetTester t)? act,
}) async {
  SharedPreferences.setMockInitialValues({'locale': lang, 'onboardingSeen': true});
  final prefs = await Prefs.load();
  tester.view
    ..physicalSize = const Size(390, 844) * 3
    ..devicePixelRatio = 3
    ..padding = FakeViewPadding(top: 44 * 3);
  addTearDown(tester.view.reset);
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (_, _) => screen),
      GoRoute(path: '/:rest(.*)', builder: (_, _) => const SizedBox()),
    ],
  );
  // A fresh tree per state: same-typed widgets would otherwise keep the previous state.
  await tester.pumpWidget(const SizedBox());
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(prefs),
        ...overrides.cast(),
      ],
      child: Consumer(
        builder: (context, ref, _) => MaterialApp.router(
          debugShowCheckedModeBanner: false,
          theme: buildJazlahTheme(),
          locale: ref.watch(localeProvider),
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          routerConfig: router,
        ),
      ),
    ),
  );
  // Images and SVGs decode off the test clock.
  for (var i = 0; i < 3; i++) {
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 150)));
    for (final e in find.byType(Image).evaluate()) {
      await tester.runAsync(() => precacheImage((e.widget as Image).image, e));
    }
    await tester.pump(const Duration(milliseconds: 50));
  }
  await tester.pump(const Duration(seconds: 1));
  if (act != null) await act(tester);
  await tester.pump(const Duration(milliseconds: 400));
  await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 100)));
  await tester.pump();
  await expectLater(find.byType(MaterialApp), matchesGoldenFile('out/$name.png'));
}

/// A future that never completes: keeps a screen in its loading state.
Future<T> hang<T>() => Completer<T>().future;
