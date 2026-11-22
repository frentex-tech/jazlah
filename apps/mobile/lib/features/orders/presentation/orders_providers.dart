import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/orders/data/orders_repository.dart';

/// Null in real builds: no order routes yet, and no invented orders (the list shows its error state).
// shortcut: mock orders until ORD-API-3 #83 lands (not-built-yet.md).
final ordersRepositoryProvider = Provider<OrdersRepository?>((ref) {
  final orders = ref.watch(orderRepositoryProvider);
  return orders is MockOrderRepository ? orders : null;
});

/// `order.updated` events; null in real builds (no socket yet): the detail then relies on polling.
// shortcut: mock events until ORD-API-3 #83 opens the socket gateway (not-built-yet.md).
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
      final repo = ref.watch(ordersRepositoryProvider);
      if (repo == null) throw const ApiError(code: ApiError.unknown);
      return repo.list(scope: scope);
    }, retry: (_, _) => null);

final FutureProviderFamily<OrderDetail, String> orderDetailProvider = FutureProvider.autoDispose
    .family<OrderDetail, String>((ref, id) {
      final repo = ref.watch(ordersRepositoryProvider);
      if (repo == null) throw const ApiError(code: ApiError.unknown);
      return repo.detail(id);
    }, retry: (_, _) => null);
