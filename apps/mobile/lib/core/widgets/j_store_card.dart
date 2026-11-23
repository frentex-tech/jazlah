import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Store card`: round logo with a gold ring, name and rating; 104 wide.
/// A null [rating] hides the rating line.
class JStoreCard extends StatelessWidget {
  const JStoreCard({required this.logo, required this.name, super.key, this.rating, this.onTap});

  /// The 64 logo (any widget; clipped to the circle).
  final Widget logo;
  final String name;
  final String? rating;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: onTap != null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          width: 104,
          padding: const EdgeInsets.all(JSpace.s12),
          decoration: BoxDecoration(
            color: JColors.paper,
            borderRadius: BorderRadius.circular(JRadius.md),
            border: Border.all(color: JColors.line),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: JColors.goldLight, width: 2),
                ),
                child: ClipOval(child: logo),
              ),
              const SizedBox(height: JSpace.s8),
              // The build font runs wider than Figma's: long names shrink rather than cut.
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(name, maxLines: 1, style: JText.labelM),
              ),
              if (rating != null) ...[
                const SizedBox(height: JSpace.s8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(JIcons.starFill, size: 14, color: JColors.goldText),
                    const SizedBox(width: JSpace.s4),
                    Text(rating!, style: JText.caption.copyWith(color: JColors.ink2)),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
