import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';

enum JButtonVariant { primary, secondary, ghost, danger }

enum JButtonSize { l, s }

/// Figma `Button`: variant × state (default/pressed/disabled/loading) × size.
/// Disabled when [onPressed] is null; [loading] shows the spinner and ignores taps.
class JButton extends StatefulWidget {
  const JButton({
    required this.label,
    required this.onPressed,
    super.key,
    this.variant = JButtonVariant.primary,
    this.size = JButtonSize.l,
    this.loading = false,
    this.expand = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final JButtonVariant variant;
  final JButtonSize size;
  final bool loading;

  /// Full width (Figma `fill`), as the screens' main actions.
  final bool expand;

  @override
  State<JButton> createState() => _JButtonState();
}

class _JButtonState extends State<JButton> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed != value) setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null && !widget.loading;
    final disabled = widget.onPressed == null && !widget.loading;
    final pressed = _pressed && enabled;
    final large = widget.size == JButtonSize.l;

    final (Color? bg, Color? border, Color fg) = switch (widget.variant) {
      JButtonVariant.primary => (
        disabled ? JColors.sand : (pressed ? JColors.ember2 : JColors.ember),
        null,
        disabled ? JColors.mutedSoft : JColors.paper,
      ),
      JButtonVariant.danger => (
        disabled ? JColors.sand : (pressed ? JColors.dangerPressed : JColors.danger),
        null,
        disabled ? JColors.mutedSoft : JColors.paper,
      ),
      JButtonVariant.secondary => (
        pressed ? JColors.sand : JColors.paper,
        disabled ? JColors.line : JColors.ember,
        disabled ? JColors.mutedSoft : JColors.ember,
      ),
      JButtonVariant.ghost => (
        pressed ? JColors.sand : null,
        null,
        disabled ? JColors.mutedSoft : JColors.ember,
      ),
    };

    return Semantics(
      button: true,
      enabled: enabled,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: enabled ? (_) => _setPressed(true) : null,
        onTapUp: enabled ? (_) => _setPressed(false) : null,
        onTapCancel: enabled ? () => _setPressed(false) : null,
        onTap: enabled ? widget.onPressed : null,
        child: Container(
          height: large ? 52 : 36,
          width: widget.expand ? double.infinity : null,
          padding: EdgeInsetsDirectional.symmetric(horizontal: large ? JSpace.s24 : JSpace.s16),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(large ? JRadius.md : JRadius.sm),
            border: border == null ? null : Border.all(color: border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (widget.loading) ...[
                SizedBox.square(
                  dimension: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: fg),
                ),
                const SizedBox(width: JSpace.s8),
              ],
              Flexible(
                child: Text(
                  widget.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: (large ? JText.h3 : JText.labelM).copyWith(color: fg),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
