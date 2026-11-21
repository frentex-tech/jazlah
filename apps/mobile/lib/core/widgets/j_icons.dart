import 'package:flutter/widgets.dart';

/// Phosphor icons used by the design system (spec `ph/<name>`; `-fill` = `…Fill`).
///
/// shortcut (no issue: a package upgrade, not an API gap): phosphor_flutter 2.1.0's Dart classes no longer compile on Flutter 3.44 (`IconData` is final),
/// so we point at the fonts that package still ships. Switch back to `PhosphorIconsRegular/Fill`
/// once a phosphor_flutter release builds on our Flutter. Add icons here with their codepoint from
/// phosphor_flutter's `phosphor_icons_regular.dart` / `phosphor_icons_fill.dart`.
abstract final class JIcons {
  static const pencilSimple = IconData(0xe3b4, fontFamily: _regular, fontPackage: _package);
  static const pawPrint = IconData(0xe648, fontFamily: _regular, fontPackage: _package);
  static const camera = IconData(0xe10e, fontFamily: _regular, fontPackage: _package);
  static const gear = IconData(0xe270, fontFamily: _regular, fontPackage: _package);
  static const chatCircleText = IconData(0xe16e, fontFamily: _regular, fontPackage: _package);
  static const signOut = IconData(0xe42a, fontFamily: _regular, fontPackage: _package);
  static const starFill = IconData(0xe46a, fontFamily: _fill, fontPackage: _package);
  static const crosshair = IconData(0xe1d6, fontFamily: _regular, fontPackage: _package);
  static const mapTrifold = IconData(0xe31a, fontFamily: _regular, fontPackage: _package);
  static const warning = IconData(0xe4e0, fontFamily: _regular, fontPackage: _package);
  static const check = IconData(0xe182, fontFamily: _regular, fontPackage: _package);
  static const storefront = IconData(0xe470, fontFamily: _regular, fontPackage: _package);
  static const plus = IconData(0xe3d4, fontFamily: _regular, fontPackage: _package);
  static const shoppingBag = IconData(0xe416, fontFamily: _regular, fontPackage: _package);
  static const receipt = IconData(0xe3ec, fontFamily: _regular, fontPackage: _package);
  static const magnifyingGlass = IconData(0xe30c, fontFamily: _regular, fontPackage: _package);
  static const warningCircle = IconData(0xe4e2, fontFamily: _regular, fontPackage: _package);
  static const wifiSlash = IconData(0xe4f2, fontFamily: _regular, fontPackage: _package);
  static const lockSimple = IconData(0xe308, fontFamily: _regular, fontPackage: _package);
  static const caretRight = IconData(0xe13a, fontFamily: _regular, fontPackage: _package);
  static const caretLeft = IconData(0xe138, fontFamily: _regular, fontPackage: _package);
  static const caretDown = IconData(0xe136, fontFamily: _regular, fontPackage: _package);
  static const caretUp = IconData(0xe13c, fontFamily: _regular, fontPackage: _package);
  static const info = IconData(0xe2ce, fontFamily: _regular, fontPackage: _package);
  static const minus = IconData(0xe32a, fontFamily: _regular, fontPackage: _package);
  static const prohibit = IconData(0xe3de, fontFamily: _regular, fontPackage: _package);
  static const trash = IconData(0xe4a6, fontFamily: _regular, fontPackage: _package);
  static const bell = IconData(0xe0ce, fontFamily: _regular, fontPackage: _package);
  static const x = IconData(0xe4f6, fontFamily: _regular, fontPackage: _package);
  static const slidersHorizontal = IconData(0xe434, fontFamily: _regular, fontPackage: _package);
  static const trendUp = IconData(0xe4ae, fontFamily: _regular, fontPackage: _package);
  static const house = IconData(0xe2c2, fontFamily: _regular, fontPackage: _package);
  static const squaresFour = IconData(0xe464, fontFamily: _regular, fontPackage: _package);
  static const user = IconData(0xe4c2, fontFamily: _regular, fontPackage: _package);
  static const truck = IconData(0xe4b4, fontFamily: _regular, fontPackage: _package);
  static const mapPin = IconData(0xe316, fontFamily: _regular, fontPackage: _package);
  static const sealCheck = IconData(0xe606, fontFamily: _regular, fontPackage: _package);
  static const thermometer = IconData(0xe5c6, fontFamily: _regular, fontPackage: _package);
  static const clock = IconData(0xe19a, fontFamily: _regular, fontPackage: _package);
  static const package = IconData(0xe390, fontFamily: _regular, fontPackage: _package);
  static const mapPinFill = IconData(0xe316, fontFamily: _fill, fontPackage: _package);
  static const storefrontFill = IconData(0xe470, fontFamily: _fill, fontPackage: _package);
  static const truckFill = IconData(0xe4b4, fontFamily: _fill, fontPackage: _package);
  static const checkCircleFill = IconData(0xe184, fontFamily: _fill, fontPackage: _package);
  static const xCircleFill = IconData(0xe4f8, fontFamily: _fill, fontPackage: _package);
  static const warningFill = IconData(0xe4e0, fontFamily: _fill, fontPackage: _package);
  static const infoFill = IconData(0xe2ce, fontFamily: _fill, fontPackage: _package);
  static const houseFill = IconData(0xe2c2, fontFamily: _fill, fontPackage: _package);
  static const squaresFourFill = IconData(0xe464, fontFamily: _fill, fontPackage: _package);
  static const receiptFill = IconData(0xe3ec, fontFamily: _fill, fontPackage: _package);
  static const userFill = IconData(0xe4c2, fontFamily: _fill, fontPackage: _package);

  static const _package = 'phosphor_flutter';
  static const _regular = 'PhosphorRegular';
  static const _fill = 'PhosphorFill';
}
