import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/storage/token_storage.dart';
import 'package:jazlah/features/auth/data/auth_repository.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

import '../../test/helpers/fakes.dart';
import 'harness.dart';

class _Server extends MockCartRepository {
  _Server([this.mode]) : super(delay: Duration.zero);

  final String? mode;

  @override
  Future<Cart> get() => switch (mode) {
    'hang' => hang<Cart>(),
    'error' => Future.error(const ApiError(code: 'UNKNOWN')),
    _ => super.get(),
  };
}

List<dynamic> _o(MockCartRepository server) {
  final tokens = MemoryTokens(const AuthTokens(accessToken: 'a', refreshToken: 'r'));
  return [
    tokenStorageProvider.overrideWithValue(tokens),
    authRepositoryProvider.overrideWithValue(MockAuthRepository(tokens)),
    productRepositoryProvider.overrideWithValue(MockProductRepository(delay: Duration.zero)),
    cartRepositoryProvider.overrideWithValue(server),
    cartSettingsProvider.overrideWithValue(MockCartRepository.opsSettings),
  ];
}

/// The Figma ribeye (sliced) and a Naimi lamb line standing in for the lamb shank.
const _ribeye = CartItemInput(productId: 'p-falah-ribeye', sizeId: 'sz-500g', cutId: 'cut-slices', quantity: 2);
const _lamb = CartItemInput(productId: 'p-falah-naimi-mince', sizeId: 'sz-1kg', cutId: 'cut-cubes');

void main() {
  setUpAll(loadFonts);

  testWidgets('cart', (t) async {
    final full = _Server();
    await full.add(_ribeye);
    await full.add(_lamb);
    await shoot(t, '170-28564', const CartScreen(), overrides: _o(full));
    await shoot(t, '170-28643', const CartScreen(), overrides: _o(_Server()));
    await shoot(t, '170-28708', const CartScreen(), overrides: _o(_Server('hang')));
    await shoot(t, '170-28782', const CartScreen(), overrides: _o(_Server('error')));
    final below = _Server();
    await below.add(_ribeye.withQuantity(1));
    await shoot(t, '170-28847', const CartScreen(), overrides: _o(below));
    await shoot(t, 'en-170-28564', const CartScreen(), overrides: _o(full), lang: 'en');
  });
}
