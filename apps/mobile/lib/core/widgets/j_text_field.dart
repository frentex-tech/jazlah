import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jazlah/app/theme/theme.dart';

/// The field box shared by Input and Phone input: default / focused / error / disabled.
BoxDecoration jFieldDecoration({bool focused = false, bool error = false, bool disabled = false}) {
  if (disabled) {
    return BoxDecoration(
      color: JColors.sand,
      borderRadius: BorderRadius.circular(JRadius.sm),
      border: Border.all(color: JColors.line),
    );
  }
  if (error) {
    return BoxDecoration(
      color: JColors.dangerBg,
      borderRadius: BorderRadius.circular(JRadius.sm),
      border: Border.all(color: JColors.danger),
    );
  }
  return BoxDecoration(
    color: JColors.paper,
    borderRadius: BorderRadius.circular(JRadius.sm),
    border: focused ? Border.all(color: JColors.ember, width: 2) : Border.all(color: JColors.line),
  );
}

/// Label above, field, helper or error text below (Figma col, gap 8, start aligned).
Widget jFieldColumn({required Widget field, String? label, String? helperText, String? errorText}) {
  final below = errorText ?? helperText;
  return Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      if (label != null) ...[
        Text(label, style: JText.labelM.copyWith(color: JColors.ink2)),
        const SizedBox(height: JSpace.s8),
      ],
      field,
      if (below != null) ...[
        const SizedBox(height: JSpace.s8),
        Text(below, style: JText.bodyM.copyWith(color: errorText != null ? JColors.danger : JColors.muted)),
      ],
    ],
  );
}

/// Figma `Input`: default / focused / filled / error / disabled.
/// [placeholder] is the grey text inside the field, [helperText] the text below it;
/// a non-null [errorText] switches to the error state and replaces the helper.
class JTextField extends StatefulWidget {
  const JTextField({
    super.key,
    this.label,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.controller,
    this.focusNode,
    this.keyboardType,
    this.textInputAction,
    this.inputFormatters,
    this.autofillHints,
    this.maxLines = 1,
    this.enabled = true,
    this.obscureText = false,
    this.onChanged,
    this.onSubmitted,
  });

  final String? label;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final List<TextInputFormatter>? inputFormatters;
  final Iterable<String>? autofillHints;
  final int? maxLines;
  final bool enabled;
  final bool obscureText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<JTextField> createState() => _JTextFieldState();
}

class _JTextFieldState extends State<JTextField> {
  FocusNode? _ownFocus;
  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _focus.addListener(_onFocus);
  }

  @override
  void didUpdateWidget(JTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownFocus)?.removeListener(_onFocus);
      _focus.addListener(_onFocus);
    }
  }

  @override
  void dispose() {
    _focus.removeListener(_onFocus);
    _ownFocus?.dispose();
    super.dispose();
  }

  void _onFocus() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final single = widget.maxLines == 1;
    return jFieldColumn(
      label: widget.label,
      helperText: widget.helperText,
      errorText: widget.errorText,
      field: Container(
        constraints: const BoxConstraints(minHeight: 52),
        alignment: AlignmentDirectional.centerStart,
        padding: EdgeInsetsDirectional.symmetric(horizontal: JSpace.s16, vertical: single ? 0 : JSpace.s12),
        decoration: jFieldDecoration(
          focused: _focus.hasFocus,
          error: widget.errorText != null,
          disabled: !widget.enabled,
        ),
        child: TextField(
          controller: widget.controller,
          focusNode: _focus,
          enabled: widget.enabled,
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          inputFormatters: widget.inputFormatters,
          autofillHints: widget.autofillHints,
          maxLines: widget.maxLines,
          obscureText: widget.obscureText,
          onChanged: widget.onChanged,
          onSubmitted: widget.onSubmitted,
          style: JText.bodyL.copyWith(color: widget.enabled ? JColors.ink : JColors.mutedSoft),
          decoration: InputDecoration.collapsed(
            hintText: widget.placeholder,
            hintStyle: JText.bodyL.copyWith(color: widget.enabled ? JColors.muted : JColors.mutedSoft),
          ),
        ),
      ),
    );
  }
}
