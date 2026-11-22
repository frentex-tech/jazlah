import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/cart/presentation/cart_screen.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/product/domain/price.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/features/product/presentation/product_providers.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// Product detail and customisation (Figma 118-8735; scrolled 118-8897, price details 118-9059,
/// incompatible option 118-9254, loading 118-9496, out of stock 118-9350, error 118-9545, add error
/// 118-9573). The total comes from [priceLine] only.
class ProductScreen extends ConsumerStatefulWidget {
  const ProductScreen({required this.id, super.key});

  final String id;

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  final GlobalKey _cutKey = GlobalKey();
  final _notes = TextEditingController();
  ProductSelection? _selection;
  int _page = 0;
  bool _cutError = false;
  bool _adding = false;

  /// The incompatible packaging whose explanation is open.
  String? _explained;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  /// Another product in the same place (a link replacing the route): start over from its own default size.
  @override
  void didUpdateWidget(ProductScreen old) {
    super.didUpdateWidget(old);
    if (old.id == widget.id) return;
    _selection = null;
    _page = 0;
    _cutError = false;
    _explained = null;
    _notes.clear();
  }

  void _set(ProductSelection s) => setState(() {
    _selection = s;
    if (s.cutId != null) _cutError = false;
  });

  Future<void> _add(ProductDetail p) async {
    if (priceLine(p, _selection!).errors.contains(PriceError.optionRequired)) {
      setState(() => _cutError = true);
      final target = _cutKey.currentContext;
      if (target != null) await Scrollable.ensureVisible(target, duration: const Duration(milliseconds: 300));
      return;
    }
    setState(() => _adding = true);
    try {
      final added = await addToCart(
        context,
        ref,
        CartItemInput.fromSelection(p.id, _selection!, notes: _notes.text),
      );
      if (added && mounted) showJToast(context, message: AppLocalizations.of(context).productAdded);
    } on Object catch (e) {
      if (mounted) showJToast(context, message: errorText(context, e), kind: JToastKind.error);
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final product = ref.watch(productProvider(widget.id));
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(
              title: l10n.productTitle,
              cartLabel: l10n.cart,
              onBack: () => popOrHome(context),
              onCart: () => openCart(context),
              cartCount: ref.watch(cartCountProvider),
            ),
            Expanded(
              child: product.when(
                loading: () => ListView(
                  padding: const EdgeInsets.all(JSpace.s16),
                  children: [
                    Container(
                      height: 240,
                      decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.lg)),
                    ),
                    for (var i = 0; i < 3; i++) ...[
                      SizedBox(height: i == 0 ? JSpace.s16 : JSpace.s12),
                      const JSkeletonRow(),
                    ],
                  ],
                ),
                error: (e, _) => ListView(
                  padding: const EdgeInsets.all(JSpace.s16),
                  children: [
                    CatalogErrorPanel(
                      error: e,
                      title: l10n.productErrorTitle,
                      body: l10n.productErrorBody,
                      onRetry: () => ref.invalidate(productProvider(widget.id)),
                    ),
                  ],
                ),
                data: (p) => _content(p, _selection ??= ProductSelection.initial(p)),
              ),
            ),
            if (!product.hasError || product.isLoading) _bar(product.value),
          ],
        ),
      ),
    );
  }

  Widget _content(ProductDetail p, ProductSelection s) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final cut = p.cuts.where((c) => c.id == s.cutId).firstOrNull;
    // Out of stock: every choice is shown muted and cannot change (Figma 118-9350).
    final on = p.available;
    Widget gap(Widget child) => Padding(
      padding: const EdgeInsets.only(top: JSpace.s16),
      child: child,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(JSpace.s16, 0, JSpace.s16, JSpace.s16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (!p.available) gap(CatalogNotice(l10n.productUnavailableNotice, icon: JIcons.warning)),
          gap(_gallery(p)),
          gap(
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => context.push(Routes.store(p.vendorId), extra: p.vendorName?.of(lang)),
              child: Row(
                // Figma packs the vendor line toward the end edge.
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Icon(JIcons.storefront, size: 20, color: JColors.ink2),
                  const SizedBox(width: JSpace.s8),
                  Flexible(
                    child: Text(
                      p.vendorName?.of(lang) ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: JText.labelM.copyWith(color: JColors.ink2),
                    ),
                  ),
                  if (p.vendorRating != null) ...[
                    const SizedBox(width: JSpace.s8),
                    const Icon(JIcons.starFill, size: 16, color: JColors.goldText),
                    const SizedBox(width: JSpace.s8),
                    Text(p.vendorRating!.toStringAsFixed(1), style: JText.bodyM.copyWith(color: JColors.ink2)),
                  ],
                ],
              ),
            ),
          ),
          gap(Text(p.name.of(lang), style: JText.h1)),
          if (p.description != null)
            gap(Text(p.description!.of(lang), style: JText.bodyM.copyWith(color: JColors.ink2))),
          if (p.slaughteredAt != null) gap(_freshness(p)),
          gap(_Head(l10n.productSize, l10n.productRequiredOne)),
          gap(
            Wrap(
              spacing: JSpace.s8,
              runSpacing: JSpace.s8,
              children: [
                for (final size in p.sizes)
                  JChip(
                    label: [formatWeight(l10n, size.grams), ?size.tag?.of(lang)].join(' · '),
                    selected: size.id == s.sizeId,
                    onTap: on && size.available ? () => _set(s.withSize(size.id)) : null,
                  ),
              ],
            ),
          ),
          if (p.cuts.isNotEmpty) ...[
            Padding(
              key: _cutKey,
              padding: const EdgeInsets.only(top: JSpace.s16),
              child: _Head(l10n.productCut, l10n.productRequiredOne),
            ),
            if (_cutError)
              gap(
                Row(
                  children: [
                    const Icon(JIcons.warning, size: 20, color: JColors.danger),
                    const SizedBox(width: JSpace.s8),
                    Expanded(
                      child: Text(l10n.productChooseCut, style: JText.labelM.copyWith(color: JColors.danger)),
                    ),
                  ],
                ),
              ),
            gap(
              _Options([
                for (final c in p.cuts)
                  _OptionRow(
                    radio: JRadio(
                      checked: c.id == s.cutId,
                      label: c.name.of(lang),
                      onTap: on ? () => _set(s.withCut(p, c.id)) : null,
                    ),
                    price: _extra(l10n, c.extraHalalas),
                    enabled: on,
                  ),
              ]),
            ),
          ],
          if (p.packagings.isNotEmpty) ...[
            gap(_Head(l10n.productPackaging, l10n.productPackagingHint)),
            gap(
              _Options([
                for (final o in p.packagings)
                  if (p.compatible(s.cutId, o.id))
                    _OptionRow(
                      radio: JRadio(
                        checked: o.id == s.packagingId,
                        label: o.name.of(lang),
                        onTap: on ? () => _set(s.withPackaging(p, o.id)) : null,
                      ),
                      price: _extra(l10n, o.extraHalalas),
                      enabled: on,
                    )
                  else
                    _IncompatibleOption(
                      option: o,
                      price: _extra(l10n, o.extraHalalas),
                      cutName: definiteName(cut!.name.of(lang), lang),
                      choices: [
                        for (final c in p.cuts)
                          if (p.compatible(c.id, o.id)) l10n.productQuoted(c.name.of(lang)),
                      ].join(l10n.productOr),
                      open: _explained == o.id,
                      onTap: () => setState(() => _explained = _explained == o.id ? null : o.id),
                    ),
              ]),
            ),
          ],
          if (p.exclusions.isNotEmpty) ...[
            gap(_Head(l10n.productExclusions, l10n.productExclusionsHint)),
            gap(
              _Options([
                for (final e in p.exclusions)
                  Align(
                    // Figma puts the checkboxes at the end edge.
                    alignment: AlignmentDirectional.centerEnd,
                    child: JCheckbox(
                      checked: s.exclusionIds.contains(e.id),
                      label: e.name.of(lang),
                      onChanged: on ? (_) => _set(s.toggleExclusion(e.id)) : null,
                    ),
                  ),
              ]),
            ),
          ],
          gap(
            JTextField(
              controller: _notes,
              label: l10n.productNotes,
              placeholder: l10n.productNotesPlaceholder,
              helperText: l10n.productNotesExample,
              enabled: on,
              inputFormatters: [LengthLimitingTextInputFormatter(200)],
            ),
          ),
          gap(
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.productQuantity, style: JText.h3),
                JStepper(
                  value: s.quantity,
                  max: ProductSelection.maxQuantity,
                  decreaseLabel: l10n.productDecrease,
                  increaseLabel: l10n.productIncrease,
                  onChanged: on ? (q) => _set(s.withQuantity(q)) : null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _gallery(ProductDetail p) {
    final images = p.images.isEmpty ? const <String?>[null] : p.images;
    return Column(
      children: [
        SizedBox(
          height: 260,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(JRadius.lg),
            child: PageView(
              onPageChanged: (i) => setState(() => _page = i),
              children: [for (final url in images) CatalogImage(url)],
            ),
          ),
        ),
        if (images.length > 1) ...[
          const SizedBox(height: JSpace.s16),
          // Figma draws the first photo's dot on the left in Arabic too.
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            textDirection: TextDirection.ltr,
            children: [
              for (var i = 0; i < images.length; i++) ...[
                if (i > 0) const SizedBox(width: JSpace.s8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: i == _page ? 28 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: i == _page ? JColors.ember : JColors.line,
                    borderRadius: BorderRadius.circular(JRadius.pill),
                  ),
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }

  Widget _freshness(ProductDetail p) {
    final l10n = AppLocalizations.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: Border.all(color: JColors.line),
      ),
      child: Row(
        children: [
          const Icon(JIcons.thermometer, size: 24, color: JColors.ink2),
          const SizedBox(width: JSpace.s12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                JBadge(
                  label: l10n.productSlaughteredAt(formatMinutes(l10n, p.slaughteredAt!)),
                  type: JBadgeType.brand,
                  size: JBadgeSize.s,
                ),
                if (p.deliveredWithinHours != null) ...[
                  const SizedBox(height: JSpace.s4),
                  Text(
                    l10n.productDeliveredWithin(p.deliveredWithinHours!),
                    style: JText.bodyM.copyWith(color: JColors.ink2),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// The sticky total and add button; [p] is null while loading.
  Widget _bar(ProductDetail? p) {
    final l10n = AppLocalizations.of(context);
    final line = p == null ? null : priceLine(p, _selection!);
    final ok = (line?.ok ?? false) || (line?.onlyMissingChoice ?? false);
    final unavailable = p != null && !p.available;
    return Container(
      padding: EdgeInsets.fromLTRB(
        JSpace.s16,
        JSpace.s12,
        JSpace.s16,
        JSpace.s12 + MediaQuery.viewPaddingOf(context).bottom,
      ),
      decoration: const BoxDecoration(
        color: JColors.paper,
        border: Border(top: BorderSide(color: JColors.line)),
        boxShadow: JShadows.card,
      ),
      child: Row(
        children: [
          Semantics(
            button: ok,
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: ok ? () => _showPrice(p!, line!) : null,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(l10n.productTotal, style: JText.bodyM.copyWith(color: JColors.ink2)),
                      const SizedBox(width: JSpace.s4),
                      const Icon(JIcons.caretUp, size: 16, color: JColors.ink2),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatHalalas(line?.lineTotal ?? 0),
                        style: JText.h1.copyWith(color: ok ? JColors.ink : JColors.ink2),
                      ),
                      const SizedBox(width: JSpace.s4),
                      Text(l10n.currency, style: JText.bodyM.copyWith(color: JColors.ink2)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: JSpace.s16),
          Expanded(
            child: JButton(
              label: unavailable ? l10n.productUnavailable : l10n.addToCart,
              expand: true,
              loading: _adding,
              onPressed: ok ? () => _add(p!) : null,
            ),
          ),
        ],
      ),
    );
  }

  void _showPrice(ProductDetail p, PriceLine line) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final s = _selection!;
    String nameOf(List<ProductOption> list, String id) => list.firstWhere((o) => o.id == id).name.of(lang);
    Widget row(String label, String value, {bool total = false}) => Row(
      children: [
        Expanded(
          child: Text(label, style: total ? JText.h3 : JText.bodyM.copyWith(color: JColors.ink2)),
        ),
        Text(value, style: total ? JText.h3 : JText.bodyM),
      ],
    );
    final rows = <Widget>[
      for (final c in line.breakdown)
        switch (c.kind) {
          PriceKind.size => row(
            '${formatWeight(l10n, p.sizes.firstWhere((z) => z.id == c.optionId).grams)} × '
            '${l10n.productPrice(formatHalalas(c.halalas))}',
            l10n.productPrice(formatHalalas(c.halalas)),
          ),
          PriceKind.cut => row(l10n.productCutLine(nameOf(p.cuts, c.optionId)), _extra(l10n, c.halalas)),
          PriceKind.packaging => row(definiteName(nameOf(p.packagings, c.optionId), lang), _extra(l10n, c.halalas)),
        },
      if (s.quantity > 1) row(l10n.productQuantity, '× ${s.quantity}'),
      row(l10n.productDelivery, l10n.productDeliveryAtCheckout),
    ];
    unawaited(
      showJBottomSheet<void>(
        context,
        title: l10n.productPriceDetails,
        action: Builder(
          builder: (sheet) => JButton(
            label: l10n.addToCart,
            expand: true,
            onPressed: () {
              Navigator.of(sheet).pop();
              unawaited(_add(p));
            },
          ),
        ),
        builder: (_) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final r in rows) ...[r, const SizedBox(height: JSpace.s12)],
            const Divider(height: 1, thickness: 1, color: JColors.line),
            const SizedBox(height: JSpace.s12),
            row(l10n.productTotal, l10n.productPrice(formatHalalas(line.lineTotal)), total: true),
          ],
        ),
      ),
    );
  }
}

/// Arabic option names read as definite in a sentence (Figma: «الشرائح», «التغليف المفرغ»): "ال" on each
/// Arabic word not already carrying it, up to «بدون» («بدون تغليف» stays as it is). shortcut: wrong for a
/// construct like «صندوق هدية» (mock only), API gap: ask CAT-API-5 (#50) for definite names if needed.
@visibleForTesting
String definiteName(String name, String lang) {
  if (lang != 'ar') return name;
  var plain = false;
  return name
      .split(' ')
      .map((w) {
        if (w == 'بدون') plain = true;
        final arabic = w.isNotEmpty && RegExp('^[\u0621-\u064A]').hasMatch(w);
        return plain || !arabic || w.startsWith('ال') ? w : 'ال$w';
      })
      .join(' ');
}

String _extra(AppLocalizations l10n, int halalas) =>
    halalas == 0 ? l10n.productFree : l10n.productExtra(formatHalalas(halalas));

class _Head extends StatelessWidget {
  const _Head(this.title, this.subtitle);

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text(title, style: JText.h3),
      const SizedBox(height: JSpace.s4),
      Text(subtitle, style: JText.bodyM.copyWith(color: JColors.ink2)),
    ],
  );
}

/// The paper card around a list of options.
class _Options extends StatelessWidget {
  const _Options(this.children);

  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(JSpace.s16),
    decoration: BoxDecoration(
      color: JColors.paper,
      borderRadius: BorderRadius.circular(JRadius.md),
      border: Border.all(color: JColors.line),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final (i, c) in children.indexed) ...[if (i > 0) const SizedBox(height: JSpace.s4), c],
      ],
    ),
  );
}

/// A radio with its extra price at the end.
class _OptionRow extends StatelessWidget {
  const _OptionRow({required this.radio, required this.price, this.enabled = true});

  final Widget radio;
  final String price;
  final bool enabled;

  @override
  Widget build(BuildContext context) => Row(
    children: [
      Expanded(
        child: Align(alignment: AlignmentDirectional.centerStart, child: radio),
      ),
      Text(price, style: JText.bodyM.copyWith(color: enabled ? JColors.ink2 : JColors.mutedSoft)),
    ],
  );
}

/// A packaging that does not go with the chosen cut: disabled with the reason below; a tap opens the
/// dark explanation above it (Figma 118-9254).
class _IncompatibleOption extends StatelessWidget {
  const _IncompatibleOption({
    required this.option,
    required this.price,
    required this.cutName,
    required this.choices,
    required this.open,
    required this.onTap,
  });

  final ProductOption option;
  final String price;
  final String cutName;

  /// The cuts it goes with, ready to read.
  final String choices;
  final bool open;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final reason = l10n.productIncompatible(cutName);
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (open) ...[
          Container(
            padding: const EdgeInsets.all(JSpace.s12),
            decoration: BoxDecoration(color: JColors.ink, borderRadius: BorderRadius.circular(JRadius.md)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(JIcons.info, size: 20, color: JColors.paper),
                    const SizedBox(width: JSpace.s8),
                    Expanded(
                      child: Text(reason, style: JText.labelM.copyWith(color: JColors.paper)),
                    ),
                  ],
                ),
                if (choices.isNotEmpty) ...[
                  const SizedBox(height: JSpace.s8),
                  Text(
                    l10n.productIncompatibleHelp(choices),
                    style: JText.bodyM.copyWith(color: JColors.paper),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: JSpace.s4),
        ],
        _OptionRow(
          radio: JRadio(checked: false, label: option.name.of(context.lang), onTap: null),
          price: price,
          enabled: false,
        ),
        const SizedBox(height: JSpace.s4),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: JSpace.s4),
          child: Row(
            children: [
              const Icon(JIcons.prohibit, size: 16, color: JColors.ink2),
              const SizedBox(width: JSpace.s8),
              Expanded(
                child: Text(reason, style: JText.bodyM.copyWith(color: JColors.ink2)),
              ),
            ],
          ),
        ),
      ],
    );
    return Semantics(
      button: true,
      hint: reason,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: open
            ? Container(
                padding: const EdgeInsets.all(JSpace.s4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(JRadius.sm),
                  border: Border.all(color: JColors.ink, width: 2),
                ),
                child: body,
              )
            : body,
      ),
    );
  }
}
