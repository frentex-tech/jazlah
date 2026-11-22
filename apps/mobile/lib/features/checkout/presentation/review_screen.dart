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
import 'package:jazlah/features/payment/presentation/payment_widgets.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Where a refused placement sends the customer.
enum ReviewExit { fulfilment, cart }

/// The step that can fix what the server refused; null: stay (a retry sends the same idempotency key; for
/// WALLET_INSUFFICIENT the methods are read again).
ReviewExit? reviewExit(String code) => switch (code) {
  FulfilmentError.dayFull ||
  FulfilmentError.dayNotAvailable ||
  FulfilmentError.addressNotCovered ||
  FulfilmentError.notSupported ||
  FulfilmentError.orderingPaused ||
  OrderError.fulfilmentRequired ||
  'NOT_FOUND' => ReviewExit.fulfilment,
  OrderError.priceChanged ||
  OrderError.itemUnavailable ||
  OrderError.minOrderNotMet ||
  OrderError.cartEmpty => ReviewExit.cart,
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
  bool _useWallet = false;
  bool _placing = false;

  /// A failure that may have created the order keeps the key; the method and the wallet part are then kept
  /// too, so a retry sends the same body ([_lockedWallet]; a refetched tender plan can't change it).
  bool _methodLocked = false;
  int? _lockedWallet;

  Future<void> _place(PaymentMethodOption method, List<PaymentMethodOption> options, int walletAmount) async {
    if (_placing) return;
    setState(() => _placing = true);
    // Kept across the await: the cart must be re-read even if the screen is gone by then.
    final container = ProviderScope.containerOf(context, listen: false);
    try {
      final placed = await ref
          .read(orderRepositoryProvider)!
          .place(idempotencyKey: _key, paymentMethod: method.method, walletAmount: walletAmount);
      container.invalidate(cartProvider); // the server cleared the cart (and the badge)
      if (!mounted) return;
      if (placed.nextAction != null) {
        context.go(Routes.payment(placed.order.id), extra: placed);
      } else {
        context.go(Routes.orderPlaced, extra: placedArgs(placed.order, options));
      }
    } on Object catch (e) {
      if (!mounted) return;
      final code = ApiError.from(e).code;
      showJToast(context, message: errorText(context, e), kind: JToastKind.error);
      final exit = reviewExit(code);
      final wallet = code == OrderError.walletInsufficient; // a definite refusal: the balance changed
      setState(() {
        _placing = false;
        if (wallet) {
          _useWallet = false;
        } else if (exit == null) {
          _methodLocked = true;
          _method = method.method; // pinned, so a later refetch can't change what the retry sends
          _lockedWallet = walletAmount;
        }
      });
      if (wallet) ref.invalidate(paymentMethodsProvider(null));
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
    final methods = ref.watch(paymentMethodsProvider(null));
    final c = cart.value;
    final options = methods.value?.options ?? const <PaymentMethodOption>[];
    final tender = methods.value?.tender;
    final useWallet = _useWallet && tender != null;
    final chosen = chosenMethod(
      useWallet ? options.where((m) => m.method != PaymentMethodCode.wallet).toList() : options,
      _method,
    );
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
          PaymentMethodsCard(
            methods: methods,
            chosen: chosen,
            frozen: _placing || _methodLocked,
            onChoose: (m) => setState(() => _method = m),
            onRetry: () => ref.invalidate(paymentMethodsProvider(null)),
            useWallet: useWallet,
            onUseWallet: (on) => setState(() => _useWallet = on),
            remaining: c == null || tender == null ? null : c.total - tender.walletAmount,
          ),
          const SizedBox(height: JSpace.s8),
          Text(l10n.reviewTerms, style: JText.bodyM.copyWith(color: JColors.ink2)),
        ],
      );
    }

    return PopScope(
      canPop: !_placing, // leaving mid-request would hide the order it creates
      child: CheckoutPage(
        body: body,
        button: JButton(
          label: l10n.reviewConfirm,
          expand: true,
          loading: _placing,
          onPressed: ready
              ? () => _place(chosen, options, _lockedWallet ?? (useWallet ? tender.walletAmount : 0))
              : null,
        ),
        onBack: _placing ? null : () => popOrHome(context),
      ),
    );
  }
}

/// The order placed screen's arguments: the order and its own method (with the card digits when listed).
OrderPlacedArgs placedArgs(Order order, List<PaymentMethodOption> options) {
  final paid = order.paymentMethod;
  return (
    order: order,
    method: options.where((m) => m.method == paid).firstOrNull ?? PaymentMethodOption(method: paid),
  );
}

/// «الدفع والمراجعة»'s frame, shared by the review and the payment step: header, [body], the button pinned at
/// the bottom, and an [overlay] (the toast drawn at the top in 170-29244).
class CheckoutPage extends StatelessWidget {
  const CheckoutPage({required this.body, required this.button, required this.onBack, super.key, this.overlay});

  final Widget body;
  final Widget button;
  final VoidCallback? onBack;
  final Widget? overlay;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Column(
              children: [
                JAppHeader.page(title: l10n.reviewTitle, cartLabel: l10n.cart, onBack: onBack),
                Expanded(child: body),
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    JSpace.s16,
                    0,
                    JSpace.s16,
                    JSpace.s16 + MediaQuery.viewPaddingOf(context).bottom,
                  ),
                  child: button,
                ),
              ],
            ),
            if (overlay != null) PositionedDirectional(top: 55, start: 23, end: 23, child: overlay!),
          ],
        ),
      ),
    );
  }
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

    return SummaryCard(
      title: l10n.reviewItemsFrom(cart.lines.length, cart.vendorName?.of(lang) ?? ''),
      items: names,
      when: when,
      where: where,
    );
  }
}

/// What is ordered (from which store) and when and where it is received.
class SummaryCard extends StatelessWidget {
  const SummaryCard({required this.title, required this.items, super.key, this.when, this.where});

  final String title;
  final String items;
  final String? when;
  final String? where;

  @override
  Widget build(BuildContext context) {
    Widget group(String title, String body) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: JText.labelM),
        const SizedBox(height: 2),
        Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );
    return CartCard(
      gap: JSpace.s12,
      children: [group(title, items), if (when != null) group(when!, where ?? '')],
    );
  }
}
