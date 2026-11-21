import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

/// The account cart (server). Null while the API has no cart routes: then every cart stays on the device.
// shortcut: mock server cart until CRT-API-1 #61 lands (not-built-yet.md).
final cartRepositoryProvider = Provider<CartRepository?>((ref) => Env.useMocks ? MockCartRepository() : null);

/// Minimum order and delivery fee. Null in real builds: never invented, so they are hidden and checkout
/// is not offered there.
// shortcut: mock ops settings until SCH-API-1 #68 serves the public client settings (not-built-yet.md).
final cartSettingsProvider = Provider<CartSettings?>((ref) => Env.useMocks ? MockCartRepository.opsSettings : null);

final localCartProvider = Provider<LocalCartRepository>((ref) {
  final products = ref.watch(productRepositoryProvider);
  return LocalCartRepository(ref.watch(prefsProvider), (id) async {
    try {
      return await products.product(id);
    } on ApiError catch (e) {
      if (e.code == 'NOT_FOUND') return null; // a removed product: the line shows as unavailable
      rethrow;
    }
  }, settings: ref.watch(cartSettingsProvider));
});

/// The cart on screen: the account cart once signed in (the guest cart is merged into it first), else the
/// cart on this device. Rebuilt on sign-in (it watches the session) and after sign-out cleared the account data.
final cartProvider = AsyncNotifierProvider<CartController, Cart>(CartController.new, retry: (_, _) => null);

/// The header badge.
final cartCountProvider = Provider<int>((ref) => ref.watch(cartProvider).value?.count ?? 0);

/// What the last sign-in merge changed, shown once on the cart.
final cartMergeNoticeProvider = NotifierProvider<CartMergeNotice, CartMergeResult?>(CartMergeNotice.new);

class CartMergeNotice extends Notifier<CartMergeResult?> {
  @override
  CartMergeResult? build() {
    ref.watch(accountDataClearedProvider); // gone with the account
    return null;
  }

  // ignore: use_setters_to_change_properties, read as an action by the cart.
  void set(CartMergeResult? value) => state = value;
}

class CartController extends AsyncNotifier<Cart> {
  late CartRepository _repo;

  @override
  Future<Cart> build() async {
    ref.watch(accountDataClearedProvider); // sign-out cleared the device cart
    final local = ref.watch(localCartProvider);
    final server = ref.watch(cartRepositoryProvider);
    if (server == null || ref.watch(sessionProvider) != SessionStatus.signedIn) {
      _repo = local;
      return local.get();
    }
    _repo = server;
    final guest = local.items;
    if (guest.isEmpty) return server.get();
    // A failed merge keeps the device cart; the next build tries again.
    final merged = await server.merge(guest);
    await local.clear();
    if (merged.replacedPreviousCart || merged.skipped > 0) ref.read(cartMergeNoticeProvider.notifier).set(merged);
    return merged.cart;
  }

  Future<void> _run(Future<Cart> Function(CartRepository repo) call) async {
    await future; // the cart (and the repository it came from) is known
    final cart = await call(_repo);
    if (ref.mounted) state = AsyncData(cart);
  }

  /// Throws [CartError.vendorMismatch] (ApiError) when the cart is another store's and not [replace].
  Future<void> add(CartItemInput item, {bool replace = false}) => _run((r) => r.add(item, replace: replace));
  Future<void> setQuantity(String lineId, int quantity) => _run((r) => r.update(lineId, quantity));
  Future<void> remove(String lineId) => _run((r) => r.remove(lineId));
  Future<void> applyCoupon(String code) => _run((r) => r.applyCoupon(code));
  Future<void> removeCoupon() => _run((r) => r.removeCoupon());
}
