import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/gallery/gallery_screen.dart';
import 'package:jazlah/l10n/app_localizations.dart';

void main() {
  for (final lang in ['ar', 'en']) {
    testWidgets('gallery renders every widget in $lang without exceptions', (tester) async {
      // Tall surface: the gallery is one long non-lazy column, so every widget lays out.
      await tester.binding.setSurfaceSize(const Size(390, 20000));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        MaterialApp(
          theme: buildJazlahTheme(),
          locale: Locale(lang),
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: const GalleryScreen(),
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull);

      // The language toggle switches the gallery itself.
      await tester.tap(find.text(lang == 'ar' ? 'English' : 'العربية'));
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.text(lang == 'ar' ? 'Widget gallery' : 'معرض المكوّنات'), findsOneWidget);
    });
  }
}
