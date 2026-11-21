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

/// Why a listed method cannot be chosen.
// shortcut: the app's names until PAY-API-1 #76 fixes the reason codes (not-built-yet.md).
abstract final class PaymentMethodReason {
  static const walletInsufficient = 'WALLET_INSUFFICIENT';
  static const codAboveLimit = 'COD_ABOVE_LIMIT';
  static const codNotAllowed = 'COD_NOT_ALLOWED';
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
