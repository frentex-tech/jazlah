import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

enum JBadgeType { neutral, info, warning, success, danger, brand }

enum JBadgeSize { m, s }

/// Figma `Badge`: a dot and a label on a tinted pill; type × size M/S.
class JBadge extends StatelessWidget {
  const JBadge({required this.label, super.key, this.type = JBadgeType.neutral, this.size = JBadgeSize.m});

  final String label;
  final JBadgeType type;
  final JBadgeSize size;

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg, Color dot) = switch (type) {
      JBadgeType.neutral => (JColors.sand, JColors.ink2, JColors.muted),
      JBadgeType.info => (JColors.infoBg, JColors.info, JColors.info),
      JBadgeType.warning => (JColors.warningBg, JColors.warning, JColors.warning),
      JBadgeType.success => (JColors.successBg, JColors.successText, JColors.success),
      JBadgeType.danger => (JColors.dangerBg, JColors.danger, JColors.danger),
      JBadgeType.brand => (JColors.goldBg, JColors.goldText, JColors.gold),
    };
    final m = size == JBadgeSize.m;
    return Container(
      height: m ? 28 : 22,
      padding: EdgeInsetsDirectional.symmetric(horizontal: m ? JSpace.s12 : JSpace.s8),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(JRadius.pill)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: (m ? JText.labelM : JText.caption).copyWith(color: fg),
            ),
          ),
        ],
      ),
    );
  }
}
