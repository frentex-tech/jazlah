import 'dart:io' show Platform;

import 'package:flutter/services.dart';

/// Whether the native side has a Google Maps key. On iOS a Google map created without it crashes,
/// so the Dart key alone is not enough; Android shows a blank map instead, so it needs no check.
Future<bool> nativeMapsKeyReady() async {
  if (!Platform.isIOS) return true;
  try {
    return await const MethodChannel('jazlah/maps').invokeMethod<bool>('hasKey') ?? false;
  } on Object {
    return false;
  }
}
