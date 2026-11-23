import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_choice_row.dart';

/// Figma `Radio`: checked yes/no × default/disabled (disabled when [onTap] is null).
class JRadio extends StatelessWidget {
  const JRadio({required this.checked, required this.onTap, super.key, this.label});

  final bool checked;
  final VoidCallback? onTap;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    final stroke = enabled ? (checked ? JColors.ember : JColors.muted) : JColors.mutedSoft;
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: checked,
      enabled: enabled,
      label: label,
      excludeSemantics: true,
      child: JChoiceRow(
        enabled: enabled,
        label: label,
        onTap: onTap,
        control: Container(
          width: 24,
          height: 24,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: stroke, width: 2),
          ),
          child: checked
              ? Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: enabled ? JColors.ember : JColors.mutedSoft),
                )
              : null,
        ),
      ),
    );
  }
}
