import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';

/// The customer's orders on the API (ORD-API-3); the mock order server's with USE_MOCKS.
final ordersRepositoryProvider = Provider<OrdersRepository>(
  (ref) => ref.watch(orderRepositoryProvider) as OrdersRepository, // both the API and the mock serve the list
);

/// `order.updated` events; null in real builds: the socket (`order.updated { id, status }`) comes with ORD-API-3
/// and is not in the contract yet, so the detail polls.
// shortcut: polling until ORD-API-3 #83 opens the socket gateway (not-built-yet.md).
final orderRealtimeProvider = Provider<OrderRealtime?>((ref) {
  final orders = ref.watch(orderRepositoryProvider);
  return orders is MockOrderRepository ? orders : null;
});

/// "Now", for «اليوم» on the order cards (a seam for tests).
final ordersClockProvider = Provider<DateTime Function()>((ref) => DateTime.now);

final FutureProviderFamily<List<Order>, OrderScope?> ordersProvider = FutureProvider.autoDispose
    .family<List<Order>, OrderScope?>((ref, scope) {
      // Any order.updated (a status changed on the dashboard, a payment settled) re-reads the list.
      final events = ref.watch(orderRealtimeProvider)?.orderUpdated().listen((_) => ref.invalidateSelf());
      if (events != null) ref.onDispose(events.cancel);
      return ref.watch(ordersRepositoryProvider).list(scope: scope);
    }, retry: (_, _) => null);

final FutureProviderFamily<OrderDetail, String> orderDetailProvider = FutureProvider.autoDispose
    .family<OrderDetail, String>((ref, id) {
      return ref.watch(ordersRepositoryProvider).detail(id);
    }, retry: (_, _) => null);
