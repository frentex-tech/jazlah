import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// The row shared by Checkbox, Radio and Switch: the control at the start, then the label. At least 44 high
/// (the tap target); a label that wraps grows the row instead of being clipped.
class JChoiceRow extends StatelessWidget {
  const JChoiceRow({required this.control, required this.label, required this.enabled, required this.onTap, super.key});

  final Widget control;
  final String? label;
  final bool enabled;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 44),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            control,
            if (label != null) ...[
              const SizedBox(width: JSpace.s12),
              Flexible(
                child: Text(label!, style: JText.bodyL.copyWith(color: enabled ? JColors.ink : JColors.mutedSoft)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
