import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Debug-only gallery: every design-system widget in every variant and state, in Arabic or English.
class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});

  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  String? _lang;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Starts in the app's language.
    _lang ??= Localizations.localeOf(context).languageCode == 'en' ? 'en' : 'ar';
  }

  @override
  Widget build(BuildContext context) {
    final lang = _lang!;
    return Localizations.override(
      context: context,
      locale: Locale(lang),
      child: Directionality(
        textDirection: lang == 'ar' ? TextDirection.rtl : TextDirection.ltr,
        // Keyed so the sample controllers are rebuilt with the new language.
        child: _GalleryBody(
          key: ValueKey(lang),
          lang: lang,
          onLang: (lang) => setState(() => _lang = lang),
        ),
      ),
    );
  }
}

class _GalleryBody extends StatefulWidget {
  const _GalleryBody({required this.lang, required this.onLang, super.key});

  final String lang;
  final ValueChanged<String> onLang;

  @override
  State<_GalleryBody> createState() => _GalleryBodyState();
}

class _GalleryBodyState extends State<_GalleryBody> {
  final _name = TextEditingController();
  final _phone = TextEditingController(text: JSaudiPhoneFormatter.format('551234567'));
  final _phoneShort = TextEditingController(text: JSaudiPhoneFormatter.format('55123'));
  final _otp4 = TextEditingController(text: '4816');
  final _otp6 = TextEditingController(text: '481632');
  final _search = TextEditingController();
  bool _initialised = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialised) return;
    _initialised = true;
    final l = AppLocalizations.of(context);
    _name.text = l.galleryNameValue;
    _search.text = l.galleryProduct;
  }

  @override
  void dispose() {
    for (final c in [_name, _phone, _phoneShort, _otp4, _otp6, _search]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            JAppHeader.page(
              title: l.galleryTitle,
              cartLabel: l.galleryCart,
              onBack: Navigator.of(context).canPop() ? () => Navigator.of(context).pop() : null,
            ),
            Padding(
              padding: const EdgeInsetsDirectional.only(start: JSpace.s16, end: JSpace.s16, bottom: JSpace.s8),
              child: Row(
                children: [
                  JChip(label: l.galleryLangAr, selected: widget.lang == 'ar', onTap: () => widget.onLang('ar')),
                  const SizedBox(width: JSpace.s8),
                  JChip(label: l.galleryLangEn, selected: widget.lang == 'en', onTap: () => widget.onLang('en')),
                ],
              ),
            ),
            Expanded(
              // Not lazy on purpose: everything builds, so the smoke test catches every widget.
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(JSpace.s16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(l.galleryInteractiveNote, style: JText.bodyM.copyWith(color: JColors.muted)),
                    ..._buttons(l),
                    ..._inputs(l),
                    ..._phoneFields(l),
                    ..._otpFields(l),
                    ..._chips(l),
                    ..._choices(l),
                    ..._badges(l),
                    ..._cards(l),
                    ..._productCards(l),
                    ..._headers(l),
                    ..._tabBars(l),
                    ..._searchBars(l),
                    ..._mapPins(l),
                    ..._timelines(l),
                    ..._states(l),
                    ..._skeletons(l),
                    ..._overlays(l),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _section(String title, List<Widget> children) => [
    const SizedBox(height: JSpace.s32),
    Text(title, style: JText.h2),
    const SizedBox(height: JSpace.s16),
    for (final (i, c) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s16), c],
  ];

  /// A technical caption (enum names), the same in both languages.
  Widget _caption(String text) => Text(text, style: JText.caption.copyWith(color: JColors.muted));

  Widget _wrap(List<Widget> children) => Wrap(spacing: JSpace.s12, runSpacing: JSpace.s12, children: children);

  void _noop() {}

  List<Widget> _buttons(AppLocalizations l) => _section(l.galleryButtons, [
    for (final v in JButtonVariant.values)
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _caption('${v.name} · default / disabled / loading'),
          const SizedBox(height: JSpace.s8),
          _wrap([
            for (final s in JButtonSize.values) ...[
              JButton(label: l.galleryOrderNow, onPressed: _noop, variant: v, size: s),
              JButton(label: l.galleryOrderNow, onPressed: null, variant: v, size: s),
              JButton(label: l.galleryOrderNow, onPressed: _noop, variant: v, size: s, loading: true),
            ],
          ]),
        ],
      ),
    _caption('expand'),
    JButton(label: l.galleryOrderNow, onPressed: _noop, expand: true),
  ]);

  List<Widget> _inputs(AppLocalizations l) => _section(l.galleryInputs, [
    JTextField(label: l.galleryFullName, placeholder: l.galleryTypeHere, helperText: l.galleryHelper),
    JTextField(
      label: l.galleryFullName,
      placeholder: l.galleryTypeHere,
      helperText: l.galleryHelper,
      controller: _name,
    ),
    JTextField(
      label: l.galleryFullName,
      placeholder: l.galleryTypeHere,
      errorText: l.galleryRequired,
      controller: _name,
    ),
    JTextField(label: l.galleryFullName, placeholder: l.galleryTypeHere, helperText: l.galleryHelper, enabled: false),
    JTextField(label: l.galleryFullName, placeholder: l.galleryTypeHere, maxLines: 3),
  ]);

  List<Widget> _phoneFields(AppLocalizations l) => _section(l.galleryPhone, [
    JPhoneField(label: l.galleryPhoneLabel, helperText: l.galleryPhoneHint),
    JPhoneField(label: l.galleryPhoneLabel, helperText: l.galleryPhoneHint, controller: _phone),
    JPhoneField(label: l.galleryPhoneLabel, errorText: l.galleryPhoneError, controller: _phoneShort),
    JPhoneField(label: l.galleryPhoneLabel, helperText: l.galleryPhoneHint, enabled: false),
  ]);

  List<Widget> _otpFields(AppLocalizations l) => _section(l.galleryOtp, [
    for (final (n, filled) in [(4, _otp4), (6, _otp6)]) ...[
      _caption('length $n · default / filled / error'),
      JOtpField(length: n),
      JOtpField(length: n, controller: filled),
      JOtpField(length: n, controller: filled, errorText: l.galleryOtpError),
    ],
  ]);

  List<Widget> _chips(AppLocalizations l) => _section(l.galleryChips, [
    _wrap([
      JChip(label: l.galleryChipLabel, onTap: _noop),
      JChip(label: l.galleryChipLabel, onTap: _noop, selected: true),
      JChip(label: l.galleryChipLabel, onTap: null),
    ]),
  ]);

  List<Widget> _choices(AppLocalizations l) => _section(l.galleryChoices, [
    _wrap([
      for (final checked in [true, false]) ...[
        JCheckbox(checked: checked, onChanged: (_) {}, label: l.galleryGiftWrap),
        JCheckbox(checked: checked, onChanged: null, label: l.galleryGiftWrap),
      ],
    ]),
    _wrap([
      for (final checked in [true, false]) ...[
        JRadio(checked: checked, onTap: _noop, label: l.galleryGiftWrap),
        JRadio(checked: checked, onTap: null, label: l.galleryGiftWrap),
      ],
    ]),
    _wrap([
      for (final checked in [true, false]) ...[
        JSwitch(checked: checked, onChanged: (_) {}, label: l.galleryGiftWrap),
        JSwitch(checked: checked, onChanged: null, label: l.galleryGiftWrap),
      ],
    ]),
  ]);

  List<Widget> _badges(AppLocalizations l) {
    final labels = {
      JBadgeType.neutral: l.galleryBadgeNew,
      JBadgeType.info: l.galleryBadgeReview,
      JBadgeType.warning: l.galleryBadgePreparing,
      JBadgeType.success: l.galleryBadgeDelivered,
      JBadgeType.danger: l.galleryBadgeCancelled,
      JBadgeType.brand: l.galleryBadgeToday,
    };
    return _section(l.galleryBadges, [
      for (final size in JBadgeSize.values)
        _wrap([for (final t in JBadgeType.values) JBadge(label: labels[t]!, type: t, size: size)]),
    ]);
  }

  List<Widget> _cards(AppLocalizations l) {
    Widget content() => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l.galleryCardTitle, style: JText.h3),
        const SizedBox(height: JSpace.s8),
        Text(l.galleryCardBody, style: JText.bodyM.copyWith(color: JColors.ink2)),
      ],
    );
    return _section(l.galleryCards, [
      JCard(child: content()),
      JCard(selected: true, child: content()),
    ]);
  }

  List<Widget> _productCards(AppLocalizations l) {
    Widget card({required bool available}) => SizedBox(
      width: 165,
      child: JProductCard(
        image: const ColoredBox(color: JColors.sand),
        vendor: l.galleryVendor,
        title: l.galleryProduct,
        subtitle: l.galleryProductMeta,
        badge: available
            ? JBadge(label: l.galleryBadgeToday, type: JBadgeType.brand, size: JBadgeSize.s)
            : JBadge(label: l.galleryBadgePreparing, type: JBadgeType.warning, size: JBadgeSize.s),
        price: '89.00',
        currency: l.galleryCurrency,
        addLabel: l.galleryAdd,
        available: available,
        onAdd: _noop,
      ),
    );
    return _section(l.galleryProductCards, [
      _wrap([card(available: true), card(available: false)]),
    ]);
  }

  List<Widget> _headers(AppLocalizations l) => _section(l.galleryHeaders, [
    for (final count in [0, 3])
      JAppHeader.home(
        title: l.appName,
        location: l.galleryLocation,
        notificationsLabel: l.galleryNotifications,
        cartLabel: l.galleryCart,
        onNotifications: _noop,
        onCart: _noop,
        onLocationTap: _noop,
        cartCount: count,
      ),
    for (final count in [0, 3])
      JAppHeader.page(
        title: l.galleryPageTitle,
        cartLabel: l.galleryCart,
        onBack: _noop,
        onCart: _noop,
        cartCount: count,
      ),
  ]);

  List<Widget> _tabBars(AppLocalizations l) {
    final items = [
      JBottomTabItem(icon: JIcons.house, activeIcon: JIcons.houseFill, label: l.galleryTabHome),
      JBottomTabItem(
        icon: JIcons.squaresFour,
        activeIcon: JIcons.squaresFourFill,
        label: l.galleryTabServices,
      ),
      JBottomTabItem(icon: JIcons.receipt, activeIcon: JIcons.receiptFill, label: l.galleryTabOrders),
      JBottomTabItem(icon: JIcons.user, activeIcon: JIcons.userFill, label: l.galleryTabAccount),
    ];
    return _section(l.galleryTabBar, [
      for (var i = 0; i < items.length; i++) JBottomTabBar(items: items, activeIndex: i, onTap: (_) {}),
    ]);
  }

  List<Widget> _searchBars(AppLocalizations l) => _section(l.gallerySearch, [
    JSearchBar(placeholder: l.gallerySearchHint, filterLabel: l.galleryFilter, clearLabel: l.galleryClear),
    JSearchBar(
      placeholder: l.gallerySearchHint,
      filterLabel: l.galleryFilter,
      clearLabel: l.galleryClear,
      controller: _search,
    ),
  ]);

  List<Widget> _mapPins(AppLocalizations l) => _section(l.galleryMapPins, [
    Wrap(
      spacing: JSpace.s24,
      runSpacing: JSpace.s12,
      crossAxisAlignment: WrapCrossAlignment.end,
      children: [
        const JMapPin(type: JMapPinType.address),
        JMapPin(type: JMapPinType.address, selected: true, label: l.galleryPinAddress),
        const JMapPin(type: JMapPinType.store),
        JMapPin(type: JMapPinType.store, selected: true, label: l.galleryVendor),
        const JMapPin(type: JMapPinType.courier),
        JMapPin(type: JMapPinType.courier, selected: true, label: l.galleryPinCourier),
      ],
    ),
  ]);

  List<Widget> _timelines(AppLocalizations l) {
    final steps = [
      JTimelineStep(title: l.galleryStepReceived, time: l.galleryTime1),
      JTimelineStep(title: l.galleryStepPreparing, time: l.galleryTime2),
      JTimelineStep(title: l.galleryStepSlaughtered, time: l.galleryTime3),
      JTimelineStep(title: l.galleryStepOnTheWay, time: l.galleryTime4),
      JTimelineStep(title: l.galleryStepDelivered, time: l.galleryTime5),
    ];
    return _section(l.galleryTimeline, [
      for (var stage = 1; stage <= steps.length; stage++) JStatusTimeline(steps: steps, stage: stage),
    ]);
  }

  List<Widget> _states(AppLocalizations l) => _section(l.galleryStates, [
    JEmptyState(
      kind: JEmptyStateKind.cart,
      title: l.galleryCartTitle,
      body: l.galleryCartBody,
      actionLabel: l.galleryCartAction,
      onAction: _noop,
    ),
    JEmptyState(
      kind: JEmptyStateKind.orders,
      title: l.galleryOrdersTitle,
      body: l.galleryOrdersBody,
      actionLabel: l.galleryOrdersAction,
      onAction: _noop,
    ),
    JEmptyState(
      kind: JEmptyStateKind.search,
      title: l.gallerySearchTitle,
      body: l.gallerySearchBody,
      actionLabel: l.gallerySearchAction,
      onAction: _noop,
    ),
    JEmptyState(
      kind: JEmptyStateKind.error,
      title: l.galleryErrorTitle,
      body: l.galleryErrorBody,
      actionLabel: l.retry,
      onAction: _noop,
    ),
    JEmptyState(
      kind: JEmptyStateKind.offline,
      title: l.galleryOfflineTitle,
      body: l.galleryOfflineBody,
      actionLabel: l.retry,
      onAction: _noop,
    ),
    JEmptyState(
      kind: JEmptyStateKind.denied,
      title: l.galleryDeniedTitle,
      body: l.galleryDeniedBody,
      actionLabel: l.galleryBack,
      onAction: _noop,
    ),
  ]);

  List<Widget> _skeletons(AppLocalizations l) => _section(l.gallerySkeleton, const [JSkeletonRow(), JSkeletonRow()]);

  Widget _sheetContent(AppLocalizations l) => Container(
    height: 120,
    alignment: Alignment.center,
    decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.md)),
    child: Text(l.gallerySheetContent, style: JText.bodyM.copyWith(color: JColors.ink2)),
  );

  List<Widget> _overlays(AppLocalizations l) {
    final toasts = {
      JToastKind.success: l.galleryToastSuccess,
      JToastKind.error: l.galleryToastError,
      JToastKind.warning: l.galleryToastWarning,
      JToastKind.info: l.galleryToastInfo,
    };
    return _section(l.galleryOverlays, [
      Center(
        child: JDialog(
          title: l.galleryDialogTitle,
          body: l.galleryDialogBody,
          confirmLabel: l.galleryConfirm,
          cancelLabel: l.galleryCancel,
          onConfirm: _noop,
          onCancel: _noop,
        ),
      ),
      Center(
        child: JDialog(
          type: JDialogType.destructive,
          title: l.galleryDeleteTitle,
          body: l.galleryDeleteBody,
          confirmLabel: l.galleryDelete,
          cancelLabel: l.galleryCancel,
          onConfirm: _noop,
          onCancel: _noop,
        ),
      ),
      JBottomSheet(
        title: l.gallerySheetTitle,
        action: JButton(label: l.galleryOrderNow, onPressed: _noop, expand: true),
        child: _sheetContent(l),
      ),
      for (final e in toasts.entries) JToast(message: e.value, kind: e.key),
      _wrap([
        JButton(
          label: l.galleryShowSheet,
          size: JButtonSize.s,
          variant: JButtonVariant.secondary,
          onPressed: () => showJBottomSheet<void>(
            context,
            title: l.gallerySheetTitle,
            builder: _sheetContentBuilder(l),
            action: Builder(
              builder: (context) =>
                  JButton(label: l.galleryOrderNow, expand: true, onPressed: () => Navigator.of(context).pop()),
            ),
          ),
        ),
        JButton(
          label: l.galleryShowDialog,
          size: JButtonSize.s,
          variant: JButtonVariant.secondary,
          onPressed: () => showJDialog(
            context,
            title: l.galleryDialogTitle,
            body: l.galleryDialogBody,
            confirmLabel: l.galleryConfirm,
            cancelLabel: l.galleryCancel,
          ),
        ),
        JButton(
          label: l.galleryShowDestructive,
          size: JButtonSize.s,
          variant: JButtonVariant.secondary,
          onPressed: () => showJDialog(
            context,
            type: JDialogType.destructive,
            title: l.galleryDeleteTitle,
            body: l.galleryDeleteBody,
            confirmLabel: l.galleryDelete,
            cancelLabel: l.galleryCancel,
          ),
        ),
        for (final e in toasts.entries)
          JButton(
            label: '${l.galleryShowToast} · ${e.key.name}',
            size: JButtonSize.s,
            variant: JButtonVariant.ghost,
            onPressed: () => showJToast(context, message: e.value, kind: e.key),
          ),
      ]),
    ]);
  }

  WidgetBuilder _sheetContentBuilder(AppLocalizations l) =>
      (_) => _sheetContent(l);
}
