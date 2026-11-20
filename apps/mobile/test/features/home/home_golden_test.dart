import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';

import '../../helpers/catalog_fakes.dart';
import '../../helpers/pump_screen.dart';

/// Goldens are made on macOS and checked on Linux CI: the test font (boxes) renders the same, but
/// anti-aliased edges can differ by a few pixels, so a tiny difference is allowed.
class _Tolerant extends LocalFileComparator {
  _Tolerant(super.testFile);

  @override
  Future<bool> compare(Uint8List imageBytes, Uri golden) async {
    final result = await GoldenFileComparator.compareLists(imageBytes, await getGoldenBytes(golden));
    if (result.passed || result.diffPercent <= 0.005) return true;
    throw FlutterError(await generateFailureOutput(result, golden, basedir));
  }
}

/// Photos decode on real threads, so whether they show by capture time varies: the golden fails every
/// photo load and pins the sand placeholders instead.
class _NoPhotos extends CachingAssetBundle {
  @override
  Future<ByteData> load(String key) =>
      key.endsWith('.jpg') ? Future.error(FlutterError('no photos in goldens')) : rootBundle.load(key);
}

void main() {
  setUpAll(() {
    final previous = goldenFileComparator as LocalFileComparator;
    goldenFileComparator = _Tolerant(previous.basedir.resolve('home_golden_test.dart'));
  });

  for (final lang in ['ar', 'en']) {
    testWidgets('home layout ($lang)', (t) async {
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
    });
  }
}
