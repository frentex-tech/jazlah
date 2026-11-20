import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// Figma `Category tile`: a 72 round photo with a gold ring over the name; 84 wide.
class JCategoryTile extends StatelessWidget {
  const JCategoryTile({required this.image, required this.label, super.key, this.onTap});

  /// Any widget; clipped to the circle.
  final Widget image;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: onTap != null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: SizedBox(
          width: 84,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: JColors.sand,
                  shape: BoxShape.circle,
                  border: Border.all(color: JColors.goldDeco),
                ),
                child: ClipOval(child: image),
              ),
              const SizedBox(height: JSpace.s8),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: JText.labelM,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
