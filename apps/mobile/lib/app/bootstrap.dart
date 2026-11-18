import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/app.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/config/native_maps.dart';
import 'package:jazlah/core/storage/prefs.dart';

Future<void> bootstrap(Flavor flavor) async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await Prefs.load();
  final nativeMapsKey = await nativeMapsKeyReady();
  runApp(
    ProviderScope(
      overrides: [
        envProvider.overrideWithValue(Env(flavor, nativeMapsKey: nativeMapsKey)),
        prefsProvider.overrideWithValue(prefs),
      ],
      child: const JazlahApp(),
    ),
  );
}
