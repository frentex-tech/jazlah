import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_choice_row.dart';

/// Figma `Switch`: checked yes/no × default/disabled (disabled when [onChanged] is null).
/// On puts the knob at the end (left in Arabic), as in the spec.
class JSwitch extends StatelessWidget {
  const JSwitch({required this.checked, required this.onChanged, super.key, this.label});

  final bool checked;
  final ValueChanged<bool>? onChanged;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final enabled = onChanged != null;
    final on = checked && enabled;
    return Semantics(
      toggled: checked,
      enabled: enabled,
      label: label,
      excludeSemantics: true,
      child: JChoiceRow(
        enabled: enabled,
        label: label,
        onTap: enabled ? () => onChanged!(!checked) : null,
        control: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: 48,
          height: 28,
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 3),
          decoration: BoxDecoration(
            color: on ? JColors.ember : JColors.sand,
            borderRadius: BorderRadius.circular(JRadius.pill),
            border: on ? null : Border.all(color: enabled ? JColors.muted : JColors.mutedSoft),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 150),
            alignment: checked ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
            child: Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: on ? JColors.paper : (enabled ? JColors.muted : JColors.mutedSoft),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
