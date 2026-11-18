import 'package:flutter/services.dart';

/// Keeps digits only and turns Arabic-Indic (٠-٩) and Persian (۰-۹) digits into Latin (0-9).
String latinDigitsOnly(String input) {
  final out = StringBuffer();
  for (final c in input.runes) {
    if (c >= 0x30 && c <= 0x39) {
      out.writeCharCode(c);
    } else if (c >= 0x660 && c <= 0x669) {
      out.writeCharCode(c - 0x660 + 0x30);
    } else if (c >= 0x6F0 && c <= 0x6F9) {
      out.writeCharCode(c - 0x6F0 + 0x30);
    }
  }
  return out.toString();
}

/// Digits-only input with Arabic digits normalised, at most [maxLength] digits.
class JDigitsFormatter extends TextInputFormatter {
  const JDigitsFormatter(this.maxLength);

  final int maxLength;

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    var digits = latinDigitsOnly(newValue.text);
    if (digits.length > maxLength) digits = digits.substring(0, maxLength);
    return TextEditingValue(
      text: digits,
      selection: TextSelection.collapsed(offset: digits.length),
    );
  }
}
