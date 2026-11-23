import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' show DateFormat;

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/checkout/presentation/checkout_screen.dart';
import 'package:jazlah/features/checkout/presentation/review_screen.dart';
import 'package:jazlah/features/orders/presentation/order_widgets.dart';
import 'package:jazlah/features/orders/presentation/orders_providers.dart';
import 'package:jazlah/features/payment/domain/payment_method.dart';
import 'package:jazlah/features/payment/presentation/payment_widgets.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// «تفاصيل الطلب» (Figma 135-64189 before shipping, 135-64272 loading, 135-64339 error, 135-64401 another
/// account's order). The tracking and freshness cards show their «not started yet» states as the slots that
/// DLV-MOB-1 #101 fills; status timeline, pickup point, items, totals and payment follow (ORD-MOB-2 output).
/// Live: `order.updated` events refresh it at once, and it re-reads every [pollEvery] while in the foreground.
class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({required this.id, super.key});

  final String id;

  /// The polling fallback while no socket is connected.
  static const pollEvery = Duration(seconds: 30);

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  StreamSubscription<String>? _events;
  Timer? _poll;
  late final AppLifecycleListener _life;

  void _refresh() => ref.invalidate(orderDetailProvider(widget.id));

  /// Set once the order turned out not to be readable: no more polling.
  bool _gone = false;

  void _startPolling() {
    _poll?.cancel();
    if (_gone) return;
    _poll = Timer.periodic(OrderDetailScreen.pollEvery, (_) => _refresh());
  }

  @override
  void initState() {
    super.initState();
    _events = ref.read(orderRealtimeProvider)?.orderUpdated().where((id) => id == widget.id).listen((_) => _refresh());
    _startPolling();
    _life = AppLifecycleListener(
      onResume: () {
        _refresh();
        _startPolling();
      },
      onPause: () => _poll?.cancel(),
    );
  }

  @override
  void dispose() {
    unawaited(_events?.cancel());
    _poll?.cancel();
    _life.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final detail = ref.watch(orderDetailProvider(widget.id));
    // Not this customer's order (or gone): nothing will change, so stop asking.
    ref.listen(orderDetailProvider(widget.id), (_, next) {
      final code = next.hasError ? ApiError.from(next.error!).code : null;
      if (code == 'NOT_FOUND' || code == 'FORBIDDEN') {
        _gone = true;
        _poll?.cancel();
      }
    });
    final d = detail.value;

    final Widget body;
    if (detail.hasError && d == null) {
      final code = ApiError.from(detail.error!).code;
      body = Center(
        child: code == 'NOT_FOUND' || code == 'FORBIDDEN'
            ? JEmptyState(
                kind: JEmptyStateKind.denied,
                title: l10n.orderDeniedTitle,
                body: l10n.orderDeniedBody,
                actionLabel: l10n.back,
                onAction: () => popOrHome(context),
              )
            : CatalogErrorPanel(
                error: detail.error!,
                title: l10n.orderErrorTitle,
                body: l10n.ordersErrorBody,
                onRetry: _refresh,
              ),
      );
    } else if (d == null) {
      body = ListView(
        padding: const EdgeInsets.all(JSpace.s16),
        children: [
          for (var i = 0; i < 3; i++) ...[
            const JSkeletonRow(), // draws its own card
            const SizedBox(height: JSpace.s12),
          ],
        ],
      );
    } else {
      body = _Body(detail: d);
    }

    final pay = d?.order.status == OrderStatus.pendingPayment;
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(title: l10n.orderDetailTitle, cartLabel: l10n.cart, onBack: () => popOrHome(context)),
            Expanded(child: body),
            // «إلغاء الطلب» and «الإبلاغ عن مشكلة» are left out: no customer cancel route in the Sprint 3
            // contract (ORD-API-3 #83), complaints are CMP (Sprint 5); see signoff.md.
            if (pay)
              Padding(
                padding: EdgeInsets.fromLTRB(
                  JSpace.s16,
                  0,
                  JSpace.s16,
                  JSpace.s16 + MediaQuery.viewPaddingOf(context).bottom,
                ),
                child: JButton(
                  label: l10n.orderPayNow,
                  expand: true,
                  onPressed: () => context.push(Routes.payment(widget.id)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Body extends ConsumerWidget {
  const _Body({required this.detail});

  final OrderDetail detail;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final o = detail.order;
    final delivery = o.fulfilment == Fulfilment.delivery;
    final window = o.window == null ? null : windowText(l10n, o.window!);
    final day = calendarDate(o.deliveryDate);
    final dayLabel = o.deliveryDate == riyadhToday(ref.watch(ordersClockProvider)())
        ? l10n.ordersToday
        : '${DateFormat('EEEE', lang).format(day)} ${day.day} ${DateFormat('MMMM', lang).format(day)}';
    final place = delivery
        ? (o.addressSnapshot == null ? '' : addressPlace(context, o.addressSnapshot!))
        : o.pickupSnapshot?.name.of(lang) ?? '';
    final timeline = orderTimeline(l10n, detail);
    const before = {OrderStatus.pendingPayment, OrderStatus.created, OrderStatus.confirmed, OrderStatus.preparing};

    Widget section(String title, List<Widget> children, {double gap = JSpace.s8}) => CartCard(
      gap: gap,
      padding: JSpace.s16,
      children: [
        Text(title, style: JText.h3),
        ...children,
      ],
    );
    Widget slot(String title, String label, String body) => section(title, [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: JText.labelM),
          const SizedBox(height: 2),
          Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
        ],
      ),
    ], gap: JSpace.s12);

    final children = <Widget>[
      CartCard(
        gap: JSpace.s8,
        padding: JSpace.s16,
        children: [
          Row(
            children: [
              Expanded(child: Text(l10n.ordersNumber(o.number), style: JText.h3)),
              orderStatusBadge(l10n, o.status),
            ],
          ),
          Text(
            delivery
                ? (window == null
                      ? l10n.orderLineDeliveryDay(o.vendorName.of(lang), dayLabel, place)
                      : l10n.orderLineDelivery(o.vendorName.of(lang), dayLabel, window.$1, window.$2, place))
                : (window == null
                      ? l10n.orderLinePickupDay(o.vendorName.of(lang), dayLabel, place)
                      : l10n.orderLinePickup(o.vendorName.of(lang), dayLabel, window.$1, window.$2, place)),
            style: JText.bodyM.copyWith(color: JColors.ink2),
          ),
        ],
      ),
      // Reserved for DLV-MOB-1 #101: the frame's own «not started yet» states, never a made-up driver.
      if (delivery && before.contains(o.status))
        slot(l10n.orderTrackingTitle, l10n.orderTrackingNotStarted, l10n.orderTrackingNotStartedBody),
      if (before.contains(o.status))
        slot(l10n.orderFreshnessTitle, l10n.orderFreshnessWaiting, l10n.orderFreshnessWaitingBody),
      // The sections no frame draws come after the drawn cards, each titled inside its card (signoff.md).
      if (timeline != null) JStatusTimeline(title: l10n.orderStatusTitle, steps: timeline.$1, stage: timeline.$2),
      if (!delivery && o.pickupSnapshot != null)
        section(l10n.checkoutPickupPlace, [
          Text(o.pickupSnapshot!.name.of(lang), style: JText.labelM),
          if (o.pickupSnapshot!.address case final address?)
            Text(address.of(lang), style: JText.bodyM.copyWith(color: JColors.ink2)),
          if (o.pickupSnapshot!.opensAt != null && o.pickupSnapshot!.closesAt != null)
            Text(
              l10n.checkoutPickupHours(
                clockText(l10n, o.pickupSnapshot!.opensAt!, short: true),
                clockText(l10n, o.pickupSnapshot!.closesAt!, short: true),
              ),
              style: JText.bodyM.copyWith(color: JColors.ink2),
            ),
          // The store's phone and point from the contract (`pickupPoint.phone`, `vendor { phone, location }`).
          if (o.pickupSnapshot!.phone ?? o.vendorPhone case final phone?)
            JButton(
              label: l10n.checkoutCallStore,
              variant: JButtonVariant.secondary,
              expand: true,
              onPressed: () => ref.read(urlLauncherProvider)(Uri(scheme: 'tel', path: phone)),
            ),
          if (o.pickupSnapshot!.point ?? o.vendorPoint case final point?)
            JButton(
              label: l10n.checkoutDirections,
              variant: JButtonVariant.secondary,
              expand: true,
              onPressed: () => ref.read(urlLauncherProvider)(directionsUri(point)),
            ),
        ]),
      section(l10n.orderItems, [
        for (final i in o.items)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${i.name.of(lang)} × ${i.quantity}', style: JText.labelM),
                    if ([if (i.sizeGrams != null) formatWeight(l10n, i.sizeGrams!), ?i.cutName?.of(lang)]
                        case final options when options.isNotEmpty)
                      Text(options.join(' · '), style: JText.bodyM.copyWith(color: JColors.ink2)),
                    if (i.notes.isNotEmpty)
                      Text(l10n.orderNotes(i.notes), style: JText.bodyM.copyWith(color: JColors.ink2)),
                  ],
                ),
              ),
              Text(l10n.productPrice(formatHalalas(i.lineTotal)), style: JText.bodyM),
            ],
          ),
      ]),
      CartTotals.values(
        subtotal: o.subtotal,
        discount: o.discount,
        couponCode: o.couponCode,
        deliveryFee: delivery ? o.deliveryFee : null,
        vat: o.vatAmount,
        total: o.total,
      ),
      section(l10n.orderPayment, [
        Text(
          [
            paymentMethodLabel(l10n, PaymentMethodOption(method: o.paymentMethod), short: true),
            switch (o.status) {
              OrderStatus.pendingPayment => l10n.orderAwaitingPayment,
              _ when o.paymentMethod == PaymentMethodCode.cod => null, // the method says it
              OrderStatus.cancelled => null,
              _ => l10n.orderPaid,
            },
          ].whereType<String>().join(' · '),
          style: JText.bodyM,
        ),
        if (o.walletAmount > 0)
          Text(l10n.payWalletPart(formatHalalas(o.walletAmount)), style: JText.bodyM.copyWith(color: JColors.ink2)),
      ]),
    ];
    return ListView(
      padding: const EdgeInsets.all(JSpace.s16),
      children: [
        for (final (i, c) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s12), c],
      ],
    );
  }
}
