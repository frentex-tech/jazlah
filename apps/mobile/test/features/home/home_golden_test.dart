import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';

import '../../helpers/catalog_fakes.dart';
import '../../helpers/pump_screen.dart';

/// Photos decode on real threads, so whether they show by capture time varies: the golden fails every
/// photo load and pins the sand placeholders instead.
class _NoPhotos extends CachingAssetBundle {
  @override
  Future<ByteData> load(String key) =>
      key.endsWith('.jpg') ? Future.error(FlutterError('no photos in goldens')) : rootBundle.load(key);
}

/// The bundled fonts, so Arabic and the icons never fall back to the machine's fonts.
Future<void> _loadFonts() async {
  Future<void> load(String family, List<String> assets) async {
    final loader = FontLoader(family);
    for (final a in assets) {
      loader.addFont(rootBundle.load(a));
    }
    await loader.load();
  }

  await load('ReadexPro', [
    'assets/fonts/ReadexPro-Regular.ttf',
    'assets/fonts/ReadexPro-Medium.ttf',
    'assets/fonts/ReadexPro-Bold.ttf',
  ]);
  await load('ElMessiri', ['assets/fonts/ElMessiri-Bold.ttf']);
  await load('packages/phosphor_flutter/PhosphorRegular', ['packages/phosphor_flutter/lib/fonts/Phosphor.ttf']);
  await load('packages/phosphor_flutter/PhosphorFill', ['packages/phosphor_flutter/lib/fonts/Phosphor-Fill.ttf']);
}

void main() {
  setUpAll(_loadFonts);

  for (final lang in ['ar', 'en']) {
    testWidgets(
      'home layout ($lang)',
      // Text rasterises differently per OS: the goldens are made and checked on Linux (CI).
      skip: !Platform.isLinux,
      (t) async {
        await t.pumpScreen(
          DefaultAssetBundle(
            bundle: _NoPhotos(),
            child: const MainShell(location: Routes.home, child: HomeScreen()),
          ),
          overrides: catalogOverrides(FakeCatalog()),
          prefs: {'locale': lang, 'onboardingSeen': true},
        );
        await t.pump(const Duration(seconds: 1)); // feed and the location re-check
        await expectLater(find.byType(MaterialApp), matchesGoldenFile('goldens/home_$lang.png'));
      },
    );
  }
}
