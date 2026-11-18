import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// Figma `Card`: paper, radius md, card shadow, 16 padding; default / selected (ember 2px stroke).
class JCard extends StatelessWidget {
  const JCard({required this.child, super.key, this.selected = false, this.onTap});

  final Widget child;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      width: double.infinity,
      padding: const EdgeInsets.all(JSpace.s16),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: selected ? Border.all(color: JColors.ember, width: 2) : Border.all(color: JColors.line),
        boxShadow: JShadows.card,
      ),
      child: child,
    );
    if (onTap == null) return card;
    return Semantics(
      button: true,
      selected: selected,
      child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: onTap, child: card),
    );
  }
}
