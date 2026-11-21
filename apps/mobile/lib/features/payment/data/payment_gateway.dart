import 'package:flutter/material.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// How the gateway step ended on the device. It says nothing about the payment's outcome: the app then reads
/// the order's status from the server (never trust the redirect).
enum GatewayResult { finished, cancelled }

/// The payment port on the device: runs the gateway's step (3DS page, Apple Pay sheet) for a next action. The
/// gateway SDK replaces [FakePaymentGateway] in PAY-MOB-2 #79. The same port serves a deposit or a remaining
/// amount later (OCC-MOB-1 #124): it only needs the next action.
// ignore: one_member_abstracts, the seam between the gateway SDK and the fake provider.
abstract interface class PaymentGateway {
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action);
}

/// The fake provider's page (PAY-API-1 `providers/fake`): a 3DS-like sheet where the tester approves or declines;
/// the decision goes to the (mock) server as the provider's webhook would. Closing the sheet interrupts it.
// shortcut: fake gateway step until PAY-MOB-2 #79 hooks up the gateway SDK (not-built-yet.md).
class FakePaymentGateway implements PaymentGateway {
  FakePaymentGateway(this.decide);

  final void Function(String paymentId, {required bool approve}) decide;

  @override
  Future<GatewayResult> startPayment(BuildContext context, PaymentAction action) async {
    final approve = await showJBottomSheet<bool>(
      context,
      title: AppLocalizations.of(context).payFakeTitle,
      builder: (_) => _FakePage(action: action),
    );
    if (approve == null) return GatewayResult.cancelled;
    decide(action.paymentId, approve: approve);
    return GatewayResult.finished;
  }
}

class _FakePage extends StatelessWidget {
  const _FakePage({required this.action});

  final PaymentAction action;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.payFakeBody(formatHalalas(action.amount)), style: JText.bodyM.copyWith(color: JColors.ink2)),
        const SizedBox(height: JSpace.s16),
        JButton(label: l10n.payFakeApprove, expand: true, onPressed: () => Navigator.of(context).pop(true)),
        const SizedBox(height: JSpace.s8),
        JButton(
          label: l10n.payFakeDecline,
          expand: true,
          variant: JButtonVariant.secondary,
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ],
    );
  }
}
