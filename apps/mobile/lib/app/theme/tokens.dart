import 'package:flutter/painting.dart';

/// Design tokens from `docs/design/tokens.json` (= the Figma variables).
/// `test/app/theme/tokens_test.dart` fails when this file and tokens.json differ.
abstract final class JColors {
  static const brand = Color(0xFF4A1014);
  static const brand2 = Color(0xFF6A1A20);
  static const brandDeep = Color(0xFF240709);
  static const gold = Color(0xFFC99A52);
  static const goldText = Color(0xFF8E6129);
  static const goldDeco = Color(0xFFB0823F);
  static const goldLight = Color(0xFFD9AE62);
  static const ember = Color(0xFF8E1F26);
  static const ember2 = Color(0xFF6E161C);
  static const bg = Color(0xFFF7F0E8);
  static const paper = Color(0xFFFFFBF7);
  static const sand = Color(0xFFEEDFD3);
  static const line = Color(0xFFE9D9CD);
  static const ink = Color(0xFF2A1215);
  static const ink2 = Color(0xFF55383A);
  static const muted = Color(0xFF806865);
  static const mutedSoft = Color(0xFF8E7470);
  static const success = Color(0xFF3F7A4E);
  static const info = Color(0xFF2B5566);
  static const danger = Color(0xFFB3261E);
  static const dangerPressed = Color(0xFF8E1F19);
  static const dangerBg = Color(0xFFFBE9E7);
  static const warning = Color(0xFF9A5B00);
  static const warningBg = Color(0xFFFFF1DC);
  static const infoBg = Color(0xFFE3EEF2);
  static const successBg = Color(0xFFE4F0E7);
  static const successText = Color(0xFF2C5E3A);
  static const goldBg = Color(0xFFF6EBD6);

  /// Used at 55% behind sheets and dialogs.
  static const scrim = Color(0xFF1A0A0D);

  /// Logo / emblem only.
  static const goldGradient = [Color(0xFFF7E6BC), Color(0xFFDDB46A), Color(0xFFAE7C37), Color(0xFFEBCB8C)];
}

abstract final class JRadius {
  static const double lg = 26;
  static const double md = 18;
  static const double sm = 12;
  static const double pill = 999;
}

/// `space/*` tokens.
abstract final class JSpace {
  static const double s4 = 4;
  static const double s8 = 8;
  static const double s12 = 12;
  static const double s16 = 16;
  static const double s20 = 20;
  static const double s24 = 24;
  static const double s32 = 32;
  static const double s40 = 40;
  static const double s48 = 48;
}

abstract final class JShadows {
  /// `Shadow/Card`.
  static const card = [
    BoxShadow(color: Color(0x0F2A1215), offset: Offset(0, 1), blurRadius: 2),
    BoxShadow(color: Color(0x2E2A1215), offset: Offset(0, 8), blurRadius: 24, spreadRadius: -12),
  ];
}
