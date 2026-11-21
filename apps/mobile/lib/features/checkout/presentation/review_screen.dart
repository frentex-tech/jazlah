import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Where a refused placement sends the customer.
enum ReviewExit { fulfilment, cart }

/// The step that can fix what the server refused; null: stay and try again (same idempotency key).
ReviewExit? reviewExit(String code) => switch (code) {
  FulfilmentError.dayFull ||
  FulfilmentError.addressNotCovered ||
  FulfilmentError.notSupported ||
  FulfilmentError.orderingPaused ||
  'NOT_FOUND' ||
  'VALIDATION_FAILED' => ReviewExit.fulfilment,
  OrderError.priceChanged || OrderError.itemUnavailable || OrderError.minOrderNotMet => ReviewExit.cart,
  _ when code.startsWith('COUPON_') => ReviewExit.cart,
  _ => null,
};

/// What the order placed screen shows: the order and the method it was placed with.
typedef OrderPlacedArgs = ({Order order, PaymentMethodOption method});

/// «الدفع والمراجعة» (Figma 170-28952, 170-29025 method chosen): items, fulfilment and totals, the payment
/// method, and «تأكيد الطلب», which places the order (ORD-API-1). The payment itself is PAY-MOB-1 #78.
class ReviewScreen extends ConsumerStatefulWidget {
  const ReviewScreen({super.key});

  @override
  ConsumerState<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends ConsumerState<ReviewScreen> {
  /// One key per checkout attempt: a retry or a double tap sends the same one, so one order is created.
  final String _key = newIdempotencyKey();
  String? _method;
  bool _placing = false;

  Future<void> _place(PaymentMethodOption method) async {
    if (_placing) return;
    setState(() => _placing = true);
    try {
      final placed = await ref.read(orderRepositoryProvider)!.place(idempotencyKey: _key, paymentMethod: method.method);
      ref.invalidate(cartProvider); // the server cleared the cart (and the badge)
      if (!mounted) return;
      if (placed.nextAction == PlacedOrder.pay) {
        context.go(Routes.payment(placed.order.id), extra: placed);
      } else {
        context.go(Routes.orderPlaced, extra: (order: placed.order, method: method));
      }
    } on Object catch (e) {
      if (!mounted) return;
      final code = ApiError.from(e).code;
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      setState(() => _placing = false);
      final exit = reviewExit(code);
      if (exit == null) return;
      // Checkout step 1 handles the code (refetch, or on to the cart); opened alone, go to the step.
      if (context.canPop()) {
        context.pop(code);
      } else {
        context.go(exit == ReviewExit.cart ? Routes.cart : Routes.checkout);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final cart = ref.watch(cartProvider);
    final methods = ref.watch(paymentMethodsProvider);
    final c = cart.value;
    final available = methods.value?.where((m) => m.available).toList() ?? const <PaymentMethodOption>[];
    // The first method the order may use is chosen until the customer picks one (as drawn).
    final chosen =
        available.where((m) => m.method == _method).firstOrNull ?? (_method == null ? available.firstOrNull : null);
    final ready = c != null && c.fulfilment != null && c.lines.isNotEmpty && chosen != null;

    final Widget body;
    if (cart.hasError && c == null) {
      body = Center(
        child: CatalogErrorPanel(
          error: cart.error!,
          title: l10n.cartErrorTitle,
          body: l10n.cartErrorBody,
          onRetry: () => ref.invalidate(cartProvider),
        ),
      );
    } else {
      body = ListView(
        padding: const EdgeInsets.all(JSpace.s16),
        children: [
          const CheckoutSteps(step: 2),
          const SizedBox(height: JSpace.s8),
          if (c == null)
            for (var i = 0; i < 4; i++) const JSkeletonRow()
          else ...[
            _Summary(cart: c),
            const SizedBox(height: JSpace.s8),
            CartTotals(cart: c),
          ],
          const SizedBox(height: JSpace.s8),
          CartCard(
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
                      onPressed: () => ref.invalidate(paymentMethodsProvider),
                    ),
                  ),
                ],
                AsyncValue(hasValue: false) => [const JSkeletonRow(), const JSkeletonRow()],
                _ => [
                  for (final m in methods.value!)
                    Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: JRadio(
                        checked: m.method == chosen?.method,
                        label: paymentMethodLabel(l10n, m),
                        onTap: m.available && !_placing ? () => setState(() => _method = m.method) : null,
                      ),
                    ),
                ],
              },
            ],
          ),
          const SizedBox(height: JSpace.s8),
          Text(l10n.reviewTerms, style: JText.bodyM.copyWith(color: JColors.ink2)),
        ],
      );
    }

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(
              title: l10n.reviewTitle,
              cartLabel: l10n.cart,
              onBack: _placing ? null : () => popOrHome(context),
            ),
            Expanded(child: body),
            Padding(
              padding: EdgeInsets.fromLTRB(
                JSpace.s16,
                0,
                JSpace.s16,
                JSpace.s16 + MediaQuery.viewPaddingOf(context).bottom,
              ),
              child: JButton(
                label: l10n.reviewConfirm,
                expand: true,
                loading: _placing,
                onPressed: ready ? () => _place(chosen) : null,
              ),
            ),
          ],
        ),
      ),
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
        PaymentMethodReason.codAboveLimit => l10n.payReasonCodAboveLimit,
        _ => l10n.payReasonUnavailable,
      },
  ].join(' · ');
}

/// «4:00» and «6:00 م» from a Riyadh window, shown as is; the period on the start only when it differs.
(String, String) windowText(AppLocalizations l10n, TimeWindow w) {
  bool pm(String t) => int.parse(t.split(':').first) >= 12;
  String clock(String t, {required bool period}) {
    final [h, m] = t.split(':');
    final hour = int.parse(h) % 12 == 0 ? 12 : int.parse(h) % 12;
    return period ? '$hour:$m ${pm(t) ? l10n.clockPmShort : l10n.clockAmShort}' : '$hour:$m';
  }

  return (clock(w.start, period: pm(w.start) != pm(w.end)), clock(w.end, period: true));
}

/// «حي الملقا، الرياض»; the label when the address has no district or city.
String addressPlace(BuildContext context, Address a) {
  final parts = [a.district, a.city].whereType<String>().where((s) => s.trim().isNotEmpty);
  return parts.isEmpty ? a.label : parts.join(context.lang == 'en' ? ', ' : '، ');
}

/// What is ordered, from which store, and when and where it is received.
class _Summary extends ConsumerWidget {
  const _Summary({required this.cart});

  final Cart cart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final f = cart.fulfilment;
    final names = [
      for (final l in cart.lines) '${l.name?.of(lang) ?? l10n.cartItemGone} × ${l.item.quantity}',
    ].join(lang == 'en' ? ', ' : '، ');

    Widget group(String title, String body) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: JText.labelM),
        const SizedBox(height: 2),
        Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );

    String? when;
    String? where;
    if (f != null) {
      final delivery = f.method == Fulfilment.delivery;
      final days = ref.watch(checkoutDaysProvider((method: f.method, addressId: delivery ? f.addressId : null))).value;
      final window = days?.where((d) => d.date == f.date).firstOrNull?.window;
      final day = dayText(context, calendarDate(f.date));
      if (window == null) {
        when = day;
      } else {
        final (start, end) = windowText(l10n, window);
        when = '$day · $start – $end';
      }
      if (delivery) {
        final address = ref.watch(addressesProvider).value?.where((a) => a.id == f.addressId).firstOrNull;
        where = address == null ? null : l10n.reviewDeliveryTo(addressPlace(context, address));
      } else {
        where = cart.pickup == null ? null : l10n.reviewPickupFrom(cart.pickup!.name.of(lang));
      }
    }

    return CartCard(
      gap: JSpace.s12,
      children: [
        group(l10n.reviewItemsFrom(cart.lines.length, cart.vendorName?.of(lang) ?? ''), names),
        if (when != null) group(when, where ?? ''),
      ],
    );
  }
}
