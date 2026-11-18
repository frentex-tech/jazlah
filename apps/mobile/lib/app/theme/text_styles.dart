import 'package:flutter/painting.dart';

import 'package:jazlah/app/theme/tokens.dart';

/// The 9 Figma text styles. Sizes, weights and line heights are Figma's;
/// the families are the build fonts from tokens.json (`font.*.family`).
/// The same styles serve Arabic and English: Readex Pro and El Messiri cover both scripts.
abstract final class JText {
  static const bodyFamily = 'ReadexPro';
  static const displayFamily = 'ElMessiri';

  static const TextLeadingDistribution _even = TextLeadingDistribution.even;

  static const caption = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 12,
    height: 1.5,
    fontWeight: FontWeight.w400,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const displayXl = TextStyle(
    fontFamily: displayFamily,
    fontSize: 36,
    height: 1.3,
    fontWeight: FontWeight.w700,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const displayL = TextStyle(
    fontFamily: displayFamily,
    fontSize: 28,
    height: 1.3,
    fontWeight: FontWeight.w700,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const h1 = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 24,
    height: 1.5,
    fontWeight: FontWeight.w700,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const h2 = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 20,
    height: 1.5,
    fontWeight: FontWeight.w700,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const h3 = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 18,
    height: 1.5,
    fontWeight: FontWeight.w500,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const bodyL = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 16,
    height: 1.6,
    fontWeight: FontWeight.w400,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const bodyM = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 14,
    height: 1.6,
    fontWeight: FontWeight.w400,
    leadingDistribution: _even,
    color: JColors.ink,
  );
  static const labelM = TextStyle(
    fontFamily: bodyFamily,
    fontSize: 14,
    height: 1.5,
    fontWeight: FontWeight.w500,
    leadingDistribution: _even,
    color: JColors.ink,
  );

  /// Text in the specs without a named style (`size`/`font` only, line height auto).
  static TextStyle raw(double size, FontWeight weight, {Color color = JColors.ink}) => TextStyle(
    fontFamily: bodyFamily,
    fontSize: size,
    fontWeight: weight,
    color: color,
  );
}
