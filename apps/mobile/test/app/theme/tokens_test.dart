import 'dart:convert';
import 'dart:io';

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/theme/tokens.dart';

/// tokens.dart must equal docs/design/tokens.json (the Figma variables).
void main() {
  final json = jsonDecode(File('../../docs/design/tokens.json').readAsStringSync()) as Map<String, dynamic>;

  const colors = <String, Color>{
    'brand': JColors.brand,
    'brand-2': JColors.brand2,
    'brand-deep': JColors.brandDeep,
    'gold': JColors.gold,
    'gold-text': JColors.goldText,
    'gold-deco': JColors.goldDeco,
    'gold-light': JColors.goldLight,
    'ember': JColors.ember,
    'ember-2': JColors.ember2,
    'bg': JColors.bg,
    'paper': JColors.paper,
    'sand': JColors.sand,
    'line': JColors.line,
    'ink': JColors.ink,
    'ink-2': JColors.ink2,
    'muted': JColors.muted,
    'muted-soft': JColors.mutedSoft,
    'success': JColors.success,
    'info': JColors.info,
    'danger': JColors.danger,
    'danger-pressed': JColors.dangerPressed,
    'danger-bg': JColors.dangerBg,
    'warning': JColors.warning,
    'warning-bg': JColors.warningBg,
    'info-bg': JColors.infoBg,
    'success-bg': JColors.successBg,
    'success-text': JColors.successText,
    'gold-bg': JColors.goldBg,
    'scrim': JColors.scrim,
  };

  String hex(Color c) => '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

  test('every color token matches', () {
    final source = json['color'] as Map<String, dynamic>;
    for (final entry in source.entries) {
      final value = (entry.value as Map<String, dynamic>)['value'];
      if (value is! String) continue; // gradient
      expect(colors.containsKey(entry.key), isTrue, reason: 'missing JColors for ${entry.key}');
      expect(hex(colors[entry.key]!), value.toUpperCase(), reason: entry.key);
    }
    expect(JColors.goldGradient.map(hex), (source['gold-gradient'] as Map)['value']);
  });

  test('radius and spacing match', () {
    final r = json['radius'] as Map<String, dynamic>;
    expect([JRadius.lg, JRadius.md, JRadius.sm, JRadius.pill], [r['lg'], r['md'], r['sm'], r['pill']]);
    expect(
      [JSpace.s4, JSpace.s8, JSpace.s12, JSpace.s16, JSpace.s20, JSpace.s24, JSpace.s32, JSpace.s40, JSpace.s48],
      (json['spacing'] as Map<String, dynamic>)['scale'],
    );
  });
}
