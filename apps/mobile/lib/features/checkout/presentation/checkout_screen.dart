import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' show DateFormat;

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/addresses/presentation/addresses_screen.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/checkout/domain/fulfilment.dart';
import 'package:jazlah/features/checkout/presentation/checkout_providers.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Checkout step 1: method, address and day (Figma 118-9638 delivery, 118-9741 pickup, 118-9829 calendar,
/// 118-10052 paused, 118-10144 loading, 118-10199 no covered address, 118-10251 days error, 118-10342 closed,
/// 118-10426 full, 118-10510 past cutoff). The server computes the days; this screen only shows them.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  Fulfilment? _method;
  String? _addressId;

  /// The day tapped last; a disabled one shows its reason instead of the window.
  String? _date;
  bool _saving = false;

  Future<void> _save(FulfilmentChoice choice) async {
    setState(() => _saving = true);
    try {
      await ref.read(checkoutRepositoryProvider)!.save(choice);
      // The cart now carries the fulfilment (and the delivery fee for delivery).
      ref.invalidate(cartProvider);
      if (mounted) unawaited(context.push(Routes.checkoutReview));
    } on Object catch (e) {
      // Whatever the server refused may have changed under the screen: ask again.
      switch (ApiError.from(e).code) {
        case FulfilmentError.orderingPaused:
          ref.invalidate(orderingPauseProvider);
        case FulfilmentError.addressNotCovered || 'NOT_FOUND':
          // The address left coverage or was deleted: reload the book and choose again.
          ref.invalidate(addressesProvider);
          if (mounted) setState(() => _addressId = null);
        case FulfilmentError.dayFull || FulfilmentError.notSupported || 'VALIDATION_FAILED':
          ref.invalidate(checkoutDaysProvider);
      }
      if (mounted) showJToast(context, message: errorText(context, e), kind: JToastKind.error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final cart = ref.watch(cartProvider);
    final addresses = ref.watch(addressesProvider);
    final pauseAsync = ref.watch(orderingPauseProvider);
    final pause = pauseAsync.value;
    final method = _method ?? cart.value?.fulfilment?.method ?? Fulfilment.delivery;
    final loading =
        !cart.hasValue ||
        (!addresses.hasValue && !addresses.hasError) ||
        (!pauseAsync.hasValue && !pauseAsync.hasError);

    final covered = addresses.value?.where((a) => a.covered).toList() ?? const <Address>[];
    String? pick(String? id) => covered.any((a) => a.id == id) ? id : null;
    final addressId =
        pick(_addressId) ??
        pick(cart.value?.fulfilment?.addressId) ??
        covered.where((a) => a.isDefault).firstOrNull?.id ??
        covered.firstOrNull?.id;

    final pickup = cart.value?.pickup;
    final asksDays = method == Fulfilment.pickup || addressId != null;
    final daysAsync = asksDays
        ? ref.watch(
            checkoutDaysProvider((
              method: method,
              addressId: method == Fulfilment.delivery ? addressId : null,
            )),
          )
        : null;
    final days = daysAsync?.value ?? const <CheckoutDay>[];
    bool known(String? date) => days.any((d) => d.date == date);
    final saved = cart.value?.fulfilment?.date;
    final date =
        (known(_date) ? _date : null) ??
        (days.any((d) => d.date == saved && d.available) ? saved : null) ??
        days.where((d) => d.available).firstOrNull?.date;
    final day = days.where((d) => d.date == date).firstOrNull;

    final paused = pause?.isPaused ?? false;
    final ready =
        !loading &&
        !paused &&
        !_saving &&
        (day?.available ?? false) &&
        (method == Fulfilment.pickup ? pickup != null : addressId != null);

    Widget body;
    if (cart.hasError && !cart.hasValue) {
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
        children: _gap([
          if (paused) _PausedBanner(message: pause!.message(context.lang)),
          CheckoutSteps(step: 1, name: l10n.checkoutStepFulfilment),
          _MethodToggle(
            method: method,
            onChanged: (m) => setState(() => _method = m),
          ),
          if (loading)
            for (var i = 0; i < 4; i++) const JSkeletonRow()
          else if (method == Fulfilment.delivery)
            ..._delivery(addresses, covered, addressId)
          else ...[
            _TitleRow(title: l10n.checkoutPickupPlace),
            if (pickup != null) _PickupCard(pickup: pickup),
          ],
          if (!loading && daysAsync != null) ...[
            _TitleRow(
              title: method == Fulfilment.delivery ? l10n.checkoutDeliveryDay : l10n.checkoutPickupDay,
              action: days.isEmpty
                  ? null
                  : _LinkButton(
                      icon: JIcons.calendarBlank,
                      label: l10n.checkoutCalendar,
                      onTap: () async {
                        final picked = await showJBottomSheet<String>(
                          context,
                          title: method == Fulfilment.delivery
                              ? l10n.checkoutChooseDeliveryDay
                              : l10n.checkoutChoosePickupDay,
                          builder: (_) => _CalendarSheet(days: days, selected: date),
                        );
                        if (picked != null && mounted) setState(() => _date = picked);
                      },
                    ),
            ),
            ...switch (daysAsync) {
              AsyncValue(:final error?) when !daysAsync.isLoading => [
                _DaysError(error: error, onRetry: () => ref.invalidate(checkoutDaysProvider)),
              ],
              AsyncValue(hasValue: false) => [const _DaysSkeleton()],
              _ => [
                _DayStrip(days: days, selected: date, onTap: (d) => setState(() => _date = d)),
                if (day != null) day.available ? _WindowCard(day: day, method: method) : _ReasonCard(day: day),
                if ((day?.available ?? false) && !paused) _Legend(days: days),
              ],
            },
          ],
        ]),
      );
    }

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(title: l10n.checkoutTitle, cartLabel: l10n.cart, onBack: () => popOrHome(context)),
            // A save on its way freezes the choices it is saving.
            Expanded(
              child: AbsorbPointer(absorbing: _saving, child: body),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(
                JSpace.s16,
                0,
                JSpace.s16,
                JSpace.s16 + MediaQuery.viewPaddingOf(context).bottom,
              ),
              child: JButton(
                label: l10n.cartCheckout,
                expand: true,
                loading: _saving,
                onPressed: ready
                    ? () => _save(
                        FulfilmentChoice(
                          method: method,
                          date: date!,
                          addressId: method == Fulfilment.delivery ? addressId : null,
                        ),
                      )
                    : null,
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _delivery(AsyncValue<List<Address>> addresses, List<Address> covered, String? selected) {
    final l10n = AppLocalizations.of(context);
    Future<void> add() async {
      final before = {...?addresses.value?.map((a) => a.id)};
      await addAddress(context, ref);
      if (!mounted) return;
      // A new covered address is the one the customer wants to use.
      final added = (await ref.read(addressesProvider.future)).where((a) => a.covered && !before.contains(a.id));
      if (added.isNotEmpty && mounted) setState(() => _addressId = added.first.id);
    }

    if (addresses.hasError && !addresses.isLoading) {
      return [
        _ErrorCard(
          title: l10n.addrLoadError,
          body: l10n.addrLoadErrorBody,
          onRetry: () => ref.invalidate(addressesProvider),
        ),
      ];
    }
    if (covered.isEmpty) return [_NoCoveredAddress(onAdd: add)];
    return [
      _TitleRow(
        title: l10n.checkoutDeliveryAddress,
        action: _LinkButton(icon: JIcons.plus, label: l10n.addrAddShort, onTap: add),
      ),
      for (final a in addresses.value!)
        _AddressCard(
          address: a,
          selected: a.id == selected,
          onTap: a.covered ? () => setState(() => _addressId = a.id) : null,
        ),
    ];
  }
}

List<Widget> _gap(List<Widget> children) => [
  for (final (i, c) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s12), c],
];

/// «الخطوة 1 من 3: …» and the three bars (the checkout steps share it).
class CheckoutSteps extends StatelessWidget {
  const CheckoutSteps({required this.step, required this.name, super.key});

  static const total = 3;
  final int step;
  final String name;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(
        AppLocalizations.of(context).checkoutStep(step, total, name),
        style: JText.labelM.copyWith(color: JColors.ink2),
      ),
      const SizedBox(height: JSpace.s8),
      Row(
        children: [
          for (var i = 1; i <= total; i++) ...[
            if (i > 1) const SizedBox(width: JSpace.s8),
            Expanded(
              child: Container(
                height: 4,
                decoration: BoxDecoration(
                  color: i <= step ? JColors.ember : JColors.line,
                  borderRadius: BorderRadius.circular(JRadius.pill),
                ),
              ),
            ),
          ],
        ],
      ),
    ],
  );
}

class _MethodToggle extends StatelessWidget {
  const _MethodToggle({required this.method, required this.onChanged});

  final Fulfilment method;
  final ValueChanged<Fulfilment> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    Widget chip(Fulfilment m, String label) => Expanded(
      child: JChip(label: label, selected: method == m, onTap: () => onChanged(m)),
    );
    return Row(
      children: [
        chip(Fulfilment.delivery, l10n.checkoutDelivery),
        const SizedBox(width: JSpace.s8),
        chip(Fulfilment.pickup, l10n.checkoutPickup),
      ],
    );
  }
}

class _TitleRow extends StatelessWidget {
  const _TitleRow({required this.title, this.action});

  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 44,
    child: Row(
      children: [
        Expanded(child: Text(title, style: JText.h3)),
        ?action,
      ],
    ),
  );
}

/// «التقويم» / «إضافة عنوان»: ember label with its icon.
class _LinkButton extends StatelessWidget {
  const _LinkButton({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    child: GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: SizedBox(
        height: 44,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: JColors.ember),
            const SizedBox(width: JSpace.s4),
            Text(label, style: JText.labelM.copyWith(color: JColors.ember)),
          ],
        ),
      ),
    ),
  );
}

/// A covered address (selectable) or one outside coverage (shown, not selectable).
class _AddressCard extends StatelessWidget {
  const _AddressCard({required this.address, required this.selected, required this.onTap});

  final Address address;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final off = onTap == null;
    final title = [address.label, ?address.district].join(' · ');
    final line = [
      address.city,
      address.street,
    ].whereType<String>().where((s) => s.trim().isNotEmpty).join(context.lang == 'en' ? ', ' : '، ');
    return Semantics(
      button: !off,
      selected: selected,
      enabled: !off,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
          decoration: BoxDecoration(
            color: off ? JColors.sand : JColors.paper,
            borderRadius: BorderRadius.circular(JRadius.md),
            border: selected ? Border.all(color: JColors.ember, width: 2) : Border.all(color: JColors.line),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 24,
                child: off
                    ? const Icon(JIcons.prohibit, size: 24, color: JColors.ink2)
                    : selected
                    ? const Icon(JIcons.checkCircleFill, size: 24, color: JColors.ember)
                    : null,
              ),
              const SizedBox(width: JSpace.s12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: JText.labelM.copyWith(color: off ? JColors.ink2 : JColors.ink)),
                    if (line.isNotEmpty) ...[
                      const SizedBox(height: JSpace.s4),
                      Text(line, style: JText.bodyM.copyWith(color: JColors.ink2)),
                    ],
                    if (off) ...[
                      const SizedBox(height: JSpace.s4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: JSpace.s8, vertical: JSpace.s4),
                        decoration: BoxDecoration(
                          color: JColors.dangerBg,
                          borderRadius: BorderRadius.circular(JRadius.pill),
                        ),
                        child: Text(l10n.checkoutOutOfCoverage, style: JText.labelM.copyWith(color: JColors.danger)),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Figma 118-10199.
class _NoCoveredAddress extends StatelessWidget {
  const _NoCoveredAddress({required this.onAdd});

  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.all(JSpace.s24),
      child: Column(
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(color: JColors.sand, shape: BoxShape.circle),
            child: const Icon(JIcons.mapPin, size: 40, color: JColors.ink2),
          ),
          const SizedBox(height: JSpace.s12),
          Text(l10n.checkoutNoCoveredTitle, style: JText.h2, textAlign: TextAlign.center),
          const SizedBox(height: JSpace.s12),
          Text(
            l10n.checkoutNoCoveredBody,
            style: JText.bodyM.copyWith(color: JColors.ink2),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: JSpace.s12),
          JButton(label: l10n.addrAddShort, variant: JButtonVariant.secondary, onPressed: onAdd),
        ],
      ),
    );
  }
}

/// Store, address, pickup hours and its point on the map. Directions and calling the store need a URL
/// launcher, which the app does not have yet (not-built-yet.md, signoff.md).
class _PickupCard extends ConsumerWidget {
  const _PickupCard({required this.pickup});

  final PickupInfo pickup;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final instructions = pickup.instructions?.of(lang);
    return Container(
      padding: const EdgeInsets.all(JSpace.s16),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: Border.all(color: JColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(JIcons.storefront, size: 24, color: JColors.ember),
              const SizedBox(width: JSpace.s12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(pickup.name.of(lang), style: JText.labelM),
                    const SizedBox(height: JSpace.s4),
                    Text(pickup.address.of(lang), style: JText.bodyM.copyWith(color: JColors.ink2)),
                    const SizedBox(height: JSpace.s4),
                    Row(
                      children: [
                        const Icon(JIcons.clock, size: 16, color: JColors.ink2),
                        const SizedBox(width: JSpace.s8),
                        Expanded(
                          child: Text(
                            l10n.checkoutPickupHours(
                              clockText(l10n, pickup.opensAt, short: true),
                              clockText(l10n, pickup.closesAt, short: true),
                            ),
                            style: JText.bodyM.copyWith(color: JColors.ink2),
                          ),
                        ),
                      ],
                    ),
                    if (instructions != null && instructions.isNotEmpty) ...[
                      const SizedBox(height: JSpace.s4),
                      Text(instructions, style: JText.bodyM.copyWith(color: JColors.ink2)),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: JSpace.s12),
          // The store's point, not draggable.
          IgnorePointer(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(JRadius.md),
              child: SizedBox(
                height: 56,
                child: MapPicker(
                  initial: pickup.point,
                  onIdle: (_) {},
                  pin: const Icon(JIcons.mapPinFill, size: 28, color: JColors.ink2),
                  useGoogle: ref.watch(envProvider).hasMapsKey,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// «4» or «6 مساءً» (or «9 ص» when [short]) from a Riyadh `HH:mm`, shown as is.
@visibleForTesting
String clockText(AppLocalizations l10n, String hhmm, {bool period = true, bool short = false}) {
  final [h, m] = [for (final p in hhmm.split(':')) int.parse(p)];
  final hour = h % 12 == 0 ? 12 : h % 12;
  final time = m == 0 ? '$hour' : '$hour:${m.toString().padLeft(2, '0')}';
  if (!period) return time;
  final pm = h % 24 >= 12;
  return '$time ${switch ((pm, short)) {
    (true, true) => l10n.clockPmShort,
    (true, false) => l10n.clockPm,
    (false, true) => l10n.clockAmShort,
    (false, false) => l10n.clockAm,
  }}';
}

/// «الأربعاء 11 نوفمبر».
String _dayText(BuildContext context, DateTime d) {
  final lang = context.lang;
  return '${DateFormat('EEEE', lang).format(d)} ${d.day} ${DateFormat('MMMM', lang).format(d)}';
}

class _PausedBanner extends StatelessWidget {
  const _PausedBanner({required this.message});

  /// The admin's message.
  final String message;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
    decoration: BoxDecoration(
      color: JColors.warningBg,
      borderRadius: BorderRadius.circular(JRadius.md),
      border: Border.all(color: JColors.warning),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(JIcons.pauseCircleFill, size: 24, color: JColors.warning),
        const SizedBox(width: JSpace.s12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppLocalizations.of(context).checkoutPausedTitle,
                style: JText.labelM.copyWith(color: JColors.warning),
              ),
              if (message.isNotEmpty) ...[
                const SizedBox(height: JSpace.s4),
                Text(message, style: JText.bodyM.copyWith(color: JColors.ink2)),
              ],
            ],
          ),
        ),
      ],
    ),
  );
}

/// Icon and text of a day's reason; unknown future codes read «غير متاح».
(IconData, String) _reason(AppLocalizations l10n, String? reason) => switch (reason) {
  DayReason.closed => (JIcons.lockSimple, l10n.checkoutDayClosed),
  DayReason.full => (JIcons.usersThree, l10n.checkoutDayFull),
  DayReason.pastCutoff => (JIcons.clockCountdown, l10n.checkoutDayPastCutoff),
  DayReason.vendorClosed => (JIcons.storefront, l10n.checkoutDayVendorClosed),
  DayReason.outsideHorizon => (JIcons.calendarX, l10n.checkoutDayOutsideHorizon),
  _ => (JIcons.prohibit, l10n.checkoutDayUnavailable),
};

/// The days in a row. Disabled days stay tappable: the card below then explains why.
class _DayStrip extends StatelessWidget {
  const _DayStrip({required this.days, required this.selected, required this.onTap});

  final List<CheckoutDay> days;
  final String? selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 76,
    child: ListView.separated(
      scrollDirection: Axis.horizontal,
      itemCount: days.length,
      separatorBuilder: (_, _) => const SizedBox(width: JSpace.s8),
      itemBuilder: (context, i) => _DayCell(
        day: days[i],
        selected: days[i].date == selected,
        onTap: () => onTap(days[i].date),
      ),
    ),
  );
}

/// A day of the strip (64×76, weekday and number) or of the calendar ([compact]: 44×44, number only).
class _DayCell extends StatelessWidget {
  const _DayCell({required this.day, required this.selected, required this.onTap, this.compact = false});

  final CheckoutDay day;
  final bool selected;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final d = day.day;
    final chosen = selected && day.available;
    final fg = chosen ? JColors.paper : (day.available ? JColors.ink : JColors.ink2);
    final (reasonIcon, reasonText) = _reason(l10n, day.reason);
    final icon = chosen ? JIcons.check : (day.available ? null : reasonIcon);
    final cell = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        width: compact ? 44 : 64,
        height: compact ? 44 : 76,
        decoration: BoxDecoration(
          color: chosen ? JColors.ember : (day.available ? JColors.paper : JColors.sand),
          borderRadius: BorderRadius.circular(JRadius.md),
          border: selected && !day.available
              ? Border.all(color: JColors.ember, width: 2)
              : day.available && !chosen
              ? Border.all(color: JColors.line)
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!compact)
              Text(
                DateFormat(context.lang == 'en' ? 'EEE' : 'EEEE', context.lang).format(d),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: JText.caption.copyWith(color: fg),
              ),
            Text('${d.day}', style: (compact ? JText.labelM : JText.h3).copyWith(color: fg)),
            if (icon != null) Icon(icon, size: compact ? 14 : 16, color: fg),
          ],
        ),
      ),
    );
    return Semantics(
      button: true,
      selected: chosen,
      label: [_dayText(context, d), if (!day.available) reasonText].join(context.lang == 'en' ? ', ' : '، '),
      excludeSemantics: true,
      child: day.available ? cell : Tooltip(message: reasonText, child: cell),
    );
  }
}

class _WindowCard extends StatelessWidget {
  const _WindowCard({required this.day, required this.method});

  final CheckoutDay day;
  final Fulfilment method;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final w = day.window;
    bool pm(String t) => int.parse(t.split(':').first) >= 12;
    final start = clockText(l10n, w.start, period: pm(w.start) != pm(w.end));
    final end = clockText(l10n, w.end);
    return _InfoCard(
      icon: JIcons.clock,
      iconColor: JColors.ember,
      title: method == Fulfilment.delivery
          ? l10n.checkoutDeliveryWindow(start, end)
          : l10n.checkoutPickupWindow(start, end),
      titleStyle: JText.bodyL,
      body: l10n.checkoutRiyadhTime(_dayText(context, day.day)),
    );
  }
}

/// Figma 118-10342 / 118-10426 / 118-10510: why the tapped day cannot be chosen.
class _ReasonCard extends StatelessWidget {
  const _ReasonCard({required this.day});

  final CheckoutDay day;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final (icon, text) = _reason(l10n, day.reason);
    return _InfoCard(
      icon: icon,
      iconColor: JColors.warning,
      title: text,
      titleStyle: JText.labelM.copyWith(color: JColors.warning),
      body: l10n.checkoutPickAnother(_dayText(context, day.day)),
      background: JColors.warningBg,
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.titleStyle,
    required this.body,
    this.background,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final TextStyle titleStyle;
  final String body;

  /// Null: the paper card with its line.
  final Color? background;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
    decoration: BoxDecoration(
      color: background ?? JColors.paper,
      borderRadius: BorderRadius.circular(JRadius.md),
      border: background == null ? Border.all(color: JColors.line) : null,
    ),
    child: Row(
      children: [
        Icon(icon, size: 24, color: iconColor),
        const SizedBox(width: JSpace.s12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: titleStyle),
              const SizedBox(height: 2),
              Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
            ],
          ),
        ),
      ],
    ),
  );
}

/// «دليل الأيام»: one line per reason among the days.
class _Legend extends StatelessWidget {
  const _Legend({required this.days});

  final List<CheckoutDay> days;

  static const List<String> _order = [
    DayReason.closed,
    DayReason.full,
    DayReason.pastCutoff,
    DayReason.vendorClosed,
    DayReason.outsideHorizon,
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final reasons = {for (final d in days) ?d.reason};
    final shown = [..._order.where(reasons.contains), ...reasons.where((r) => !_order.contains(r))];
    if (shown.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.checkoutDaysLegend, style: JText.labelM),
        for (final r in shown)
          if (_reason(l10n, r) case (final icon, final text))
            Padding(
              padding: const EdgeInsets.only(top: JSpace.s8),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.sm)),
                    child: Icon(icon, size: 16, color: JColors.ink2),
                  ),
                  const SizedBox(width: JSpace.s12),
                  Expanded(
                    child: Text(text, style: JText.bodyM.copyWith(color: JColors.ink2)),
                  ),
                ],
              ),
            ),
      ],
    );
  }
}

/// Figma 118-10251, also used when the address book does not load.
class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.title, required this.body, required this.onRetry});

  final String title;
  final String body;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(JSpace.s16),
    decoration: BoxDecoration(
      color: JColors.dangerBg,
      borderRadius: BorderRadius.circular(JRadius.md),
      border: Border.all(color: JColors.danger),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(JIcons.warningCircle, size: 24, color: JColors.danger),
            const SizedBox(width: JSpace.s12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: JText.labelM.copyWith(color: JColors.danger)),
                  const SizedBox(height: JSpace.s4),
                  Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: JSpace.s12),
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: JButton(
            label: AppLocalizations.of(context).retry,
            size: JButtonSize.s,
            variant: JButtonVariant.secondary,
            onPressed: onRetry,
          ),
        ),
      ],
    ),
  );
}

/// The days did not load. A refusal from the server (e.g. an item that cannot be picked up) says why.
class _DaysError extends StatelessWidget {
  const _DaysError({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final code = ApiError.from(error).code;
    final generic = code == ApiError.network || code == ApiError.unknown;
    return _ErrorCard(
      title: l10n.checkoutDaysErrorTitle,
      body: generic ? l10n.checkoutDaysErrorBody : errorText(context, error),
      onRetry: onRetry,
    );
  }
}

class _DaysSkeleton extends StatelessWidget {
  const _DaysSkeleton();

  @override
  Widget build(BuildContext context) => SizedBox(
    height: 76,
    child: Row(
      children: [
        for (var i = 0; i < 5; i++) ...[
          if (i > 0) const SizedBox(width: JSpace.s8),
          Container(
            width: 64,
            decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.md)),
          ),
        ],
      ],
    ),
  );
}

/// Figma 118-9829: the month grid (weeks start on Saturday) with the same day states and the key.
class _CalendarSheet extends StatefulWidget {
  const _CalendarSheet({required this.days, required this.selected});

  final List<CheckoutDay> days;
  final String? selected;

  @override
  State<_CalendarSheet> createState() => _CalendarSheetState();
}

class _CalendarSheetState extends State<_CalendarSheet> {
  late String? _selected = widget.selected;
  late final List<DateTime> _months = {
    for (final d in widget.days) DateTime.utc(d.day.year, d.day.month),
  }.toList();
  late int _month = () {
    final i = _months.indexWhere(
      (m) => widget.days.any((d) => d.date == _selected && d.day.year == m.year && d.day.month == m.month),
    );
    return i < 0 ? 0 : i;
  }();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final month = _months[_month];
    final byDay = {
      for (final d in widget.days)
        if (d.day.year == month.year && d.day.month == month.month) d.day.day: d,
    };
    final length = DateTime.utc(month.year, month.month + 1, 0).day;
    final lead = (month.weekday + 1) % 7; // Saturday first
    final cells = [...List<int?>.filled(lead, null), for (var i = 1; i <= length; i++) i];
    final rtl = Directionality.of(context) == TextDirection.rtl;
    // Saturday 2026-11-07 … Friday 2026-11-13: only the names are read.
    final weekdays = [for (var i = 0; i < 7; i++) DateTime.utc(2026, 11, 7 + i)];

    Widget nav(int step, IconData icon, String label) {
      final to = _month + step;
      final enabled = to >= 0 && to < _months.length;
      return Semantics(
        button: true,
        enabled: enabled,
        label: label,
        child: GestureDetector(
          onTap: enabled ? () => setState(() => _month = to) : null,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: JColors.paper,
              shape: BoxShape.circle,
              border: Border.all(color: JColors.line),
            ),
            child: Icon(icon, size: 20, color: enabled ? JColors.ink : JColors.mutedSoft),
          ),
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            nav(-1, rtl ? JIcons.caretRight : JIcons.caretLeft, l10n.checkoutPreviousMonth),
            Expanded(
              child: Text(
                '${DateFormat('MMMM', lang).format(month)} ${month.year}',
                textAlign: TextAlign.center,
                style: JText.h3,
              ),
            ),
            nav(1, rtl ? JIcons.caretLeft : JIcons.caretRight, l10n.checkoutNextMonth),
          ],
        ),
        const SizedBox(height: JSpace.s16),
        Center(
          child: SizedBox(
            width: 7 * 44 + 6 * 4,
            child: Column(
              children: [
                Row(
                  children: [
                    for (final (i, w) in weekdays.indexed) ...[
                      if (i > 0) const SizedBox(width: JSpace.s4),
                      SizedBox(
                        width: 44,
                        child: Text(
                          DateFormat(lang == 'en' ? 'EEE' : 'EEEE', lang).format(w),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          style: JText.caption.copyWith(color: JColors.ink2),
                        ),
                      ),
                    ],
                  ],
                ),
                for (var week = 0; week * 7 < cells.length; week++) ...[
                  const SizedBox(height: JSpace.s4),
                  Row(
                    children: [
                      for (var i = week * 7; i < week * 7 + 7; i++) ...[
                        if (i > week * 7) const SizedBox(width: JSpace.s4),
                        if (i < cells.length && byDay[cells[i]] != null)
                          _DayCell(
                            day: byDay[cells[i]]!,
                            selected: byDay[cells[i]]!.date == _selected,
                            compact: true,
                            onTap: () => setState(() => _selected = byDay[cells[i]]!.date),
                          )
                        else
                          SizedBox(
                            width: 44,
                            height: 44,
                            child: i < cells.length && cells[i] != null
                                ? Center(
                                    child: Text(
                                      '${cells[i]}',
                                      style: JText.labelM.copyWith(color: JColors.ink2),
                                    ),
                                  )
                                : null,
                          ),
                      ],
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: JSpace.s16),
        _Legend(days: widget.days),
        const SizedBox(height: JSpace.s16),
        JButton(
          label: l10n.checkoutConfirmDay,
          expand: true,
          onPressed: _selected == null ? null : () => Navigator.of(context).pop(_selected),
        ),
      ],
    );
  }
}
