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
