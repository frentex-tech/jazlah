import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// One tab of [JBottomTabBar]: regular icon, its `-fill` version for the active tab, and the label.
class JBottomTabItem {
  const JBottomTabItem({required this.icon, required this.activeIcon, required this.label});

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

/// Figma `Bottom tab bar` (active=1..n). Items run from the start (right in Arabic).
class JBottomTabBar extends StatelessWidget {
  const JBottomTabBar({required this.items, required this.activeIndex, required this.onTap, super.key});

  final List<JBottomTabItem> items;

  /// 0-based (Figma `active=1` is index 0).
  final int activeIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    // 84 high in the spec; on devices with a home indicator the bottom inset replaces the 8 padding.
    final bottom = MediaQuery.viewPaddingOf(context).bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(JSpace.s8, JSpace.s8, JSpace.s8, bottom > JSpace.s8 ? bottom : JSpace.s8),
      decoration: const BoxDecoration(
        color: JColors.paper,
        border: Border(top: BorderSide(color: JColors.line)),
      ),
      child: SizedBox(
        height: 67,
        child: Row(
          children: [
            for (var i = 0; i < items.length; i++)
              Expanded(
                child: Semantics(
                  button: true,
                  selected: i == activeIndex,
                  label: items[i].label,
                  excludeSemantics: true,
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => onTap(i),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          i == activeIndex ? items[i].activeIcon : items[i].icon,
                          size: 24,
                          color: i == activeIndex ? JColors.ember : JColors.muted,
                        ),
                        const SizedBox(height: JSpace.s4),
                        Text(
                          items[i].label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: JText.labelM.copyWith(color: i == activeIndex ? JColors.ember : JColors.muted),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
