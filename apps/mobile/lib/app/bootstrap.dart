import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/app.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/config/native_maps.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/storage/token_storage.dart';

Future<void> bootstrap(Flavor flavor) async {
  WidgetsFlutterBinding.ensureInitialized();
  final env = Env(flavor, nativeMapsKey: await nativeMapsKeyReady())..validate();
  final prefs = await Prefs.load();
  if (!prefs.installed) {
    try {
      await TokenStorage().clear(); // tokens left in the iOS keychain by an earlier install
      await prefs.setInstalled();
    } on Object {
      // The keychain refused: try again on the next start.
    }
  }
  runApp(
    ProviderScope(
      overrides: [
        envProvider.overrideWithValue(env),
        prefsProvider.overrideWithValue(prefs),
      ],
      child: const JazlahApp(),
    ),
  );
}
