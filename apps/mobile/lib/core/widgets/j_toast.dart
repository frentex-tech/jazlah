import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_icons.dart';

enum JToastKind { success, error, warning, info }

/// Figma `Toast`: paper card with a coloured status icon at the start; type success/error/warning/info.
class JToast extends StatelessWidget {
  const JToast({required this.message, super.key, this.kind = JToastKind.success});

  final String message;
  final JToastKind kind;

  @override
  Widget build(BuildContext context) {
    final (IconData icon, Color color) = switch (kind) {
      JToastKind.success => (JIcons.checkCircleFill, JColors.success),
      JToastKind.error => (JIcons.xCircleFill, JColors.danger),
      JToastKind.warning => (JIcons.warningFill, JColors.warning),
      JToastKind.info => (JIcons.infoFill, JColors.info),
    };
    return Semantics(
      liveRegion: true,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: JSpace.s16, vertical: JSpace.s12),
        decoration: BoxDecoration(
          color: JColors.paper,
          borderRadius: BorderRadius.circular(JRadius.md),
          border: Border.all(color: JColors.line),
          boxShadow: JShadows.card,
        ),
        child: Row(
          children: [
            Icon(icon, size: 24, color: color),
            const SizedBox(width: JSpace.s12),
            Expanded(child: Text(message, style: JText.bodyM)),
          ],
        ),
      ),
    );
  }
}

/// Shows a [JToast] at the bottom through the nearest [ScaffoldMessenger] (replaces the current one).
void showJToast(
  BuildContext context, {
  required String message,
  JToastKind kind = JToastKind.success,
  Duration duration = const Duration(seconds: 3),
}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: JToast(message: message, kind: kind),
        duration: duration,
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.transparent,
        elevation: 0,
        padding: EdgeInsets.zero,
        margin: const EdgeInsets.fromLTRB(JSpace.s24, 0, JSpace.s24, JSpace.s16),
      ),
    );
}
