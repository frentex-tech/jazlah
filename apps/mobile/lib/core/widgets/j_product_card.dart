import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Product card`: image, vendor, title, subtitle, optional badge, price and an add button;
/// default / unavailable. Width comes from the parent (165 in the spec's grid).
/// [price] and [currency] are display strings formatted by the caller.
class JProductCard extends StatelessWidget {
  const JProductCard({
    required this.image,
    required this.vendor,
    required this.title,
    required this.price,
    required this.currency,
    required this.addLabel,
    super.key,
    this.subtitle,
    this.badge,
    this.available = true,
    this.onTap,
    this.onAdd,
  });

  /// The 120-high photo (any widget; it is clipped to the card).
  final Widget image;
  final String vendor;
  final String title;
  final String? subtitle;
  final Widget? badge;
  final String price;
  final String currency;

  /// Semantics label of the icon-only add button.
  final String addLabel;
  final bool available;
  final VoidCallback? onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final strong = available ? JColors.ink : JColors.ink2;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: JColors.paper,
          borderRadius: BorderRadius.circular(JRadius.md),
          border: Border.all(color: JColors.line),
          boxShadow: JShadows.card,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(height: 120, child: image),
            Padding(
              padding: const EdgeInsets.all(JSpace.s12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(JIcons.storefront, size: 14, color: JColors.ink2),
                      const SizedBox(width: JSpace.s4),
                      Flexible(
                        child: Text(
                          vendor,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: JText.caption.copyWith(color: JColors.ink2),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    title,
                    // One line as in Figma: grids give every card the same height.
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: JText.labelM.copyWith(color: strong),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: JText.bodyM.copyWith(color: JColors.ink2),
                    ),
                  ],
                  if (badge != null) ...[const SizedBox(height: 6), badge!],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Flexible(
                              child: Text(
                                price,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: JText.h3.copyWith(color: strong),
                              ),
                            ),
                            const SizedBox(width: JSpace.s4),
                            Text(currency, style: JText.caption.copyWith(color: JColors.ink2)),
                          ],
                        ),
                      ),
                      Semantics(
                        button: true,
                        enabled: available && onAdd != null,
                        label: addLabel,
                        excludeSemantics: true,
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: available ? onAdd : null,
                          child: Container(
                            width: 36,
                            height: 36,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: available ? JColors.ember : JColors.sand,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              JIcons.plus,
                              size: 20,
                              color: available ? JColors.paper : JColors.mutedSoft,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
