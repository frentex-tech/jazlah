import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Stepper`: minus, count, plus; state default / min (minus off at [min]) / max.
/// Minus stays on the left in both languages, as drawn.
class JStepper extends StatelessWidget {
  const JStepper({
    required this.value,
    required this.onChanged,
    required this.decreaseLabel,
    required this.increaseLabel,
    super.key,
    this.min = 1,
    this.max = 99,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final String decreaseLabel;
  final String increaseLabel;
  final int min;
  final int max;

  @override
  Widget build(BuildContext context) {
    Widget button(IconData icon, String label, int? next) {
      final enabled = next != null;
      final plus = icon == JIcons.plus;
      return Semantics(
        button: true,
        enabled: enabled,
        label: label,
        excludeSemantics: true,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: enabled ? () => onChanged(next) : null,
          child: Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: !enabled ? JColors.sand : (plus ? JColors.ember : JColors.paper),
              border: enabled && !plus ? Border.all(color: JColors.ember, width: 2) : null,
            ),
            child: Icon(
              icon,
              size: 20,
              color: !enabled ? JColors.mutedSoft : (plus ? JColors.paper : JColors.ember),
            ),
          ),
        ),
      );
    }

    return Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          button(JIcons.minus, decreaseLabel, value > min ? value - 1 : null),
          const SizedBox(width: JSpace.s12),
          SizedBox(
            width: 40,
            child: Text('$value', textAlign: TextAlign.center, style: JText.h2),
          ),
          const SizedBox(width: JSpace.s12),
          button(JIcons.plus, increaseLabel, value < max ? value + 1 : null),
        ],
      ),
    );
  }
}
