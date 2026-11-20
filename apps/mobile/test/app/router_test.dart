import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/home/presentation/categories_screen.dart';
import 'package:jazlah/features/home/presentation/category_screen.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/home/presentation/stores_screen.dart';
import 'package:jazlah/features/store/presentation/store_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../helpers/catalog_fakes.dart';

class _Guest extends SessionController {
  @override
  SessionStatus build() => SessionStatus.guest;
}

void main() {
  Future<void> open(WidgetTester t, String path, Type screen) async {
    SharedPreferences.setMockInitialValues({'locale': 'ar', 'onboardingSeen': true});
    final c = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(await Prefs.load()),
        sessionProvider.overrideWith(_Guest.new),
        ...catalogOverrides(FakeCatalog()).cast(),
      ],
    );
    addTearDown(c.dispose);
    final router = c.read(routerProvider);
    await t.pumpWidget(
      UncontrolledProviderScope(
        container: c,
        child: MaterialApp.router(
          theme: buildJazlahTheme(),
          locale: const Locale('ar'),
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          routerConfig: router,
        ),
      ),
    );
    router.go(path);
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect(find.byType(screen), findsOneWidget, reason: path);
  }

  testWidgets('home', (t) => open(t, Routes.home, HomeScreen));
  testWidgets('categories', (t) => open(t, Routes.categories, CategoriesScreen));
  testWidgets('category', (t) => open(t, Routes.category('c-sheep'), CategoryScreen));
  testWidgets('stores', (t) => open(t, Routes.stores, StoresScreen));
  testWidgets('store, full screen without the tab bar', (t) async {
    await open(t, Routes.store('v-falah'), StoreScreen);
    expect(find.byType(MainShell), findsNothing);
    expect(find.text('مجازر الفلاح'), findsWidgets);
  });
  testWidgets('product placeholder until STF-MOB-3', (t) => open(t, Routes.product('p-falah-ribeye'), ComingSoonPage));
  testWidgets('search placeholder until STF-MOB-4', (t) => open(t, Routes.search, ComingSoonPage));
}
