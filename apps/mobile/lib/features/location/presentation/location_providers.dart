import 'dart:convert';

import 'package:flutter/foundation.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';

final deviceLocationProvider = Provider<DeviceLocation>(
  (ref) => Env.useMocks ? MockDeviceLocation() : GeolocatorDeviceLocation(),
);

/// Google with a Maps key; sample places for mocks and dev; nothing (manual entry) in a real build
/// that is missing the key.
final geocoderProvider = Provider<Geocoder>((ref) {
  final env = ref.watch(envProvider);
  if (Env.googleMapsApiKey.isNotEmpty && !Env.useMocks) return GoogleGeocoder(Env.googleMapsApiKey);
  if (env.allowsFakeGeocoding) return MockGeocoder();
  debugPrint('GOOGLE_MAPS_API_KEY is missing: addresses are typed by hand (see config/README.md)');
  return NoKeyGeocoder();
});

final coverageRepositoryProvider = Provider<CoverageRepository>(
  (ref) => Env.useMocks ? MockCoverageRepository() : ApiCoverageRepository(ref.watch(apiProvider)),
);

final selectedLocationProvider = NotifierProvider<SelectedLocationController, SelectedLocation?>(
  SelectedLocationController.new,
);

class SelectedLocationController extends Notifier<SelectedLocation?> {
  static const _key = 'location.selected';

  @override
  SelectedLocation? build() {
    final raw = ref.watch(prefsProvider).getString(_key);
    if (raw == null) return null;
    try {
      return SelectedLocation.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } on Object {
      return null;
    }
  }

  Future<void> select(SelectedLocation location) async {
    await ref.read(prefsProvider).setString(_key, jsonEncode(location.toJson()));
    state = location;
  }

  /// Zones change on the server (coverage.md): ask again on start-up and resume. A failed check keeps
  /// the last answer.
  Future<void> recheck() async {
    final current = state;
    if (current == null) return;
    try {
      final coverage = await ref.read(coverageRepositoryProvider).check(current.point);
      if (state != current || coverage.covered == current.covered) return;
      await select(SelectedLocation(point: current.point, line: current.line, covered: coverage.covered));
    } on Object {
      return;
    }
  }
}
