import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/errors/error_text.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/cart/presentation/cart_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/features/product/domain/product.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// «أضف إلى السلة»: adds [item]; when the cart holds another store's products, asks «استبدال السلة؟»
/// first (409 CART_VENDOR_MISMATCH) and replaces it on confirm. True when added. Other failures throw.
Future<bool> addToCart(BuildContext context, WidgetRef ref, CartItemInput item) async {
  final cart = ref.read(cartProvider.notifier);
  try {
    await cart.add(item);
  } on ApiError catch (e) {
    if (e.code != CartError.vendorMismatch || !context.mounted) rethrow;
    final l10n = AppLocalizations.of(context);
    final vendor = ref.read(cartProvider).value?.vendorName?.of(context.lang) ?? l10n.cartAnotherStore;
    final replace = await showJDialog(
      context,
      title: l10n.cartReplaceTitle,
      // The API's message already names the current store.
      body: e.message ?? l10n.cartReplaceBody(vendor),
      confirmLabel: l10n.cartReplace,
      cancelLabel: l10n.cancel,
    );
    if (replace != true) return false;
    await cart.add(item, replace: true);
  }
  return true;
}

/// The cart (Figma 170-28564; empty 170-28643, loading 170-28708, error 170-28782, below the minimum
/// order 170-28847). Totals come from the cart; nothing is priced here.
class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final _code = TextEditingController();
  String? _couponError;
  bool _couponBusy = false;

  /// Lines swiped away while their removal is on its way.
  final _removing = <String>{};

  /// Lines whose quantity change is on its way: their stepper waits.
  final _pending = <String>{};

  /// A coupon the cart dropped by itself (it stopped applying), shown once.
  String? _droppedCoupon;

  @override
  void initState() {
    super.initState();
    // The field shows the applied code (also one applied on another device).
    ref.listenManual(cartProvider, (prev, next) {
      final before = prev?.value?.couponCode;
      final code = next.value?.couponCode;
      if (code != null && _code.text != code) _code.text = code;
      // Gone without the «إزالة» button: the cart no longer meets it (or changed store).
      if (before != null && code == null && next.hasValue && !_couponBusy) {
        _code.clear();
        // An emptied cart (sign-out, last line removed) has nothing the code could apply to.
        if (next.value!.lines.isNotEmpty) setState(() => _droppedCoupon = before);
      }
    }, fireImmediately: true);
  }

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _guard(Future<void> Function() call) async {
    try {
      await call();
    } on Object catch (e) {
      if (mounted) showJToast(context, message: errorText(context, e), kind: JToastKind.error);
    }
  }

  Future<void> _remove(CartLine line) async {
    setState(() => _removing.add(line.id));
    await _guard(() => ref.read(cartProvider.notifier).remove(line.id));
    if (mounted) setState(() => _removing.remove(line.id));
  }

  Future<void> _step(CartLine line, int quantity) async {
    setState(() => _pending.add(line.id));
    await _guard(() => ref.read(cartProvider.notifier).changeQuantity(line.id, quantity - line.item.quantity));
    if (mounted) setState(() => _pending.remove(line.id));
  }

  Future<void> _coupon(Cart cart) async {
    final c = ref.read(cartProvider.notifier);
    final code = _code.text.trim();
    if (cart.couponCode == null && code.isEmpty) return;
    setState(() {
      _couponBusy = true;
      _couponError = null;
      _droppedCoupon = null;
    });
    try {
      if (cart.couponCode != null) {
        await c.removeCoupon();
        _code.clear();
      } else {
        await c.applyCoupon(code);
      }
    } on Object catch (e) {
      if (mounted) setState(() => _couponError = errorText(context, e));
    } finally {
      if (mounted) setState(() => _couponBusy = false);
    }
  }

  void _checkout() {
    // A guest signs in first; the cart merges into the account and the cart opens again.
    if (ref.read(sessionProvider) != SessionStatus.signedIn) {
      unawaited(context.push('${Routes.phone}?from=${Uri.encodeComponent(Routes.cart)}'));
    } else {
      unawaited(context.push(Routes.checkout));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final cart = ref.watch(cartProvider);
    final value = cart.value;
    // The skeleton only on the first load; edits keep the cart on screen.
    final showData = value != null && !(cart.hasError && !cart.isLoading);
    final empty = showData && value.lines.every((l) => _removing.contains(l.id));
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            JAppHeader.page(title: l10n.cart, cartLabel: l10n.cart, onBack: () => popOrHome(context)),
            Expanded(
              child: cart.hasError && !cart.isLoading
                  ? Center(
                      child: CatalogErrorPanel(
                        error: cart.error!,
                        title: l10n.cartErrorTitle,
                        body: l10n.cartErrorBody,
                        onRetry: () => ref.invalidate(cartProvider),
                      ),
                    )
                  : !showData
                  ? const _Skeleton()
                  : empty
                  ? Center(
                      child: JEmptyState(
                        kind: JEmptyStateKind.cart,
                        title: l10n.cartEmptyTitle,
                        body: l10n.cartEmptyBody,
                        actionLabel: l10n.cartBrowse,
                        onAction: () => context.go(Routes.home),
                      ),
                    )
                  : _content(value),
            ),
            if (!cart.hasError && !empty) _bottom(showData ? value : null),
          ],
        ),
      ),
    );
  }

  Widget _content(Cart cart) {
    final l10n = AppLocalizations.of(context);
    final notice = ref.watch(cartMergeNoticeProvider);
    final lines = cart.lines.where((l) => !_removing.contains(l.id)).toList();
    String nameOf(String lineId) {
      final line = cart.lines.firstWhere((l) => l.id == lineId);
      return line.name?.of(context.lang) ?? l10n.cartItemGone;
    }

    final remaining = cart.minOrderRemaining ?? 0;
    return ListView(
      padding: const EdgeInsets.all(JSpace.s16),
      children: [
        if (notice != null)
          _Banner(
            text: [
              if (notice.replacedPreviousCart) l10n.cartMergeReplaced,
              if (notice.skipped > 0) l10n.cartMergeSkipped(notice.skipped),
            ].join('\n'),
            icon: JIcons.info,
            action: l10n.cartIssueAccept,
            onAction: () => ref.read(cartMergeNoticeProvider.notifier).set(null),
          ),
        if (_droppedCoupon != null)
          _Banner(
            text: l10n.cartCouponDropped(_droppedCoupon!),
            icon: JIcons.info,
            action: l10n.cartIssueAccept,
            onAction: () => setState(() => _droppedCoupon = null),
          ),
        for (final issue in cart.issues)
          if (!_removing.contains(issue.lineId))
            issue.code == CartIssueCode.priceChanged
                ? _Banner(
                    text: l10n.cartIssuePrice(
                      nameOf(issue.lineId),
                      formatHalalas(issue.oldUnitPrice!),
                      formatHalalas(issue.newUnitPrice!),
                    ),
                    action: l10n.cartIssueAccept,
                    // Changing the line takes today's price.
                    onAction: () => _guard(
                      () => ref
                          .read(cartProvider.notifier)
                          .setQuantity(issue.lineId, cart.lines.firstWhere((l) => l.id == issue.lineId).item.quantity),
                    ),
                  )
                : _Banner(
                    text: l10n.cartIssueUnavailable(nameOf(issue.lineId)),
                    action: l10n.cartRemove,
                    onAction: () => _remove(cart.lines.firstWhere((l) => l.id == issue.lineId)),
                  ),
        _Card(
          gap: JSpace.s16,
          children: [
            for (final (i, line) in lines.indexed) ...[
              if (i > 0) const Divider(height: 1, thickness: 1, color: JColors.line),
              _LineRow(
                line: line,
                onQuantity: _pending.contains(line.id) ? null : (q) => _step(line, q),
                onRemove: () => _remove(line),
              ),
            ],
          ],
        ),
        if (remaining > 0) ...[
          const SizedBox(height: JSpace.s12),
          Text(
            l10n.cartMinOrder(formatHalalas(cart.minOrder!)),
            style: JText.labelM.copyWith(color: JColors.warning),
          ),
          const SizedBox(height: JSpace.s4),
          Text(
            l10n.cartMinOrderRemaining(formatHalalas(remaining)),
            style: JText.bodyM.copyWith(color: JColors.ink2),
          ),
          const SizedBox(height: JSpace.s8),
          // Not drawn in 170-28847; the task asks for the progress bar (signoff.md).
          ClipRRect(
            borderRadius: BorderRadius.circular(JRadius.pill),
            child: LinearProgressIndicator(
              value: cart.subtotal / cart.minOrder!,
              minHeight: 4,
              backgroundColor: JColors.sand,
              color: JColors.warning,
            ),
          ),
        ],
        if (!cart.onDevice) ...[const SizedBox(height: JSpace.s12), _couponRow(cart)],
        const SizedBox(height: JSpace.s12),
        _totals(cart),
      ],
    );
  }

  Widget _couponRow(Cart cart) {
    final l10n = AppLocalizations.of(context);
    final applied = cart.couponCode;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: JTextField(
            controller: _code,
            label: l10n.cartCouponLabel,
            placeholder: l10n.cartCouponPlaceholder,
            enabled: applied == null && !_couponBusy,
            errorText: _couponError,
            helperText: applied == null ? null : l10n.cartCouponApplied(applied),
            textInputAction: TextInputAction.done,
            inputFormatters: [LengthLimitingTextInputFormatter(40)],
            onChanged: (_) => _couponError == null ? null : setState(() => _couponError = null),
            onSubmitted: (_) => _coupon(cart),
          ),
        ),
        const SizedBox(width: JSpace.s8),
        // Lined up with the field under its label (21 + 8).
        Padding(
          padding: const EdgeInsets.only(top: 29),
          child: SizedBox(
            height: 52,
            child: Center(
              child: JButton(
                label: applied == null ? l10n.cartCouponApply : l10n.cartCouponRemove,
                size: JButtonSize.s,
                variant: JButtonVariant.secondary,
                loading: _couponBusy,
                onPressed: () => _coupon(cart),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _totals(Cart cart) {
    final l10n = AppLocalizations.of(context);
    Widget row(String label, int halalas, {bool total = false}) {
      final style = total ? JText.h3 : JText.bodyM.copyWith(color: JColors.ink2);
      return Row(
        children: [
          Expanded(child: Text(label, style: style)),
          Text(l10n.productPrice(formatHalalas(halalas)), style: style),
        ],
      );
    }

    return _Card(
      gap: 6,
      children: [
        row(l10n.cartSubtotal, cart.subtotal),
        if (cart.discount > 0) row(l10n.cartDiscountCode(cart.couponCode ?? ''), -cart.discount),
        // Only once fulfilment = delivery (SCH-MOB-1 #71 chooses it).
        if (cart.delivery) row(l10n.cartDeliveryFee, cart.deliveryFee),
        row(l10n.cartVat, cart.vatIncluded),
        row(l10n.cartTotal, cart.total, total: true),
      ],
    );
  }

  /// The checkout button; [cart] is null while loading.
  Widget _bottom(Cart? cart) {
    final l10n = AppLocalizations.of(context);
    // Without the ops settings (real builds before SCH-API-1 #68) checkout is not offered.
    final soon = cart != null && cart.minOrder == null;
    return Padding(
      padding: EdgeInsets.fromLTRB(JSpace.s16, 0, JSpace.s16, JSpace.s16 + MediaQuery.viewPaddingOf(context).bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (soon) ...[
            Text(
              l10n.cartCheckoutSoon,
              textAlign: TextAlign.center,
              style: JText.bodyM.copyWith(color: JColors.ink2),
            ),
            const SizedBox(height: JSpace.s12),
          ],
          JButton(
            label: l10n.cartCheckout,
            expand: true,
            onPressed: cart != null && cart.canCheckout && _removing.isEmpty ? _checkout : null,
          ),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.children, required this.gap});

  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(JSpace.s12),
    decoration: BoxDecoration(
      color: JColors.paper,
      borderRadius: BorderRadius.circular(JRadius.md),
      border: Border.all(color: JColors.line),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final (i, c) in children.indexed) ...[if (i > 0) SizedBox(height: gap), c],
      ],
    ),
  );
}

/// An issue or the merge notice, with its action.
class _Banner extends StatelessWidget {
  const _Banner({required this.text, required this.action, required this.onAction, this.icon = JIcons.warning});

  final String text;
  final IconData icon;
  final String action;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: JSpace.s12),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
      decoration: BoxDecoration(
        color: icon == JIcons.info ? JColors.infoBg : JColors.warningBg,
        borderRadius: BorderRadius.circular(JRadius.md),
      ),
      child: Row(
        children: [
          Icon(icon, size: 24, color: JColors.ink),
          const SizedBox(width: JSpace.s12),
          Expanded(child: Text(text, style: JText.bodyM)),
          const SizedBox(width: JSpace.s8),
          JButton(label: action, size: JButtonSize.s, variant: JButtonVariant.secondary, onPressed: onAction),
        ],
      ),
    ),
  );
}

/// Photo, name, choices, stepper and line total. Swiped away (or the screen reader's «حذف») to remove;
/// the stepper stops at 1 like Figma.
class _LineRow extends StatelessWidget {
  const _LineRow({required this.line, required this.onQuantity, required this.onRemove});

  final CartLine line;

  /// Null while a change is on its way.
  final ValueChanged<int>? onQuantity;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final lang = context.lang;
    final weight = line.sizeGrams == null ? null : formatWeight(l10n, line.sizeGrams!);
    // Figma: «500 جم للقطعة» for several pieces, «نحو 1.5 كجم» for one (the size weight is approximate).
    final details = [
      ?line.cutName?.of(lang),
      if (weight != null) line.item.quantity > 1 ? l10n.cartWeightEach(weight) : l10n.cartWeightAbout(weight),
    ].join(' · ');
    final row = Row(
      children: [
        Opacity(
          opacity: line.available ? 1 : 0.5,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(JRadius.md),
            child: SizedBox(width: 72, height: 72, child: CatalogImage(line.image)),
          ),
        ),
        const SizedBox(width: JSpace.s12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(line.name?.of(lang) ?? l10n.cartItemGone, style: JText.labelM),
              if (details.isNotEmpty) ...[
                const SizedBox(height: JSpace.s4),
                Text(details, style: JText.bodyM.copyWith(color: JColors.ink2)),
              ],
              const SizedBox(height: JSpace.s4),
              Row(
                children: [
                  JStepper(
                    value: line.item.quantity,
                    max: ProductSelection.maxQuantity,
                    decreaseLabel: l10n.productDecrease,
                    increaseLabel: l10n.productIncrease,
                    onChanged: line.available ? onQuantity : null,
                  ),
                  const SizedBox(width: JSpace.s8),
                  Expanded(
                    child: Text(
                      line.available ? l10n.productPrice(formatHalalas(line.lineTotal)) : l10n.cartUnavailable,
                      textAlign: TextAlign.end,
                      style: JText.labelM.copyWith(color: line.available ? JColors.ink : JColors.danger),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
    return Semantics(
      customSemanticsActions: {CustomSemanticsAction(label: l10n.cartRemove): onRemove},
      child: Dismissible(
        key: ValueKey(line.id),
        onDismissed: (_) => onRemove(),
        background: Container(
          alignment: AlignmentDirectional.centerStart,
          padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
          decoration: BoxDecoration(color: JColors.dangerBg, borderRadius: BorderRadius.circular(JRadius.sm)),
          child: const Icon(JIcons.trash, color: JColors.danger),
        ),
        secondaryBackground: Container(
          alignment: AlignmentDirectional.centerEnd,
          padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
          decoration: BoxDecoration(color: JColors.dangerBg, borderRadius: BorderRadius.circular(JRadius.sm)),
          child: const Icon(JIcons.trash, color: JColors.danger),
        ),
        child: row,
      ),
    );
  }
}

/// Figma 170-28708: three line placeholders, the totals block and the disabled button.
class _Skeleton extends StatelessWidget {
  const _Skeleton();

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(JSpace.s16),
    physics: const NeverScrollableScrollPhysics(),
    children: [
      for (var i = 0; i < 3; i++) ...[const JSkeletonRow(), const SizedBox(height: JSpace.s12)],
      Container(
        height: 150,
        decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.md)),
      ),
    ],
  );
}
