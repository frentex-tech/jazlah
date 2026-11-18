import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';

final deviceLocationProvider = Provider<DeviceLocation>(
  (ref) => Env.useMocks ? MockDeviceLocation() : GeolocatorDeviceLocation(),
);

/// Google with a Maps key; offline sample places otherwise (the map is the mock map then too).
final geocoderProvider = Provider<Geocoder>(
  (ref) => Env.googleMapsApiKey.isNotEmpty && !Env.useMocks ? GoogleGeocoder(Env.googleMapsApiKey) : MockGeocoder(),
);

/// shortcut: always the mock until LOC-API-1 (#24) ships the coverage check.
final coverageRepositoryProvider = Provider<CoverageRepository>((ref) => MockCoverageRepository());

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
}
