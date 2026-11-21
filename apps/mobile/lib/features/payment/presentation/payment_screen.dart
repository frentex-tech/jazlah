import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/payment/data/payment_gateway.dart';
import 'package:jazlah/features/payment/data/payment_repository.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_providers.dart';
import 'package:jazlah/features/payment/presentation/payment_widgets.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

enum _Phase { loading, processing, failed, ready }

/// The payment step of an unpaid order, drawn as «الدفع والمراجعة» (Figma 170-29134 processing, 170-29244
/// payment failed, 170-29357 no method): runs the gateway step for the next action, then follows the order's
/// status on the server until it is paid, failed or cancelled; the redirect is never trusted. A failed payment
/// is retried on the same order with a new payment idempotency key (another method may be chosen). Opened
/// again (or the app resumed), it re-reads the status first.
class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({required this.orderId, super.key, this.placed});

  final String orderId;

  /// The placement's answer when coming from the review: its next action starts at once.
  final PlacedOrder? placed;

  /// How often the status is read while a payment is in flight.
  static const pollEvery = Duration(seconds: 2);

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  Order? _order;
  _Phase _phase = _Phase.loading;
  String? _method;
  int _restored = 0;
  String? _toast;
  Timer? _toastTimer;
  late final AppLifecycleListener _life;

  /// Bumped when a flow ends, so a late gateway result or poll of an older flow does nothing.
  int _flow = 0;

  /// The payment in flight; a status about another (an older, failed one) is not its outcome. Empty while a
  /// new payment is being asked for; null when opened again (any outcome is the order's).
  String? _paymentId;

  /// The new payment's idempotency key, kept until the server answers it (a network error keeps it) and
  /// dropped when the method changes (a key belongs to one request body).
  String? _payKey;

  /// A payment is open at the gateway with no outcome yet (the wait stopped after 60 s, or opened again while
  /// it runs): leaving keeps the order for the next start.
  bool _unsettled = false;

  /// Polls before the screen stops waiting (about 60 s) and lets the customer leave.
  static const _maxPolls = 30;

  late final Prefs _prefs = ref.read(prefsProvider);

  PaymentRepository? get _repo => ref.read(paymentRepositoryProvider);

  @override
  void initState() {
    super.initState();
    // Interrupted (3DS left, app killed by the system and restored): the server says how it ended.
    _life = AppLifecycleListener(onResume: () => unawaited(_check()));
    final placed = widget.placed;
    _order = placed?.order;
    _method = placed?.order.paymentMethod;
    _paymentId = placed?.nextAction?.paymentId;
    // Kept until the outcome is known, so a cold start after the app was killed mid-payment comes back here.
    unawaited(_prefs.setPendingPayment(widget.orderId));
    if (placed?.nextAction case final action?) {
      _phase = _Phase.processing;
      WidgetsBinding.instance.addPostFrameCallback((_) => unawaited(_run(action)));
    } else {
      unawaited(_check());
    }
  }

  @override
  void dispose() {
    // Left with nothing in flight (after a decline, or before paying): nothing to come back to.
    if ((_phase == _Phase.failed || _phase == _Phase.ready) && !_unsettled) {
      unawaited(_prefs.setPendingPayment(null));
    }
    _life.dispose();
    _toastTimer?.cancel();
    super.dispose();
  }

  void _showToast(String text) {
    _toastTimer?.cancel();
    setState(() => _toast = text);
    _toastTimer = Timer(const Duration(seconds: 4), () => mounted ? setState(() => _toast = null) : null);
  }

  Future<void> _run(PaymentAction action) async {
    final flow = _flow;
    _paymentId = action.paymentId;
    _unsettled = false;
    setState(() => _phase = _Phase.processing);
    final result = await ref.read(paymentGatewayProvider)!.startPayment(context, action);
    if (!mounted || flow != _flow) return;
    await _follow(flow, once: result == GatewayResult.cancelled);
  }

  /// Reads the status until the payment ends; [once] (the gateway step was closed) reads it a single time.
  Future<void> _follow(int flow, {bool once = false}) async {
    final l10n = AppLocalizations.of(context);
    final repo = _repo;
    if (repo == null) return;
    for (var polls = 0; mounted && flow == _flow; polls++) {
      if (polls == _maxPolls) {
        // Still open at the gateway: stop holding the customer; resume or reopening reads it again.
        _flow++;
        _unsettled = true;
        setState(() => _phase = _Phase.ready);
        _showToast(l10n.payStillProcessing);
        return;
      }
      final OrderPayment s;
      try {
        s = await repo.status(widget.orderId);
      } on Object catch (e) {
        if (!mounted || flow != _flow) return;
        _flow++;
        setState(() => _phase = _Phase.ready);
        _showToast(errorText(context, e));
        return;
      }
      if (!mounted || flow != _flow || _settle(s)) return;
      if (once) {
        _flow++;
        setState(() => _phase = _Phase.ready);
        _showToast(l10n.payNotCompleted);
        return;
      }
      await Future<void>.delayed(PaymentScreen.pollEvery);
    }
  }

  /// One read of the status: on resume, or when the screen is opened again.
  Future<void> _check() async {
    final flow = _flow;
    final repo = _repo;
    if (repo == null) return;
    try {
      final s = await repo.status(widget.orderId);
      if (!mounted || flow != _flow || _settle(s)) return;
      // Still unpaid with nothing in flight here (opened again): the customer pays or retries.
      if (_phase == _Phase.loading) {
        _unsettled = s.paymentStatus == PaymentStatus.initiated;
        setState(() => _phase = _Phase.ready);
      }
    } on Object catch (e) {
      if (!mounted) return;
      final code = ApiError.from(e).code;
      if (code == 'NOT_FOUND' || code == PaymentError.orderNotPayable) {
        // Gone (another account, or a mock order lost with the app): nothing to come back to.
        _flow++;
        unawaited(_prefs.setPendingPayment(null));
        _unsettled = false;
        showJToast(context, message: AppLocalizations.of(context).payOrderGone, kind: JToastKind.error);
        context.go(Routes.home);
        return;
      }
      if (_phase != _Phase.loading) return;
      setState(() => _phase = _Phase.ready);
      _showToast(errorText(context, e));
    }
  }

  /// Acts on a final status and returns true; false while the payment is still open.
  bool _settle(OrderPayment s) {
    final l10n = AppLocalizations.of(context);
    final o = s.order;
    _order = o;
    _restored = s.walletRestored;
    final paid = o.status != OrderStatus.pendingPayment && o.status != OrderStatus.cancelled;
    final failed =
        o.status == OrderStatus.pendingPayment &&
        s.paymentStatus == PaymentStatus.failed &&
        (_paymentId == null || s.paymentId == _paymentId);
    if (!paid && !failed && o.status != OrderStatus.cancelled) {
      setState(() {});
      return false;
    }
    _flow++;
    _unsettled = false;
    if (!failed) unawaited(_prefs.setPendingPayment(null));
    // The gateway's page may still be open (resumed after 3DS): the outcome replaces it.
    Navigator.of(context).popUntil((r) => r is! PopupRoute);
    if (paid) {
      final options = ref.read(paymentMethodsProvider(widget.orderId)).value?.options ?? const [];
      context.go(Routes.orderPlaced, extra: placedArgs(o, options));
    } else if (failed) {
      if (_phase == _Phase.failed) return true; // already shown
      setState(() => _phase = _Phase.failed);
      _showToast(l10n.payDeclined);
    } else {
      // ORD-API-2's 15-minute job cancelled the unpaid order (and gave the wallet part back).
      showJToast(context, message: l10n.payExpired, kind: JToastKind.error, duration: const Duration(seconds: 5));
      context.go(Routes.cart);
    }
    return true;
  }

  /// A new payment on the same order with the chosen method; one per tap (the button is busy meanwhile).
  Future<void> _pay(PaymentMethodOption method) async {
    final repo = _repo;
    if (_phase == _Phase.processing || repo == null) return;
    final flow = _flow;
    _paymentId = ''; // the old payment's failure is not this attempt's
    final key = _payKey ??= newIdempotencyKey();
    setState(() => _phase = _Phase.processing);
    unawaited(_prefs.setPendingPayment(widget.orderId));
    try {
      final placed = await repo.retry(orderId: widget.orderId, method: method.method, idempotencyKey: key);
      _payKey = null; // answered: the next attempt is a new payment
      if (!mounted || flow != _flow) return;
      if (placed.nextAction case final action?) {
        await _run(action);
      } else {
        await _follow(flow); // COD or wallet: settled at once
      }
    } on Object catch (e) {
      final code = ApiError.from(e).code;
      // A refusal with a code is a definite answer; without one the payment may exist: same key next time.
      if (code != ApiError.network && code != ApiError.unknown) _payKey = null;
      if (!mounted || flow != _flow) return;
      if (code == PaymentError.orderNotPayable) return _check();
      setState(() => _phase = _Phase.ready);
      _showToast(errorText(context, e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final methods = ref.watch(paymentMethodsProvider(widget.orderId));
    final options = methods.value?.options ?? const <PaymentMethodOption>[];
    final chosen = chosenMethod(options, _method);
    final busy = _phase == _Phase.processing || _phase == _Phase.loading;
    final o = _order;

    final body = ListView(
      padding: const EdgeInsets.all(JSpace.s16),
      children: [
        const CheckoutSteps(step: 2),
        const SizedBox(height: JSpace.s8),
        if (o == null)
          for (var i = 0; i < 4; i++) const JSkeletonRow()
        else ...[
          SummaryCard(
            title: l10n.reviewItemsFrom(o.items.length, o.vendorName.of(lang)),
            items: [for (final i in o.items) '${i.name.of(lang)} × ${i.quantity}'].join(lang == 'en' ? ', ' : '، '),
            when: () {
              final (start, end) = windowText(l10n, o.window);
              return '${dayText(context, calendarDate(o.deliveryDate))} · $start – $end';
            }(),
            where: o.fulfilment == Fulfilment.delivery
                ? (o.addressSnapshot == null ? null : l10n.reviewDeliveryTo(addressPlace(context, o.addressSnapshot!)))
                : (o.pickupSnapshot == null ? null : l10n.reviewPickupFrom(o.pickupSnapshot!.name.of(lang))),
          ),
          const SizedBox(height: JSpace.s8),
          CartTotals.values(
            subtotal: o.subtotal,
            discount: o.discount,
            couponCode: o.couponCode,
            deliveryFee: o.fulfilment == Fulfilment.delivery ? o.deliveryFee : null,
            vat: o.vatAmount,
            total: o.total,
          ),
        ],
        const SizedBox(height: JSpace.s8),
        PaymentMethodsCard(
          methods: methods,
          chosen: chosen,
          frozen: busy,
          onChoose: (m) => setState(() {
            if (m != chosen?.method) _payKey = null;
            _method = m;
          }),
          onRetry: () => ref.invalidate(paymentMethodsProvider(widget.orderId)),
          notice: [
            if (o != null && o.walletAmount > 0) l10n.payWalletPart(formatHalalas(o.walletAmount)),
            if (_restored > 0) l10n.payWalletRestored(formatHalalas(_restored)),
          ].join('\n').nullIfEmpty,
        ),
        const SizedBox(height: JSpace.s8),
        Text(l10n.reviewTerms, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );

    return PopScope(
      canPop: _phase != _Phase.processing, // the outcome must be seen
      child: CheckoutPage(
        body: body,
        onBack: _phase == _Phase.processing ? null : () => popOrHome(context),
        overlay: _toast == null ? null : JToast(message: _toast!, kind: JToastKind.error),
        button: JButton(
          label: _phase == _Phase.failed ? l10n.retry : l10n.reviewConfirm,
          expand: true,
          loading: busy,
          onPressed: chosen == null || o == null ? null : () => _pay(chosen),
        ),
      ),
    );
  }
}

extension on String {
  String? get nullIfEmpty => isEmpty ? null : this;
}
