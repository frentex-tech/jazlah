import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/payment/data/api_payment_repository.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// Payments on the API (PAY-API-1); the mock order server's with USE_MOCKS.
final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final cart = ref.watch(cartRepositoryProvider);
  final orders = ref.watch(orderRepositoryProvider);
  return cart is MockCartRepository && orders is MockOrderRepository
      ? MockPaymentRepository(cart, orders)
      : ApiPaymentRepository(ref.watch(apiProvider));
});

/// The gateway step: the hosted page in a webview (real builds, ready for the API's redirect); the mock provider's
/// page with USE_MOCKS. PAY-MOB-2 #79 may add a gateway SDK behind the same port.
final paymentGatewayProvider = Provider<PaymentGateway>((ref) {
  final orders = ref.watch(orderRepositoryProvider);
  return orders is MockOrderRepository ? MockHostedPageGateway(orders.hostedPage) : const HostedPagePaymentGateway();
});

/// The methods for the cart (null) or for an unpaid order.
final FutureProviderFamily<PaymentMethods, String?> paymentMethodsProvider = FutureProvider.autoDispose
    .family<PaymentMethods, String?>((ref, orderId) {
      return ref.watch(paymentRepositoryProvider).methods(orderId: orderId);
    }, retry: (_, _) => null);
