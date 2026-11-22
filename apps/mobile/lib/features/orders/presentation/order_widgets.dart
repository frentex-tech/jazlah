import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart' show DateFormat;

import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/domain/order.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// The badge of an ORD-API-2 status (Figma: «في الطريق» info, «تم التسليم» success, «ملغي» danger,
/// «قيد التجهيز» warning).
JBadge orderStatusBadge(AppLocalizations l10n, String status) {
  final (String label, JBadgeType type) = switch (status) {
    OrderStatus.pendingPayment => (l10n.statusPendingPayment, JBadgeType.warning),
    OrderStatus.created => (l10n.statusNew, JBadgeType.neutral),
    OrderStatus.confirmed => (l10n.statusConfirmed, JBadgeType.info),
    OrderStatus.preparing => (l10n.statusPreparing, JBadgeType.warning),
    OrderStatus.ready => (l10n.statusReady, JBadgeType.info),
    OrderStatus.pickedUp || OrderStatus.outForDelivery => (l10n.statusOnTheWay, JBadgeType.info),
    OrderStatus.delivered => (l10n.statusDelivered, JBadgeType.success),
    OrderStatus.collected => (l10n.statusCollected, JBadgeType.success),
    OrderStatus.cancelled => (l10n.statusCancelled, JBadgeType.danger),
    OrderStatus.deliveryFailed => (l10n.statusDeliveryFailed, JBadgeType.danger),
    OrderStatus.returned => (l10n.statusReturned, JBadgeType.danger),
    _ => (status, JBadgeType.neutral),
  };
  return JBadge(label: label, type: type, size: JBadgeSize.s);
}

/// «4:00 م» from a Riyadh `HH:mm`, shown as is.
String clock12(AppLocalizations l10n, String hhmm) {
  final [h, m] = hhmm.split(':');
  final hour = int.parse(h) % 12 == 0 ? 12 : int.parse(h) % 12;
  return '$hour:$m ${int.parse(h) >= 12 ? l10n.clockPmShort : l10n.clockAmShort}';
}

/// Today's Riyadh `yyyy-MM-dd` for [now] (UTC+3, no daylight saving).
String riyadhToday(DateTime now) {
  final r = now.toUtc().add(const Duration(hours: 3));
  return '${r.year}-${r.month.toString().padLeft(2, '0')}-${r.day.toString().padLeft(2, '0')}';
}

/// «اليوم، 4:00 م» on the day itself, else «7 نوفمبر 2026» (the card footer).
String orderWhen(BuildContext context, Order o, DateTime now) {
  final l10n = AppLocalizations.of(context);
  if (o.deliveryDate == riyadhToday(now)) return l10n.ordersTodayAt(clock12(l10n, o.window.start));
  final d = calendarDate(o.deliveryDate);
  return '${d.day} ${DateFormat('MMMM', context.lang).format(d)} ${d.year}';
}

/// «ريب آي بقري طازج × 2، ساق خروف × 1».
String orderItemsText(BuildContext context, Order o) =>
    [for (final i in o.items) '${i.name.of(context.lang)} × ${i.quantity}'].join(context.lang == 'en' ? ', ' : '، ');

/// The status timeline steps of an order and the 1-based current stage, from its status history (each step's
/// Riyadh time once reached). Null when no timeline applies (unpaid, cancelled, failed).
(List<JTimelineStep>, int)? orderTimeline(AppLocalizations l10n, OrderDetail d) {
  final o = d.order;
  final delivery = o.fulfilment == Fulfilment.delivery;
  // Each step and the statuses that reach it.
  final steps = <(String, Set<String>)>[
    (l10n.stepReceived, {OrderStatus.created, OrderStatus.confirmed}),
    (l10n.stepPreparing, {OrderStatus.preparing}),
    (delivery ? l10n.stepReadyDelivery : l10n.stepReadyPickup, {OrderStatus.ready}),
    if (delivery) (l10n.stepOnTheWay, {OrderStatus.pickedUp, OrderStatus.outForDelivery}),
    if (delivery) (l10n.stepDelivered, {OrderStatus.delivered}) else (l10n.stepCollected, {OrderStatus.collected}),
  ];
  final stage = steps.indexWhere((s) => s.$2.contains(o.status)) + 1;
  if (stage == 0) return null;
  String? timeOf(Set<String> statuses) {
    final at = d.history.where((h) => statuses.contains(h.to)).firstOrNull?.at;
    if (at == null) return null;
    final r = at.toUtc().add(const Duration(hours: 3));
    return clock12(l10n, '${r.hour.toString().padLeft(2, '0')}:${r.minute.toString().padLeft(2, '0')}');
  }

  return (
    [
      for (final (i, (title, statuses)) in steps.indexed)
        JTimelineStep(title: title, time: i < stage ? timeOf(statuses) : null),
    ],
    stage,
  );
}
