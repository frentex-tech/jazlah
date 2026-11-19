import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// What the picker returns: the point under the pin, its readable address and its coverage.
class PickedPlace {
  const PickedPlace({required this.point, required this.address, required this.coverage});

  final GeoPoint point;
  final PlaceAddress address;
  final Coverage coverage;
}

enum _Sheet { none, ask, denied, locating, failed }

enum _Phase { moving, resolving, ready, outOfCoverage, checkFailed }

/// Add address on the map (Figma 86-3340 default, 86-3383 searching, 86-3439 outside coverage,
/// 86-3490 loading, 86-3535 error) with the location permission sheet over it (86-3583 ask,
/// 86-3642 denied, 86-3701 locating, 86-3762 error).
/// Outside coverage the confirm stays disabled (Figma) unless [allowOutOfCoverage] (saving an address).
class MapPickerScreen extends ConsumerStatefulWidget {
  const MapPickerScreen({this.initial, this.allowOutOfCoverage = false, super.key});

  final GeoPoint? initial;
  final bool allowOutOfCoverage;

  @override
  ConsumerState<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends ConsumerState<MapPickerScreen> with WidgetsBindingObserver {
  final _map = MapPickerController();
  final _search = TextEditingController();
  final _searchFocus = FocusNode();
  late GeoPoint _point;
  PlaceAddress? _address;
  late Coverage _coverage;
  _Phase _phase = _Phase.resolving;
  _Sheet _sheet = _Sheet.none;
  List<PlaceSuggestion> _results = const [];
  int _request = 0;
  int _searchId = 0;

  Timer? _debounce;

  String get _lang => Localizations.localeOf(context).languageCode;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _point = widget.initial ?? ref.read(selectedLocationProvider)?.point ?? GeoPoint.riyadh;
    _searchFocus.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      unawaited(_resolve(_point));
      if (widget.initial == null) unawaited(_bootstrap());
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _debounce?.cancel();
    _search.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  /// Back from the OS settings: the user may have granted the permission or turned services on.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && (_sheet == _Sheet.denied || _sheet == _Sheet.failed)) {
      unawaited(_bootstrap());
    }
  }

  /// Explain before the OS prompt; never a dead end when it is refused.
  Future<void> _bootstrap() async {
    final access = await ref.read(deviceLocationProvider).access();
    if (!mounted) return;
    switch (access) {
      case LocationAccess.granted:
        await _locate();
      case LocationAccess.notAsked:
        setState(() => _sheet = _Sheet.ask);
      case LocationAccess.denied || LocationAccess.deniedForever:
        setState(() => _sheet = _Sheet.denied);
      case LocationAccess.serviceOff:
        setState(() => _sheet = _Sheet.failed);
    }
  }

  Future<void> _allow() async {
    setState(() => _sheet = _Sheet.locating);
    final access = await ref.read(deviceLocationProvider).request();
    if (!mounted) return;
    access == LocationAccess.granted ? await _locate() : setState(() => _sheet = _Sheet.denied);
  }

  Future<void> _locate() async {
    setState(() => _sheet = _Sheet.locating);
    final GeoPoint here;
    try {
      here = await ref.read(deviceLocationProvider).current();
    } on Object {
      if (mounted) setState(() => _sheet = _Sheet.failed);
      return;
    }
    if (!mounted) return;
    setState(() => _sheet = _Sheet.none);
    _map.moveTo(here);
    try {
      final coverage = await ref.read(coverageRepositoryProvider).check(here);
      if (!mounted || coverage.covered) return;
      final choice = await context.push<OutOfCoverageChoice>(Routes.outOfCoverage, extra: here);
      if (choice == OutOfCoverageChoice.pickup && mounted) await _pickup(here, coverage);
    } on Object {
      // The map shows the point; its panel reports a failed check or geocode on its own.
    }
  }

  /// No geocode result or a failed geocode is not a dead end: the customer types the address.
  Future<PlaceAddress> _reverse(GeoPoint p) =>
      ref.read(geocoderProvider).reverse(p, _lang).then((a) => a, onError: (Object _) => const PlaceAddress());

  /// Out of coverage: keep the point for browsing and pickup.
  Future<void> _pickup(GeoPoint point, Coverage coverage) async {
    final address = await _reverse(point);
    if (mounted) context.pop(PickedPlace(point: point, address: address, coverage: coverage));
  }

  /// Coverage decides; only a failed coverage check offers "retry".
  Future<void> _resolve(GeoPoint p) async {
    final id = ++_request;
    setState(() {
      _point = p;
      _phase = _Phase.resolving;
    });
    final address = _reverse(p);
    try {
      final coverage = await ref.read(coverageRepositoryProvider).check(p);
      final place = await address;
      if (!mounted || id != _request) return;
      setState(() {
        _address = place;
        _coverage = coverage;
        _phase = coverage.covered ? _Phase.ready : _Phase.outOfCoverage;
      });
    } on Object {
      if (mounted && id == _request) setState(() => _phase = _Phase.checkFailed);
    }
  }

  void _onQuery(String q) {
    _debounce?.cancel();
    final id = ++_searchId;
    if (q.trim().isEmpty) return setState(() => _results = const []);
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      List<PlaceSuggestion> r;
      try {
        r = await ref.read(geocoderProvider).search(q, _lang);
      } on Object {
        r = const [];
      }
      if (mounted && id == _searchId) setState(() => _results = r);
    });
  }

  void _pickResult(PlaceSuggestion s) {
    _debounce?.cancel();
    _searchId++;
    _search.text = s.label;
    _searchFocus.unfocus();
    setState(() => _results = const []);
    _map.moveTo(s.point);
  }

  bool get _canConfirm => _phase == _Phase.ready || (_phase == _Phase.outOfCoverage && widget.allowOutOfCoverage);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final framed = _sheet != _Sheet.none; // Figma's permission screens inset the map by 16
    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                JAppHeader.page(title: l10n.locAddAddressTitle, cartLabel: l10n.cart, onBack: () => context.pop()),
                Expanded(
                  child: Padding(
                    padding: framed ? const EdgeInsets.all(JSpace.s16) : EdgeInsets.zero,
                    child: Column(
                      children: [
                        Expanded(child: _mapArea(l10n)),
                        if (framed) const SizedBox(height: JSpace.s16),
                        _panel(l10n, bottomInset: !framed),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (framed) ...[
            Positioned.fill(child: ColoredBox(color: JColors.scrim.withValues(alpha: 0.55))),
            Align(alignment: Alignment.bottomCenter, child: _permissionSheet(l10n)),
          ],
        ],
      ),
    );
  }

  Widget _mapArea(AppLocalizations l10n) {
    final selectedPin = _phase != _Phase.ready && _phase != _Phase.moving;
    return Stack(
      children: [
        Positioned.fill(
          child: MapPicker(
            initial: _point,
            controller: _map,
            useGoogle: ref.watch(envProvider).hasMapsKey,
            onMoveStart: () {
              _searchFocus.unfocus();
              setState(() {
                _phase = _Phase.moving;
                _results = const [];
              });
            },
            onIdle: _resolve,
            pin: JMapPin(
              type: JMapPinType.address,
              selected: selectedPin,
              label: selectedPin ? l10n.locPinLabel : null,
            ),
          ),
        ),
        PositionedDirectional(
          top: JSpace.s16,
          start: JSpace.s16,
          end: JSpace.s16,
          child: Column(
            children: [
              JSearchBar(
                controller: _search,
                focusNode: _searchFocus,
                placeholder: _searchFocus.hasFocus ? l10n.locSearchActiveHint : l10n.locSearchHint,
                clearLabel: l10n.clear,
                onChanged: _onQuery,
              ),
              if (_results.isNotEmpty && _searchFocus.hasFocus) ...[
                const SizedBox(height: JSpace.s8),
                _Results(results: _results, onTap: _pickResult),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _panel(AppLocalizations l10n, {required bool bottomInset}) {
    final bottom = bottomInset ? MediaQuery.paddingOf(context).bottom : 0.0;
    final children = switch (_phase) {
      _Phase.resolving => <Widget>[
        const _Line(width: 220, height: 16),
        const _Line(width: 160, height: 12),
        JButton(label: l10n.locConfirm, onPressed: () {}, loading: true, expand: true),
      ],
      _Phase.checkFailed => <Widget>[
        LocationBanner(text: l10n.locOutErrorBody),
        JButton(label: l10n.retry, onPressed: () => _resolve(_point), expand: true),
      ],
      _ => <Widget>[
        Row(
          children: [
            const Icon(JIcons.mapPinFill, size: 20, color: JColors.ember),
            const SizedBox(width: JSpace.s8),
            Expanded(
              child: Text(
                // No geocode result: the pin still counts; the address is typed on the next screen.
                switch (_address?.line(l10n.listSeparator)) {
                  final line? when line.isNotEmpty => line,
                  _ => l10n.locPinLabel,
                },
                style: JText.labelM,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        Text(l10n.locMoveHint, style: JText.bodyM.copyWith(color: JColors.ink2)),
        if (_phase == _Phase.outOfCoverage) LocationBanner(text: l10n.locOutOfCoverageBanner),
        JButton(
          label: l10n.locConfirm,
          key: const Key('confirm'),
          onPressed: _canConfirm
              ? () => context.pop(PickedPlace(point: _point, address: _address!, coverage: _coverage))
              : null,
          expand: true,
        ),
        // The pickup suggestion: the customer can still browse and pick up from here.
        if (_phase == _Phase.outOfCoverage && !widget.allowOutOfCoverage)
          JButton(
            label: l10n.locOutPickup,
            variant: JButtonVariant.ghost,
            size: JButtonSize.s,
            expand: true,
            onPressed: () => _pickup(_point, _coverage),
          ),
      ],
    };
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(JSpace.s16, JSpace.s16, JSpace.s16, JSpace.s16 + bottom),
      decoration: BoxDecoration(
        color: JColors.paper,
        border: Border.all(color: JColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final (i, w) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s12), w],
        ],
      ),
    );
  }

  Widget _permissionSheet(AppLocalizations l10n) {
    final (title, body, icon, danger, primary, onPrimary) = switch (_sheet) {
      _Sheet.denied => (
        l10n.locPermDeniedTitle,
        l10n.locPermDeniedBody,
        JIcons.lockSimple,
        false,
        l10n.locPermOpenSettings,
        () => ref.read(deviceLocationProvider).openSettings(),
      ),
      _Sheet.locating => (
        l10n.locPermLoadingTitle,
        l10n.locPermLoadingBody,
        JIcons.crosshair,
        false,
        l10n.locPermAllow,
        null,
      ),
      _Sheet.failed => (l10n.locPermErrorTitle, l10n.locPermErrorBody, JIcons.warning, true, l10n.retry, _bootstrap),
      _ => (l10n.locPermTitle, l10n.locPermBody, JIcons.mapPin, false, l10n.locPermAllow, _allow),
    };
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        JSpace.s24,
        JSpace.s24,
        JSpace.s24,
        JSpace.s24 + MediaQuery.paddingOf(context).bottom,
      ),
      decoration: const BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(JRadius.lg)),
        boxShadow: JShadows.card,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: JColors.line, borderRadius: BorderRadius.circular(JRadius.pill)),
            ),
          ),
          const SizedBox(height: JSpace.s16),
          Text(title, style: JText.h2),
          const SizedBox(height: JSpace.s16),
          Center(
            child: Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(color: danger ? JColors.dangerBg : JColors.sand, shape: BoxShape.circle),
              child: Icon(icon, size: 40, color: danger ? JColors.danger : JColors.ink2),
            ),
          ),
          const SizedBox(height: JSpace.s12),
          Text(
            body,
            style: JText.bodyM.copyWith(color: JColors.ink2),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: JSpace.s12),
          JButton(
            label: l10n.locPermManual,
            variant: JButtonVariant.ghost,
            expand: true,
            onPressed: () => setState(() => _sheet = _Sheet.none),
          ),
          const SizedBox(height: JSpace.s16),
          JButton(
            label: primary,
            expand: true,
            loading: _sheet == _Sheet.locating,
            onPressed: onPrimary ?? () {},
          ),
        ],
      ),
    );
  }
}

class _Results extends StatelessWidget {
  const _Results({required this.results, required this.onTap});

  final List<PlaceSuggestion> results;
  final ValueChanged<PlaceSuggestion> onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(JSpace.s8),
      decoration: BoxDecoration(
        color: JColors.paper,
        border: Border.all(color: JColors.line),
        borderRadius: BorderRadius.circular(JRadius.md),
      ),
      child: Column(
        children: [
          for (final (i, r) in results.indexed) ...[
            if (i > 0) const SizedBox(height: JSpace.s4),
            Semantics(
              button: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onTap(r),
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: JSpace.s8),
                  child: Row(
                    children: [
                      const Icon(JIcons.mapPin, size: 20, color: JColors.ink2),
                      const SizedBox(width: JSpace.s12),
                      Expanded(
                        child: Text(r.label, style: JText.bodyM, maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Warning banner (warning-bg, radius 18, warning icon in danger). Also on home when out of coverage.
class LocationBanner extends StatelessWidget {
  const LocationBanner({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(JSpace.s12),
      decoration: BoxDecoration(color: JColors.warningBg, borderRadius: BorderRadius.circular(JRadius.md)),
      child: Row(
        children: [
          const Icon(JIcons.warning, size: 20, color: JColors.danger),
          const SizedBox(width: JSpace.s8),
          Expanded(child: Text(text, style: JText.bodyM)),
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.pill)),
  );
}
