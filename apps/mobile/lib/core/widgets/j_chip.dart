import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// Figma `Chip`: default / selected / disabled (disabled when [onTap] is null).
class JChip extends StatelessWidget {
  const JChip({required this.label, required this.onTap, super.key, this.selected = false});

  final String label;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    final (Color bg, Color fg) = disabled
        ? (JColors.sand, JColors.mutedSoft)
        : selected
        ? (JColors.brand, JColors.paper)
        : (JColors.paper, JColors.ink);
    return Semantics(
      button: true,
      selected: selected,
      enabled: !disabled,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          height: 40,
          padding: const EdgeInsetsDirectional.symmetric(horizontal: JSpace.s16),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(JRadius.pill),
            border: !disabled && !selected ? Border.all(color: JColors.line) : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center, // centred when stretched (checkout method toggle)
            children: [
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: JText.labelM.copyWith(color: fg),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
