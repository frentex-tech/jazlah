import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/j_digits.dart';
import 'package:jazlah/core/widgets/j_text_field.dart';

/// Saudi mobile mask `5X XXX XXXX`: digits only, Arabic digits normalised,
/// a pasted `+966…` / `05…` prefix dropped, at most 9 digits.
class JSaudiPhoneFormatter extends TextInputFormatter {
  const JSaudiPhoneFormatter();

  /// The 9 national digits of a masked value.
  static String digitsOf(String masked) => latinDigitsOnly(masked);

  static String format(String input) {
    var d = latinDigitsOnly(input);
    if (d.startsWith('966') && d.length > 9) d = d.substring(3);
    if (d.startsWith('0')) d = d.substring(1);
    if (d.length > 9) d = d.substring(0, 9);
    final out = StringBuffer();
    for (var i = 0; i < d.length; i++) {
      if (i == 2 || i == 5) out.write(' ');
      out.write(d[i]);
    }
    return out.toString();
  }

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final text = format(newValue.text);
    // shortcut (no issue: UX note): the caret always jumps to the end; fine for a 9-digit field, upgrade if mid-text edits matter.
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}

/// Figma `Phone input`: +966 prefix box and the masked number; default / error / disabled.
/// [onChanged] gets the bare national digits (up to 9).
class JPhoneField extends StatefulWidget {
  const JPhoneField({
    super.key,
    this.label,
    this.helperText,
    this.errorText,
    this.controller,
    this.focusNode,
    this.enabled = true,
    this.onChanged,
    this.onSubmitted,
  });

  final String? label;
  final String? helperText;
  final String? errorText;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final bool enabled;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  /// The hint shown in the empty field (a format, the same in every language).
  static const placeholder = '5X XXX XXXX';

  @override
  State<JPhoneField> createState() => _JPhoneFieldState();
}

class _JPhoneFieldState extends State<JPhoneField> {
  @override
  Widget build(BuildContext context) {
    final enabled = widget.enabled;
    return jFieldColumn(
      label: widget.label,
      helperText: widget.helperText,
      errorText: widget.errorText,
      field: SizedBox(
        height: 52,
        child: Row(
          children: [
            Container(
              width: 88,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: JColors.sand,
                borderRadius: BorderRadius.circular(JRadius.sm),
                border: Border.all(color: JColors.line),
              ),
              child: Text(
                '+966',
                textDirection: TextDirection.ltr,
                style: JText.labelM.copyWith(color: enabled ? JColors.ink : JColors.mutedSoft),
              ),
            ),
            const SizedBox(width: JSpace.s8),
            Expanded(
              child: Container(
                alignment: AlignmentDirectional.centerStart,
                padding: const EdgeInsetsDirectional.symmetric(horizontal: JSpace.s16),
                // The DS Phone input has no focused variant (default / error / disabled only).
                decoration: jFieldDecoration(
                  error: widget.errorText != null,
                  disabled: !enabled,
                ),
                // Phone numbers read left to right in both languages (spec: align left).
                child: Directionality(
                  textDirection: TextDirection.ltr,
                  child: TextField(
                    controller: widget.controller,
                    focusNode: widget.focusNode,
                    enabled: enabled,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.done,
                    autofillHints: const [AutofillHints.telephoneNumberNational],
                    inputFormatters: const [JSaudiPhoneFormatter()],
                    onChanged: widget.onChanged == null
                        ? null
                        : (v) => widget.onChanged!(JSaudiPhoneFormatter.digitsOf(v)),
                    onSubmitted: widget.onSubmitted == null
                        ? null
                        : (v) => widget.onSubmitted!(JSaudiPhoneFormatter.digitsOf(v)),
                    style: JText.bodyL.copyWith(color: enabled ? JColors.ink : JColors.mutedSoft),
                    decoration: InputDecoration.collapsed(
                      hintText: JPhoneField.placeholder,
                      hintStyle: JText.bodyL.copyWith(color: enabled ? JColors.muted : JColors.mutedSoft),
                    ),
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
