import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_button.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

enum JEmptyStateKind { cart, orders, search, error, offline, denied, location }

/// Figma `State panel`: icon disc, title, body and an optional action, per [kind].
/// Error and offline use a primary action, the others a secondary one (as in the spec).
class JEmptyState extends StatelessWidget {
  const JEmptyState({
    required this.kind,
    required this.title,
    required this.body,
    super.key,
    this.actionLabel,
    this.onAction,
  });

  final JEmptyStateKind kind;
  final String title;
  final String body;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final (IconData icon, Color fg, Color bg) = switch (kind) {
      JEmptyStateKind.cart => (JIcons.shoppingBag, JColors.ink2, JColors.sand),
      JEmptyStateKind.orders => (JIcons.receipt, JColors.ink2, JColors.sand),
      JEmptyStateKind.search => (JIcons.magnifyingGlass, JColors.ink2, JColors.sand),
      JEmptyStateKind.error => (JIcons.warningCircle, JColors.danger, JColors.dangerBg),
      JEmptyStateKind.offline => (JIcons.wifiSlash, JColors.warning, JColors.warningBg),
      JEmptyStateKind.denied => (JIcons.lockSimple, JColors.ink2, JColors.sand),
      JEmptyStateKind.location => (JIcons.mapPin, JColors.ink2, JColors.sand),
    };
    final primary = kind == JEmptyStateKind.error || kind == JEmptyStateKind.offline;
    return Padding(
      padding: const EdgeInsets.all(JSpace.s24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 88,
            height: 88,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
            child: Icon(icon, size: 40, color: fg),
          ),
          const SizedBox(height: JSpace.s12),
          Text(title, textAlign: TextAlign.center, style: JText.h2),
          const SizedBox(height: JSpace.s12),
          Text(
            body,
            textAlign: TextAlign.center,
            style: JText.bodyM.copyWith(color: JColors.ink2),
          ),
          if (actionLabel != null) ...[
            const SizedBox(height: JSpace.s12),
            JButton(
              label: actionLabel!,
              onPressed: onAction,
              variant: primary ? JButtonVariant.primary : JButtonVariant.secondary,
            ),
          ],
        ],
      ),
    );
  }
}
