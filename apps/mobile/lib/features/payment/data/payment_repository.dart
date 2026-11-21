import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';

/// The payment routes of PAY-API-1. PAY-MOB-1 #78 adds the payment itself (intent, 3DS, status).
// ignore: one_member_abstracts, the seam between the API and the USE_MOCKS data.
abstract interface class PaymentRepository {
  /// `GET /v1/customer/checkout/payment-methods` for the caller's cart.
  Future<PaymentMethods> methods();
}

/// PAY-API-1's method rules in memory, for USE_MOCKS and tests, on top of the mock cart: a saved mada card,
/// Apple Pay, the wallet (disabled when its balance does not cover the total) and COD (left out when
/// [codEnabled] is off or the total is above [codMax], as PAY-API-1 says). No tender plan: the wallet part is
/// PAY-MOB-1 #78.
// shortcut: mock payment methods until PAY-API-1 #76 lands (not-built-yet.md).
class MockPaymentRepository implements PaymentRepository {
  MockPaymentRepository(
    this.cart, {
    this.walletBalance = 5000,
    this.codEnabled = true,
    this.codMax = 100000,
    this.delay = const Duration(milliseconds: 300),
  });

  final MockCartRepository cart;
  final int walletBalance;
  final bool codEnabled;
  final int codMax;
  final Duration delay;

  @override
  Future<PaymentMethods> methods() async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
    final total = (await cart.get()).total;
    return PaymentMethods(
      options: [
        const PaymentMethodOption(method: PaymentMethodCode.mada, cardLast4: '4821'),
        const PaymentMethodOption(method: PaymentMethodCode.applePay),
        PaymentMethodOption(
          method: PaymentMethodCode.wallet,
          available: walletBalance >= total,
          reason: walletBalance >= total ? null : PaymentMethodReason.walletInsufficient,
        ),
        if (codEnabled && total <= codMax) const PaymentMethodOption(method: PaymentMethodCode.cod),
      ],
    );
  }
}
