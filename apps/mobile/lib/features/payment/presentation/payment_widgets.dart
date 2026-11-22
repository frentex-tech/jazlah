import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// The method the customer picked, if it can still be used. Nothing is preselected: until a pick the screen shows
/// «اختر طريقة دفع للمتابعة» (Figma 170-29357) and the button stays disabled.
PaymentMethodOption? chosenMethod(List<PaymentMethodOption> options, String? picked) =>
    options.where((m) => m.available && m.method == picked).firstOrNull;

/// «طريقة الدفع» (170-28952): the methods as radios, the wallet part switch when the tender plan offers one,
/// a notice (the wallet amount given back) and «اختر طريقة دفع للمتابعة» when no method can be chosen.
/// Reused by the review and the payment step (and later the deposit payment, OCC-MOB-1 #124).
class PaymentMethodsCard extends StatelessWidget {
  const PaymentMethodsCard({
    required this.methods,
    required this.chosen,
    required this.frozen,
    required this.onChoose,
    required this.onRetry,
    super.key,
    this.useWallet = false,
    this.onUseWallet,
    this.remaining,
    this.notice,
  });

  final AsyncValue<PaymentMethods> methods;
  final PaymentMethodOption? chosen;

  /// While a request runs (or the choice is pinned): taps are ignored, nothing is drawn disabled.
  final bool frozen;
  final ValueChanged<String> onChoose;
  final VoidCallback onRetry;

  /// The wallet part of the tender plan is used; [remaining] is what the chosen method then pays.
  final bool useWallet;
  final ValueChanged<bool>? onUseWallet;
  final int? remaining;
  final String? notice;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final tender = methods.value?.tender;
    final options = methods.value?.options ?? const <PaymentMethodOption>[];
    // With the wallet part on, the rest is paid by another method: the wallet-only row steps aside.
    final shown = useWallet ? options.where((m) => m.method != PaymentMethodCode.wallet) : options;
    return CartCard(
      gap: 6,
      children: [
        Text(l10n.reviewPaymentMethod, style: JText.labelM),
        ...switch (methods) {
          AsyncValue(:final error?) when !methods.isLoading => [
            Text(errorText(context, error), style: JText.bodyM.copyWith(color: JColors.ink2)),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: JButton(
                label: l10n.retry,
                size: JButtonSize.s,
                variant: JButtonVariant.secondary,
                onPressed: onRetry,
              ),
            ),
          ],
          AsyncValue(hasValue: false) => [const JSkeletonRow(), const JSkeletonRow()],
          _ => [
            for (final m in shown)
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: AbsorbPointer(
                  absorbing: frozen,
                  child: JRadio(
                    checked: m.method == chosen?.method,
                    label: paymentMethodLabel(l10n, m),
                    onTap: m.available ? () => onChoose(m.method) : null,
                  ),
                ),
              ),
            if (tender != null && onUseWallet != null)
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: AbsorbPointer(
                  absorbing: frozen,
                  child: JSwitch(
                    checked: useWallet,
                    label: l10n.payUseWallet(formatHalalas(tender.walletAmount)),
                    onChanged: onUseWallet,
                  ),
                ),
              ),
            if (useWallet && remaining != null)
              Text(l10n.payRemaining(formatHalalas(remaining!)), style: JText.bodyM.copyWith(color: JColors.ink2)),
            if (notice != null) Text(notice!, style: JText.bodyM.copyWith(color: JColors.ink2)),
            if (chosen == null)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(JIcons.warningCircle, size: 20, color: JColors.danger),
                  const SizedBox(width: JSpace.s8),
                  Flexible(
                    child: Text(l10n.payChooseMethod, style: JText.labelM.copyWith(color: JColors.danger)),
                  ),
                ],
              ),
          ],
        },
      ],
    );
  }
}

/// «بطاقة مدى · تنتهي بـ 4821», «محفظة جزلة · الرصيد غير كافٍ» …; [short] names the method as the order
/// placed screen does («مدى · …») and leaves out the reason.
String paymentMethodLabel(AppLocalizations l10n, PaymentMethodOption m, {bool short = false}) {
  final name = switch (m.method) {
    PaymentMethodCode.mada => short ? l10n.payMada : l10n.payMadaCard,
    PaymentMethodCode.card => l10n.payCard,
    PaymentMethodCode.applePay => l10n.payApplePay,
    PaymentMethodCode.wallet => l10n.payWallet,
    PaymentMethodCode.cod => l10n.payCod,
    _ => m.method,
  };
  return [
    name,
    if (m.cardLast4 != null) l10n.payEndingIn(m.cardLast4!),
    if (!short && !m.available)
      switch (m.reason) {
        PaymentMethodReason.walletInsufficient => l10n.payReasonWalletInsufficient,
        _ => l10n.payReasonUnavailable,
      },
  ].join(' · ');
}
