import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

/// Figma `Skeleton row`: loading placeholder for a list row.
/// The spec packs the thumb and lines toward the end (left in Arabic); reproduced as is.
class JSkeletonRow extends StatelessWidget {
  const JSkeletonRow({super.key});

  @override
  Widget build(BuildContext context) {
    Widget bar(double width) => Container(
      width: width,
      height: 12,
      decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.pill)),
    );
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(JSpace.s12),
      decoration: BoxDecoration(
        color: JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: Border.all(color: JColors.line),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(color: JColors.sand, borderRadius: BorderRadius.circular(JRadius.sm)),
          ),
          const SizedBox(width: JSpace.s12),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              bar(160),
              const SizedBox(height: JSpace.s8),
              bar(110),
            ],
          ),
        ],
      ),
    );
  }
}
