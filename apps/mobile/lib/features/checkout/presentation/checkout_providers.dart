import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/checkout/data/api_checkout_repository.dart';
import 'package:jazlah/features/checkout/data/api_order_repository.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Checkout step 1 on the API (SCH-API-1 / SCH-API-2); the in-memory scheduler on the mock cart (USE_MOCKS).
final checkoutRepositoryProvider = Provider<CheckoutRepository>((ref) {
  final cart = ref.watch(cartRepositoryProvider);
  return cart is MockCartRepository
      ? MockCheckoutRepository(cart, addresses: ref.watch(addressRepositoryProvider))
      : ApiCheckoutRepository(ref.watch(apiProvider));
});

/// Not paused when unknown (the settings failed): the server still refuses a paused checkout with ORDERING_PAUSED,
/// which the screen shows.
final FutureProvider<OrderingPause> orderingPauseProvider = FutureProvider.autoDispose<OrderingPause>(
  (ref) => ref.watch(checkoutRepositoryProvider).pause(),
  retry: (_, _) => null,
);

/// The days for a method; keyed by the address too, so choosing another address asks again.
typedef DaysQuery = ({Fulfilment method, String? addressId});

final FutureProviderFamily<List<CheckoutDay>, DaysQuery> checkoutDaysProvider = FutureProvider.autoDispose
    .family<List<CheckoutDay>, DaysQuery>((ref, q) {
      return ref.watch(checkoutRepositoryProvider).days(q.method);
    }, retry: (_, _) => null);

/// Placing orders on the API (ORD-API-1); the in-memory order server on the mock cart and scheduler (USE_MOCKS).
final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final cart = ref.watch(cartRepositoryProvider);
  final checkout = ref.watch(checkoutRepositoryProvider);
  if (cart is! MockCartRepository || checkout is! MockCheckoutRepository) {
    return ApiOrderRepository(ref.watch(apiProvider));
  }
  final mock = MockOrderRepository(cart, checkout, addresses: ref.watch(addressRepositoryProvider), seedPast: true);
  ref.onDispose(mock.dispose); // a replaced mock (another account) closes its event stream
  return mock;
});
