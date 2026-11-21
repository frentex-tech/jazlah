import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// Null in real builds: no payment route yet and no invented methods (checkout is not reached there either).
// shortcut: mock payment methods on the mock cart until PAY-API-1 #76 lands (not-built-yet.md).
final paymentRepositoryProvider = Provider<PaymentRepository?>((ref) {
  final cart = ref.watch(cartRepositoryProvider);
  return cart is MockCartRepository ? MockPaymentRepository(cart) : null;
});

final FutureProvider<PaymentMethods> paymentMethodsProvider = FutureProvider.autoDispose<PaymentMethods>((ref) {
  final repo = ref.watch(paymentRepositoryProvider);
  if (repo == null) throw const ApiError(code: ApiError.unknown);
  return repo.methods();
}, retry: (_, _) => null);
