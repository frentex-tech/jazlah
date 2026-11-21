import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/checkout/data/checkout_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// Null in real builds: there is no settings, days or fulfilment route yet, and nothing is invented there.
/// (The cart does not offer checkout without the ops settings either, so the screen is not reached.)
// shortcut: mock checkout on the mock cart until SCH-API-1 #68 and SCH-API-2 #69 land (not-built-yet.md).
final checkoutRepositoryProvider = Provider<CheckoutRepository?>((ref) {
  final cart = ref.watch(cartRepositoryProvider);
  return cart is MockCartRepository
      ? MockCheckoutRepository(cart, addresses: ref.watch(addressRepositoryProvider))
      : null;
});

/// Not paused when unknown (no settings route, or it failed): the server still refuses a paused checkout
/// with ORDERING_PAUSED, which the screen shows.
final FutureProvider<OrderingPause> orderingPauseProvider = FutureProvider.autoDispose<OrderingPause>((ref) async {
  final repo = ref.watch(checkoutRepositoryProvider);
  return repo == null ? const OrderingPause() : repo.pause();
}, retry: (_, _) => null);

/// The days for a method; keyed by the address too, so choosing another address asks again.
typedef DaysQuery = ({Fulfilment method, String? addressId});

final FutureProviderFamily<List<CheckoutDay>, DaysQuery> checkoutDaysProvider = FutureProvider.autoDispose
    .family<List<CheckoutDay>, DaysQuery>((ref, q) {
      final repo = ref.watch(checkoutRepositoryProvider);
      // Without the days route: the error state with retry, never made-up days.
      if (repo == null) throw const ApiError(code: ApiError.unknown);
      return repo.days(q.method);
    }, retry: (_, _) => null);
