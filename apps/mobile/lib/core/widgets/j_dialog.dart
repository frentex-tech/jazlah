import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_button.dart';

enum JDialogType { normal, destructive }

/// Figma `Dialog`: title, body and two actions (confirm at the start, cancel at the end);
/// type default (primary confirm) / destructive (danger confirm).
class JDialog extends StatelessWidget {
  const JDialog({
    required this.title,
    required this.body,
    required this.confirmLabel,
    required this.cancelLabel,
    super.key,
    this.type = JDialogType.normal,
    this.onConfirm,
    this.onCancel,
  });

  final String title;
  final String body;
  final String confirmLabel;
  final String cancelLabel;
  final JDialogType type;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Container(
        width: 320,
        padding: const EdgeInsets.all(JSpace.s24),
        decoration: BoxDecoration(
          color: JColors.paper,
          borderRadius: BorderRadius.circular(JRadius.lg),
          border: Border.all(color: JColors.line),
          boxShadow: JShadows.card,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: JText.h2),
            const SizedBox(height: JSpace.s16),
            Text(body, style: JText.bodyM.copyWith(color: JColors.ink2)),
            const SizedBox(height: JSpace.s16),
            Row(
              children: [
                Expanded(
                  child: JButton(
                    label: confirmLabel,
                    onPressed: onConfirm,
                    expand: true,
                    variant: type == JDialogType.destructive ? JButtonVariant.danger : JButtonVariant.primary,
                  ),
                ),
                const SizedBox(width: JSpace.s12),
                Expanded(
                  child: JButton(
                    label: cancelLabel,
                    onPressed: onCancel,
                    expand: true,
                    variant: JButtonVariant.secondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Shows a [JDialog] over the 55% scrim. Resolves to true on confirm, false on cancel, null when dismissed.
Future<bool?> showJDialog(
  BuildContext context, {
  required String title,
  required String body,
  required String confirmLabel,
  required String cancelLabel,
  JDialogType type = JDialogType.normal,
}) {
  final direction = Directionality.of(context);
  return showDialog<bool>(
    context: context,
    barrierColor: JColors.scrim.withValues(alpha: 0.55),
    builder: (context) => Directionality(
      textDirection: direction,
      child: Center(
        child: JDialog(
          title: title,
          body: body,
          confirmLabel: confirmLabel,
          cancelLabel: cancelLabel,
          type: type,
          onConfirm: () => Navigator.of(context).pop(true),
          onCancel: () => Navigator.of(context).pop(false),
        ),
      ),
    ),
  );
}
