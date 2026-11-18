import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_digits.dart';

/// Figma `OTP field`: one box per digit; default / filled / error.
/// One hidden text field drives the boxes, so typing, paste and SMS autofill all work;
/// Arabic digits are normalised to Latin. Clear it with `controller.clear()`.
class JOtpField extends StatefulWidget {
  const JOtpField({
    super.key,
    this.length = 6,
    this.controller,
    this.focusNode,
    this.errorText,
    this.autofocus = false,
    this.enabled = true,
    this.onChanged,
    this.onCompleted,
  });

  final int length;
  final TextEditingController? controller;
  final FocusNode? focusNode;

  /// Non-null switches to the error state and shows the text under the boxes.
  final String? errorText;
  final bool autofocus;
  final bool enabled;
  final ValueChanged<String>? onChanged;

  /// Called with the Latin-digit code once all [length] digits are in.
  final ValueChanged<String>? onCompleted;

  @override
  State<JOtpField> createState() => _JOtpFieldState();
}

class _JOtpFieldState extends State<JOtpField> {
  TextEditingController? _ownController;
  FocusNode? _ownFocus;
  TextEditingController get _controller => widget.controller ?? (_ownController ??= TextEditingController());
  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _controller.addListener(_rebuild);
    _focus.addListener(_rebuild);
  }

  @override
  void didUpdateWidget(JOtpField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      (oldWidget.controller ?? _ownController)?.removeListener(_rebuild);
      _controller.addListener(_rebuild);
    }
    if (oldWidget.focusNode != widget.focusNode) {
      (oldWidget.focusNode ?? _ownFocus)?.removeListener(_rebuild);
      _focus.addListener(_rebuild);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_rebuild);
    _focus.removeListener(_rebuild);
    _ownController?.dispose();
    _ownFocus?.dispose();
    super.dispose();
  }

  void _rebuild() => setState(() {});

  void _onChanged(String code) {
    widget.onChanged?.call(code);
    if (code.length == widget.length) widget.onCompleted?.call(code);
  }

  @override
  Widget build(BuildContext context) {
    final code = _controller.text;
    final error = widget.errorText != null;
    final boxes = LayoutBuilder(
      builder: (context, constraints) {
        // Figma: 56-wide cells, gap 12. When they don't fit (e.g. 6 cells on a phone), cells shrink
        // equally and the gap shrinks with them down to 8.
        final n = widget.length;
        final scale = math.min(1, constraints.maxWidth / (n * 56 + (n - 1) * JSpace.s12));
        final gap = math.max(JSpace.s8, JSpace.s12 * scale);
        final cellWidth = math.min(56, (constraints.maxWidth - gap * (n - 1)) / n).toDouble();
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < n; i++) ...[
              if (i > 0) SizedBox(width: gap),
              _cell(i, code, error, cellWidth),
            ],
          ],
        );
      },
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // The code reads left to right in both languages.
        Directionality(
          textDirection: TextDirection.ltr,
          child: Stack(
            alignment: Alignment.center,
            children: [
              boxes,
              Positioned.fill(
                child: Opacity(
                  opacity: 0,
                  child: TextField(
                    controller: _controller,
                    focusNode: _focus,
                    autofocus: widget.autofocus,
                    enabled: widget.enabled,
                    keyboardType: TextInputType.number,
                    autofillHints: const [AutofillHints.oneTimeCode],
                    inputFormatters: [JDigitsFormatter(widget.length)],
                    showCursor: false,
                    onChanged: _onChanged,
                    style: const TextStyle(color: Colors.transparent),
                    decoration: const InputDecoration.collapsed(hintText: null),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (error) ...[
          const SizedBox(height: JSpace.s8),
          Text(
            widget.errorText!,
            textAlign: TextAlign.center,
            style: JText.bodyM.copyWith(color: JColors.danger),
          ),
        ],
      ],
    );
  }

  Widget _cell(int i, String code, bool error, double width) {
    final active =
        !error && _focus.hasFocus && i == math.min(code.length, widget.length - 1) && code.length < widget.length;
    return Container(
      width: width,
      height: 64,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: error ? JColors.dangerBg : JColors.paper,
        borderRadius: BorderRadius.circular(JRadius.md),
        border: error
            ? Border.all(color: JColors.danger)
            : active
            ? Border.all(color: JColors.ember, width: 2)
            : Border.all(color: JColors.line),
      ),
      child: i < code.length ? Text(code[i], style: JText.h1) : null,
    );
  }
}
