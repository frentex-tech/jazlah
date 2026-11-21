import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_choice_row.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Checkbox`: checked yes/no × default/disabled (disabled when [onChanged] is null).
class JCheckbox extends StatelessWidget {
  const JCheckbox({required this.checked, required this.onChanged, super.key, this.label});

  final bool checked;
  final ValueChanged<bool>? onChanged;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final enabled = onChanged != null;
    final stroke = enabled ? (checked ? JColors.ember : JColors.muted) : JColors.mutedSoft;
    final fill = checked ? (enabled ? JColors.ember : JColors.sand) : null;
    return Semantics(
      checked: checked,
      enabled: enabled,
      label: label,
      excludeSemantics: true,
      child: JChoiceRow(
        enabled: enabled,
        label: label,
        onTap: enabled ? () => onChanged!(!checked) : null,
        control: Container(
          width: 24,
          height: 24,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: fill,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: stroke, width: 2),
          ),
          child: checked ? Icon(JIcons.check, size: 16, color: enabled ? JColors.paper : JColors.mutedSoft) : null,
        ),
      ),
    );
  }
}
