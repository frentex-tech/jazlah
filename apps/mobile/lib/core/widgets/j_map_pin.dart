import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

enum JMapPinType { address, store, courier }

/// Figma `Map pin`: type × default / selected. Selected is larger and shows [label] above.
/// The tip of the tail is the map point: anchor the widget at its bottom centre.
class JMapPin extends StatelessWidget {
  const JMapPin({required this.type, super.key, this.selected = false, this.label});

  final JMapPinType type;
  final bool selected;

  /// Shown above the pin when [selected].
  final String? label;

  @override
  Widget build(BuildContext context) {
    final (Color color, IconData icon) = switch (type) {
      JMapPinType.address => (JColors.ember, JIcons.mapPinFill),
      JMapPinType.store => (JColors.brand, JIcons.storefrontFill),
      JMapPinType.courier => (JColors.ember, JIcons.truckFill),
    };
    final head = selected ? 48.0 : 40.0;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (selected && label != null) ...[
          Container(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: JSpace.s12, vertical: 6),
            decoration: BoxDecoration(color: JColors.ink, borderRadius: BorderRadius.circular(JRadius.sm)),
            child: Text(label!, style: JText.labelM.copyWith(color: JColors.paper)),
          ),
          const SizedBox(height: JSpace.s4),
        ],
        Container(
          width: head,
          height: head,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: Border.all(color: JColors.paper, width: 3),
          ),
          child: Icon(icon, size: selected ? 24 : 20, color: JColors.paper),
        ),
        const SizedBox(height: JSpace.s4),
        Container(
          width: 4,
          height: 8,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
      ],
    );
  }
}
