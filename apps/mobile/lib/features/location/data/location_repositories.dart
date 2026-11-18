import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';

import 'package:jazlah/features/location/domain/location.dart';

/// The device's position and its permission.
abstract interface class DeviceLocation {
  Future<LocationAccess> access();

  /// Shows the OS prompt (after the app's own explanation).
  Future<LocationAccess> request();

  Future<GeoPoint> current();

  Future<void> openSettings();

  /// The device's location services switch (when services are off).
  Future<void> openLocationSettings();
}

class GeolocatorDeviceLocation implements DeviceLocation {
  LocationAccess _map(LocationPermission p) => switch (p) {
    LocationPermission.always || LocationPermission.whileInUse => LocationAccess.granted,
    LocationPermission.denied => LocationAccess.denied,
    LocationPermission.deniedForever => LocationAccess.deniedForever,
    LocationPermission.unableToDetermine => LocationAccess.notAsked,
  };

  @override
  Future<LocationAccess> access() async {
    if (!await Geolocator.isLocationServiceEnabled()) return LocationAccess.serviceOff;
    final p = await Geolocator.checkPermission();
    // Android reports `denied` both before the first prompt and after a refusal; `request()` tells them apart.
    return p == LocationPermission.denied ? LocationAccess.notAsked : _map(p);
  }

  @override
  Future<LocationAccess> request() async => _map(await Geolocator.requestPermission());

  @override
  Future<GeoPoint> current() async {
    final p = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 15)),
    );
    return GeoPoint(p.latitude, p.longitude);
  }

  @override
  Future<void> openSettings() => Geolocator.openAppSettings();

  @override
  Future<void> openLocationSettings() => Geolocator.openLocationSettings();
}

/// Reverse geocoding (pin → district/street) and place search.
abstract interface class Geocoder {
  Future<PlaceAddress> reverse(GeoPoint point, String language);

  Future<List<PlaceSuggestion>> search(String query, String language);
}

/// Google Geocoding API with the Maps key.
/// shortcut: called from the device with a key that cannot be app-restricted; move behind the API
/// (a /v1/public geocoding route) when the backend offers one.
class GoogleGeocoder implements Geocoder {
  GoogleGeocoder(this._key, [Dio? dio])
    : _dio = dio ?? Dio(BaseOptions(baseUrl: 'https://maps.googleapis.com/maps/api/geocode/'));

  final String _key;
  final Dio _dio;

  Future<List<dynamic>> _get(Map<String, String> query) async {
    final res = await _dio.get<Map<String, dynamic>>('json', queryParameters: {...query, 'key': _key});
    final status = res.data?['status'];
    if (status != 'OK' && status != 'ZERO_RESULTS') throw StateError('geocoding: $status');
    return res.data!['results'] as List<dynamic>;
  }

  @override
  Future<PlaceAddress> reverse(GeoPoint point, String language) async {
    final results = await _get({'latlng': '${point.latitude},${point.longitude}', 'language': language});
    if (results.isEmpty) throw StateError('geocoding: no address');
    String? part(String type) {
      for (final r in results) {
        for (final c in (r as Map)['address_components'] as List) {
          if (((c as Map)['types'] as List).contains(type)) return c['long_name'] as String;
        }
      }
      return null;
    }

    return PlaceAddress(
      city: part('locality'),
      district: part('sublocality') ?? part('neighborhood'),
      street: part('route'),
    );
  }

  @override
  Future<List<PlaceSuggestion>> search(String query, String language) async {
    final results = await _get({'address': query, 'components': 'country:SA', 'language': language});
    return [
      for (final r in results.take(5))
        PlaceSuggestion(
          label: (r as Map)['formatted_address'] as String,
          point: GeoPoint(
            (((r['geometry'] as Map)['location'] as Map)['lat'] as num).toDouble(),
            (((r['geometry'] as Map)['location'] as Map)['lng'] as num).toDouble(),
          ),
        ),
    ];
  }
}

/// Delivery zones (docs/frontend/coverage.md).
abstract interface class CoverageRepository {
  Future<Coverage> check(GeoPoint point);

  /// The cities served today, for the out-of-coverage screen.
  Future<List<String>> cities(String language);
}

/// `GET /v1/public/coverage/check` (no token, so it works before sign-in).
class ApiCoverageRepository implements CoverageRepository {
  ApiCoverageRepository(this._api);

  final JazlaApi _api;

  @override
  Future<Coverage> check(GeoPoint p) async {
    try {
      final res = await _api.getPublicCoverageApi().publicCheckCoverage(lat: p.latitude, lng: p.longitude);
      final body = res.data!;
      return Coverage(covered: body.covered, zoneName: body.zone?.name.ar);
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  /// shortcut: the API has no public list of served cities; the out-of-coverage screen shows these
  /// until one exists (ask the backend team for `GET /v1/public/coverage/cities` or similar).
  @override
  Future<List<String>> cities(String language) => MockCoverageRepository().cities(language);
}

/// Rough boxes around Riyadh, Jeddah and Dammam: for USE_MOCKS and tests.
class MockCoverageRepository implements CoverageRepository {
  static const List<({String ar, String en, double south, double west, double north, double east})> _zones = [
    (ar: 'الرياض', en: 'Riyadh', south: 24.40, west: 46.40, north: 25.05, east: 47.05),
    (ar: 'جدة', en: 'Jeddah', south: 21.30, west: 39.05, north: 21.80, east: 39.35),
    (ar: 'الدمام', en: 'Dammam', south: 26.25, west: 49.90, north: 26.55, east: 50.25),
  ];

  @override
  Future<Coverage> check(GeoPoint p) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    for (final z in _zones) {
      if (p.latitude >= z.south && p.latitude <= z.north && p.longitude >= z.west && p.longitude <= z.east) {
        return Coverage(covered: true, zoneName: z.ar);
      }
    }
    return const Coverage(covered: false);
  }

  @override
  Future<List<String>> cities(String language) async => [for (final z in _zones) language == 'en' ? z.en : z.ar];
}

/// Offline device location and geocoding for USE_MOCKS, tests, and builds without a Maps key.
class MockDeviceLocation implements DeviceLocation {
  MockDeviceLocation({this.state = LocationAccess.notAsked, this.position = const GeoPoint(24.8168, 46.6195)});

  LocationAccess state;
  final GeoPoint position;

  @override
  Future<LocationAccess> access() async => state;

  @override
  Future<LocationAccess> request() async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    return state = LocationAccess.granted;
  }

  @override
  Future<GeoPoint> current() async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    return position;
  }

  @override
  Future<void> openSettings() async {}

  @override
  Future<void> openLocationSettings() async {}
}

class MockGeocoder implements Geocoder {
  static const List<({String ar, String en, double lat, double lng})> _places = [
    (ar: 'حي الملقا، شارع أنس بن مالك', en: 'Al Malqa, Anas Ibn Malik St', lat: 24.8168, lng: 46.6195),
    (ar: 'حي الملقا، الرياض', en: 'Al Malqa, Riyadh', lat: 24.8100, lng: 46.6100),
    (ar: 'ملقا مول، الرياض', en: 'Malqa Mall, Riyadh', lat: 24.8050, lng: 46.6250),
    (ar: 'حي النرجس، طريق أبو بكر الصديق', en: 'An Narjis, Abu Bakr As Siddiq Rd', lat: 24.8400, lng: 46.6600),
  ];

  @override
  Future<PlaceAddress> reverse(GeoPoint p, String language) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final near = _places.reduce(
      (a, b) =>
          ((a.lat - p.latitude).abs() + (a.lng - p.longitude).abs()) <=
              ((b.lat - p.latitude).abs() + (b.lng - p.longitude).abs())
          ? a
          : b,
    );
    final parts = (language == 'en' ? near.en : near.ar).split(language == 'en' ? ', ' : '، ');
    return PlaceAddress(city: language == 'en' ? 'Riyadh' : 'الرياض', district: parts.first, street: parts.last);
  }

  @override
  Future<List<PlaceSuggestion>> search(String query, String language) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    final q = query.trim();
    return [
      for (final p in _places)
        if ((language == 'en' ? p.en : p.ar).toLowerCase().contains(q.toLowerCase()) || q.length < 2)
          PlaceSuggestion(label: language == 'en' ? p.en : p.ar, point: GeoPoint(p.lat, p.lng)),
    ].take(3).toList();
  }
}
