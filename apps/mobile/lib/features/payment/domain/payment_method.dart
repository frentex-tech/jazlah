/// The payment methods of PAY-API-1 (sprint-3.md): `GET /v1/customer/checkout/payment-methods` answers which
/// methods this order may use, and why the others cannot be used.
library;

import 'package:flutter/foundation.dart';

/// `method` of a payment: mada | card | applepay | cod | wallet.
abstract final class PaymentMethodCode {
  static const mada = 'mada';
  static const card = 'card';
  static const applePay = 'applepay';
  static const cod = 'cod';
  static const wallet = 'wallet';

  /// Paid through the gateway: the order waits for the payment step (`pending_payment`).
  static const Set<String> gateway = {mada, card, applePay};
}

/// Why a listed method cannot be chosen (`items[].reason` of the payment methods).
abstract final class PaymentMethodReason {
  static const walletInsufficient = 'INSUFFICIENT_BALANCE';
}

/// One method of the list. [cardLast4] is set for a saved card (mada / card).
@immutable
class PaymentMethodOption {
  const PaymentMethodOption({required this.method, this.available = true, this.reason, this.cardLast4});

  final String method;
  final bool available;

  /// One of [PaymentMethodReason] when not [available].
  final String? reason;
  final String? cardLast4;
}

/// PAY-API-1's tender plan: [walletAmount] halalas from the wallet, the rest with [remainingMethod] (null when
/// the wallet covers it all).
@immutable
class TenderPlan {
  const TenderPlan({required this.walletAmount, this.remainingMethod});

  final int walletAmount;
  final String? remainingMethod;
}

/// The answer of the payment methods route: the methods (COD is left out when it may not be used) and the
/// tender plan, when the wallet pays part of the order. PAY-MOB-1 #78 reads [tender].
@immutable
class PaymentMethods {
  const PaymentMethods({required this.options, this.tender});

  final List<PaymentMethodOption> options;
  final TenderPlan? tender;
}

/// `status` of a `Payment` (PAY-API-1).
abstract final class PaymentStatus {
  static const initiated = 'initiated';
  static const authorized = 'authorized';
  static const captured = 'captured';
  static const failed = 'failed';
  static const cancelled = 'cancelled';
}

/// The payment's next action (`payment.nextAction { type, redirectUrl, returnUrl }`): open the provider's hosted
/// page at [redirectUrl] (3DS, Apple Pay, the fake provider's approve/decline page) and come back when it navigates
/// to [returnUrl]. [paymentId], [method] and [amount] (halalas) are the payment's `id`, `method`, `amountHalalas`.
@immutable
class PaymentAction {
  const PaymentAction({
    required this.paymentId,
    required this.method,
    required this.amount,
    required this.redirectUrl,
    required this.returnUrl,
    this.type = redirect,
  });

  static const redirect = 'redirect';

  final String type;
  final String paymentId;
  final String method;
  final int amount;
  final String redirectUrl;
  final String returnUrl;
}

/// Whether a navigation to [url] is the hosted page handing control back ([returnUrl], any query).
bool isReturnUrl(String url, String returnUrl) {
  final u = Uri.tryParse(url);
  final r = Uri.parse(returnUrl);
  return u != null && u.scheme == r.scheme && u.host == r.host && u.path == r.path;
}

/// Refusals of a new payment on an order.
abstract final class PaymentError {
  /// The order is no longer waiting for a payment (paid, or cancelled by the 15-minute timeout).
  static const orderNotPayable = 'ORDER_NOT_PAYABLE';

  /// The order's latest payment is still open at the provider (`details.paymentId`): no second one until it ends.
  static const paymentInProgress = 'PAYMENT_IN_PROGRESS';

  /// The method cannot pay this order: stay and read the methods again.
  static const methodNotAvailable = 'PAYMENT_METHOD_NOT_AVAILABLE';
}
