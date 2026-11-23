import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/fakes.dart';
import '../../helpers/pump_screen.dart';

/// CRT-MOB-1 #64 on the real wiring: ApiCartRepository over a fake HTTP layer answering the contract's bodies.

void main() {
  test('a guest adds 2 items, signs in: the merge sends both lines and its merge id; the cart is the answer', () async {
    SharedPreferences.setMockInitialValues({'guest': true, 'onboardingSeen': true, 'locale': 'ar'});
    final prefs = await Prefs.load();
    final tokens = MemoryTokens();
    Map<String, dynamic>? merge;
    final http = FakeHttp((r) {
      if (r.path == '/v1/public/products/p1' || r.path == '/v1/public/products/p2') {
        return productJson(r.path.split('/').last);
      }
      if (r.path == '/v1/public/settings/client') return clientSettingsJson();
      if (r.path == '/v1/customer/cart/merge') {
        merge = jsonBody(r);
        return {
          'cart': cartJson(
            lines: [
              cartLineJson('l1'),
              cartLineJson('l2', productId: 'p2'),
            ],
          ),
          'replacedPreviousCart': false,
          'skippedCount': 0,
        };
      }
      return null;
    });
    final c = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(prefs),
        tokenStorageProvider.overrideWithValue(tokens),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        apiOn(http),
      ],
    );
    addTearDown(c.dispose);
    c.read(sessionProvider);
    await Future<void>.delayed(Duration.zero);

    // Two lines on the device as a guest (priced from the public product).
    final cart = c.read(cartProvider.notifier);
    await cart.add(const CartItemInput(productId: 'p1', sizeId: 'sz-1'));
    await cart.add(const CartItemInput(productId: 'p2', sizeId: 'sz-1', quantity: 2));
    expect((await c.read(cartProvider.future)).onDevice, isTrue);
    final mergeId = c.read(localCartProvider).mergeId;

    await tokens.write(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await c.read(sessionProvider.notifier).signedIn();
    final merged = await c.read(cartProvider.future);

    expect(http.to('/v1/customer/cart/merge'), hasLength(1));
    expect(merge!['mergeId'], mergeId);
    final items = (merge!['items'] as List).cast<Map<String, dynamic>>();
    expect(
      [for (final i in items) (i['productId'], i['sizeId'], i['quantity'])],
      [('p1', 'sz-1', 1), ('p2', 'sz-1', 2)],
    );
    expect(merged.onDevice, isFalse);
    expect([for (final l in merged.lines) l.id], ['l1', 'l2']); // the server's lines, as answered
    expect(c.read(localCartProvider).items, isEmpty);
  });

  testWidgets('below the minimum: checkout disabled, the remaining amount from the server', (t) async {
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await t.pumpScreen(
      const CartScreen(),
      overrides: [
        tokenStorageProvider.overrideWithValue(tokens),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        apiOn(
          FakeHttp(
            (r) => r.path == '/v1/customer/cart'
                ? cartJson(lines: [cartLineJson('l1', unitPrice: 4950)], minOrderRemaining: 5050)
                : null,
          ),
        ),
      ],
    );
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('الحد الأدنى للطلب 100.00 ر.س'), findsOneWidget);
    expect(find.text('أضف 50.50 ر.س من المنتجات لإكمال طلبك.'), findsOneWidget);
    expect(t.widget<JButton>(find.widgetWithText(JButton, 'متابعة إلى الدفع')).onPressed, isNull);
  });
}
