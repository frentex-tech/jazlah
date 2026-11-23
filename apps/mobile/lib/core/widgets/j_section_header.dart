import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

/// Figma `Section header`: H2 title at the start, an ember "all" link with a caret at the end.
/// A null [onAction] hides the link.
class JSectionHeader extends StatelessWidget {
  const JSectionHeader({required this.title, super.key, this.actionLabel, this.onAction});

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Row(
      children: [
        Expanded(
          child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: JText.h2),
        ),
        if (actionLabel != null && onAction != null)
          Semantics(
            button: true,
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: onAction,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(actionLabel!, style: JText.labelM.copyWith(color: JColors.ember)),
                  const SizedBox(width: JSpace.s4),
                  // Points forward: left in Arabic, right in English.
                  Icon(rtl ? JIcons.caretLeft : JIcons.caretRight, size: 16, color: JColors.ember),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
