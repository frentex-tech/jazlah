import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/data/api_cart_repository.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/checkout/data/api_checkout_repository.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';

/// USE_MOCKS for the cart (a seam for tests, which build without the define).
final cartMocksProvider = Provider<bool>((ref) => Env.useMocks);

/// The account cart on the server (CRT-API-1): the API's, or the in-memory one with USE_MOCKS (demos and tests).
final cartRepositoryProvider = Provider<CartRepository>((ref) {
  // A new mock account cart after sign-out: the next account on the phone does not see this one's.
  ref.watch(accountDataClearedProvider);
  return ref.watch(cartMocksProvider) ? MockCartRepository() : ApiCartRepository(ref.watch(apiProvider));
});

/// The public client settings' minimum order and delivery fee (`GET /v1/public/settings/client`), for the cart on
/// the device; the account cart carries its own. Null while they cannot be read (NOT_IMPLEMENTED until SCH-API-1):
/// never invented, so they are hidden and the device cart does not offer checkout.
final FutureProvider<CartSettings?> clientCartSettingsProvider = FutureProvider<CartSettings?>((ref) async {
  if (ref.watch(cartMocksProvider)) return MockCartRepository.opsSettings;
  try {
    return await clientCartSettings(ref.watch(apiProvider));
  } on Object {
    return null;
  }
}, retry: (_, _) => null);

/// The settings given to the device cart up front: the mock's with USE_MOCKS; in real builds none, and the device
/// cart reads [clientCartSettingsProvider] once it has a line to price.
final cartSettingsProvider = Provider<CartSettings?>(
  (ref) => ref.watch(cartMocksProvider) ? MockCartRepository.opsSettings : null,
);

final localCartProvider = Provider<LocalCartRepository>((ref) {
  final products = ref.watch(productRepositoryProvider);
  return LocalCartRepository(
    ref.watch(prefsProvider),
    (id) async {
      try {
        return await products.product(id);
      } on ApiError catch (e) {
        if (e.code == 'NOT_FOUND') return null; // a removed product: the line shows as unavailable
        rethrow;
      }
    },
    settings: ref.watch(cartSettingsProvider),
    loadSettings: () => ref.read(clientCartSettingsProvider.future),
  );
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
    if (ref.watch(sessionProvider) != SessionStatus.signedIn) {
      _repo = local;
      return local.get();
    }
    _repo = server;
    final guest = local.items;
    if (guest.isEmpty) return server.get();
    // A failed merge keeps the device cart; the next build tries again.
    final merged = await server.merge(guest, mergeId: local.mergeId);
    await local.clear();
    if (merged.replacedPreviousCart || merged.skipped > 0) ref.read(cartMergeNoticeProvider.notifier).set(merged);
    return merged.cart;
  }

  /// The end of the queue of changes. Each repository call reads, waits and writes the whole cart, so
  /// changes run one after another: a quick double «+» or edits on two lines never overwrite each other.
  Future<void> _tail = Future.value();

  Future<void> _run(Future<Cart> Function(CartRepository repo) call) {
    final done = _tail.then((_) async {
      await future; // the cart (and the repository it came from) is known
      final cart = await call(_repo);
      if (ref.mounted) state = AsyncData(cart);
    });
    _tail = done.then((_) {}, onError: (_) {}); // a failure reaches the caller, not the next change
    return done;
  }

  /// Throws [CartError.vendorMismatch] (ApiError) when the cart is another store's and not [replace].
  Future<void> add(CartItemInput item, {bool replace = false}) => _run((r) => r.add(item, replace: replace));
  Future<void> setQuantity(String lineId, int quantity) => _run((r) => r.update(lineId, quantity));

  /// The stepper: [delta] applies to the quantity the line has when the change runs, not when tapped.
  Future<void> changeQuantity(String lineId, int delta) => _run((r) async {
    final line = state.value?.lines.where((l) => l.id == lineId).firstOrNull;
    if (line == null) return r.get(); // removed meanwhile
    return r.update(lineId, line.item.quantity + delta);
  });
  Future<void> remove(String lineId) => _run((r) => r.remove(lineId));
  Future<void> applyCoupon(String code) => _run((r) => r.applyCoupon(code));
  Future<void> removeCoupon() => _run((r) => r.removeCoupon());
}
