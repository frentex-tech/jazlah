// Runs on a simulator or device with the in-memory repositories:
//   flutter test integration_test --flavor dev --dart-define=USE_MOCKS=true
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:jazlah/app/bootstrap.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('sign in with a code, then open the address book', (t) async {
    expect(Env.useMocks, isTrue, reason: 'run with --dart-define=USE_MOCKS=true');
    await const FlutterSecureStorage().deleteAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    await prefs.setString('locale', 'ar');
    await prefs.setBool('onboardingSeen', true);
    await prefs.setBool('installed', true);
    await prefs.setString('location.selected', '{"lat":24.8,"lng":46.6,"line":"حي الملقا","covered":true}');

    // The mock repositories answer after a short delay that pumpAndSettle alone does not wait for.
    Future<void> settle() async {
      await t.pump(const Duration(seconds: 1));
      await t.pumpAndSettle();
    }

    await bootstrap(Flavor.dev);
    await settle();

    await t.enterText(find.byType(TextField), '501234567'); // not ending in 5: a customer with a complete profile
    await t.testTextInput.receiveAction(TextInputAction.done); // the keyboard covers the button
    await settle();

    await t.enterText(find.byType(TextField), '111111'); // the mock code; six digits submit
    await settle();
    expect(find.text('حي الملقا'), findsOneWidget); // home, with the saved location

    await t.tap(find.text('حسابي'));
    await settle();
    await t.tap(find.text('عناويني'));
    await settle();
    expect(find.text('المنزل'), findsOneWidget);
  });
}
