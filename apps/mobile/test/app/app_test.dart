import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/app.dart';
import 'package:jazlah/app/locale.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  late TextDirection direction;

  Future<ProviderContainer> pumpApp(WidgetTester tester, {Map<String, Object> prefs = const {}}) async {
    SharedPreferences.setMockInitialValues(prefs);
    final container = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(await Prefs.load()),
        routerProvider.overrideWithValue(
          GoRouter(
            routes: [
              GoRoute(
                path: '/',
                builder: (context, _) {
                  direction = Directionality.of(context);
                  return const SizedBox();
                },
              ),
            ],
          ),
        ),
      ],
    );
    await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const JazlahApp()));
    await tester.pumpAndSettle();
    return container;
  }

  testWidgets('follows the device language: Arabic is RTL, English is LTR', (tester) async {
    tester.platformDispatcher.localesTestValue = const [Locale('ar')];
    await pumpApp(tester);
    expect(direction, TextDirection.rtl);

    tester.platformDispatcher.localesTestValue = const [Locale('en')];
    await tester.pumpAndSettle();
    expect(direction, TextDirection.ltr);
    tester.platformDispatcher.clearLocalesTestValue();
  });

  testWidgets('an unsupported device language falls back to Arabic', (tester) async {
    tester.platformDispatcher.localesTestValue = const [Locale('fr')];
    await pumpApp(tester);
    expect(direction, TextDirection.rtl);
    tester.platformDispatcher.clearLocalesTestValue();
  });

  testWidgets('the in-app choice wins, persists and flips direction without restart', (tester) async {
    tester.platformDispatcher.localesTestValue = const [Locale('ar')];
    final container = await pumpApp(tester);
    await container.read(localeProvider.notifier).set('en');
    await tester.pumpAndSettle();
    expect(direction, TextDirection.ltr);
    expect(container.read(prefsProvider).languageCode, 'en');
    tester.platformDispatcher.clearLocalesTestValue();
  });
}
