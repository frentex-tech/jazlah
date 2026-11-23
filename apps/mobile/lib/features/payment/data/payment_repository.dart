import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// The payment routes of PAY-API-1 and the order status of ORD-API-3. The app never decides a payment's outcome:
/// it always reads it from [status].
abstract interface class PaymentRepository {
  /// `GET /v1/customer/checkout/payment-methods` for the caller's cart, or for an unpaid order ([orderId]).
  Future<PaymentMethods> methods({String? orderId});

  /// A new payment for an unpaid order: a retry after a failure, or another method. [idempotencyKey] is new for
  /// each attempt. Throws [PaymentError.orderNotPayable] once the order is paid or cancelled.
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey});

  /// The order and its latest payment (`GET /v1/customer/orders/:id`).
  Future<OrderPayment> status(String orderId);
}

/// The customer's wallet balance in the mock (WAL-API-1), shared by the methods, the placement and the refunds.
class MockWallet {
  MockWallet({this.balance = 5000});

  int balance;
}

/// PAY-API-1's method rules in memory, for USE_MOCKS and tests, on the mock cart and the mock order server: a
/// saved mada card, Apple Pay, the wallet (disabled when it does not cover what is left to pay, with a tender plan
/// for the cart when it covers part of it) and COD (left out when [codEnabled] is off or the total is above
/// [codMax], as PAY-API-1 says).
// USE_MOCKS only (demos and tests); real builds use ApiPaymentRepository.
class MockPaymentRepository implements PaymentRepository {
  MockPaymentRepository(
    this.cart,
    this.orders, {
    this.codEnabled = true,
    this.codMax = 100000,
    this.delay = const Duration(milliseconds: 300),
  });

  final MockCartRepository cart;
  final MockOrderRepository orders;
  final bool codEnabled;
  final int codMax;
  final Duration delay;

  MockWallet get wallet => orders.wallet;

  Future<void> _wait() => delay > Duration.zero ? Future<void>.delayed(delay) : Future.value();

  @override
  Future<PaymentMethods> methods({String? orderId}) async {
    await _wait();
    final order = orderId == null ? null : (await orders.status(orderId)).order;
    final total = order == null ? (await cart.get()).total : order.total - order.walletAmount;
    final balance = wallet.balance;
    return PaymentMethods(
      options: [
        const PaymentMethodOption(method: PaymentMethodCode.mada, cardLast4: '4821'),
        const PaymentMethodOption(method: PaymentMethodCode.applePay),
        PaymentMethodOption(
          method: PaymentMethodCode.wallet,
          available: balance >= total,
          reason: balance >= total ? null : PaymentMethodReason.walletInsufficient,
        ),
        if (codEnabled && total <= codMax) const PaymentMethodOption(method: PaymentMethodCode.cod),
      ],
      // Part of the cart from the wallet; an order's tender is fixed at placement.
      tender: order == null && balance > 0 && balance < total ? TenderPlan(walletAmount: balance) : null,
    );
  }

  @override
  Future<PlacedOrder> retry({required String orderId, required String method, required String idempotencyKey}) =>
      orders.retry(orderId: orderId, method: method, idempotencyKey: idempotencyKey);

  @override
  Future<OrderPayment> status(String orderId) async {
    await _wait();
    return orders.status(orderId);
  }
}
