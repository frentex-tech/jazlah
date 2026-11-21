import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/cart_fakes.dart';
import '../../helpers/fakes.dart';

void main() {
  late MockCartRepository server;
  late MemoryTokens tokens;
  late ProviderContainer c;

  setUp(() async {
    SharedPreferences.setMockInitialValues({'guest': true, 'onboardingSeen': true, 'locale': 'ar'});
    final prefs = await Prefs.load();
    server = MockCartRepository(delay: Duration.zero);
    tokens = MemoryTokens();
    c = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(prefs),
        tokenStorageProvider.overrideWithValue(tokens),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        cartRepositoryProvider.overrideWithValue(server),
        cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
        productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      ],
    );
    addTearDown(c.dispose);
    c.read(sessionProvider);
    await Future<void>.delayed(Duration.zero);
    expect(c.read(sessionProvider), SessionStatus.guest);
  });

  Future<void> signIn() async {
    await tokens.write(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    await c.read(sessionProvider.notifier).signedIn();
  }

  test('acceptance: a guest adds 2 items, signs in, and the items are in the server cart', () async {
    final cart = c.read(cartProvider.notifier);
    await cart.add(kebab);
    await cart.add(const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-1kg'));
    expect((await c.read(cartProvider.future)).onDevice, isTrue);
    expect(c.read(cartCountProvider), 2);
    expect((await server.get()).lines, isEmpty);

    await signIn();
    final merged = await c.read(cartProvider.future);
    expect(merged.onDevice, isFalse);
    expect([for (final l in (await server.get()).lines) l.item.sizeId], ['sz-500g', 'sz-1kg']);
    expect(c.read(localCartProvider).items, isEmpty); // cleared after the merge
    expect(c.read(cartMergeNoticeProvider), isNull); // nothing to tell
  });

  test('merging over another store’s account cart tells the user', () async {
    await server.add(otherStore);
    await c.read(cartProvider.notifier).add(kebab);
    await signIn();
    expect((await c.read(cartProvider.future)).vendorId, 'v-falah');
    expect(c.read(cartMergeNoticeProvider)?.replacedPreviousCart, isTrue);
  });

  test('signing out does not leave the account cart to the next person', () async {
    await signIn();
    await c.read(cartProvider.notifier).add(kebab);
    expect(c.read(cartCountProvider), 1);

    await c.read(sessionProvider.notifier).signOut();
    final cart = await c.read(cartProvider.future);
    expect(cart.onDevice, isTrue);
    expect(cart.lines, isEmpty);
    expect(c.read(cartCountProvider), 0);
  });

  test('changes run one after another: two lines at once, a double «+», a remove during a change', () async {
    await signIn();
    final cart = c.read(cartProvider.notifier);
    await cart.add(kebab);
    await cart.add(const CartItemInput(productId: 'p-falah-lamb-kebab', sizeId: 'sz-1kg'));
    final [a, b] = (await c.read(cartProvider.future)).lines;

    await Future.wait([cart.setQuantity(a.id, 4), cart.setQuantity(b.id, 5)]);
    expect([for (final l in (await server.get()).lines) l.item.quantity], [4, 5]);

    await Future.wait([cart.changeQuantity(a.id, 1), cart.changeQuantity(a.id, 1)]);
    expect((await server.get()).lines.first.item.quantity, 6);

    await Future.wait([cart.changeQuantity(b.id, 1), cart.remove(b.id)]);
    expect([for (final l in (await server.get()).lines) l.id], [a.id]);
    expect(c.read(cartCountProvider), 6);
  });

  test('a failed change reaches its caller and does not block the next one', () async {
    final cart = c.read(cartProvider.notifier);
    await expectLater(cart.add(otherStore.withQuantity(1)), completes);
    await expectLater(cart.add(kebab), throwsA(isA<ApiError>()));
    await cart.add(otherStore);
    expect(c.read(cartCountProvider), 2);
  });

  test('mock build: the next account on the phone does not see the previous account cart', () async {
    SharedPreferences.setMockInitialValues({'onboardingSeen': true, 'locale': 'ar'});
    final prefs = await Prefs.load();
    final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
    final c = ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(prefs),
        tokenStorageProvider.overrideWithValue(tokens),
        authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
        cartMocksProvider.overrideWithValue(true),
        productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
      ],
    );
    addTearDown(c.dispose);
    c.read(sessionProvider);
    await Future<void>.delayed(Duration.zero);
    await c.read(cartProvider.notifier).add(kebab);
    expect((await c.read(cartProvider.future)).onDevice, isFalse);

    await c.read(sessionProvider.notifier).signOut();
    await tokens.write(const AuthTokens(accessToken: 'b', refreshToken: 'r'));
    await c.read(sessionProvider.notifier).signedIn();
    final cart = await c.read(cartProvider.future);
    expect(cart.onDevice, isFalse);
    expect(cart.lines, isEmpty);
  });
}
