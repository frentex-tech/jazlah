import 'package:flutter/material.dart';

import 'package:jazlah/app/theme/text_styles.dart';
import 'package:jazlah/app/theme/tokens.dart';

export 'text_styles.dart';
export 'tokens.dart';

ThemeData buildJazlahTheme() {
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: JColors.ember,
    onPrimary: JColors.paper,
    secondary: JColors.gold,
    onSecondary: JColors.ink,
    error: JColors.danger,
    onError: JColors.paper,
    surface: JColors.paper,
    onSurface: JColors.ink,
    surfaceContainerHighest: JColors.sand,
    outline: JColors.line,
    scrim: JColors.scrim,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: JColors.bg,
    fontFamily: JText.bodyFamily,
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
    textTheme: const TextTheme(
      displayLarge: JText.displayXl,
      displayMedium: JText.displayL,
      headlineLarge: JText.h1,
      headlineMedium: JText.h2,
      headlineSmall: JText.h3,
      titleMedium: JText.h3,
      bodyLarge: JText.bodyL,
      bodyMedium: JText.bodyM,
      labelLarge: JText.labelM,
      bodySmall: JText.caption,
    ),
    textSelectionTheme: const TextSelectionThemeData(cursorColor: JColors.ember),
    dividerTheme: const DividerThemeData(color: JColors.line, thickness: 1, space: 1),
  );
}
