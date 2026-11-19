/// Build flavor, set by `main_<flavor>.dart`.
enum Flavor { dev, staging, prod }

/// Values from `--dart-define-from-file=config/<flavor>.json` (see config/README.md).
class Env {
  const Env(this.flavor, {this.nativeMapsKey = false});

  final Flavor flavor;

  /// The native Maps key is set too (iOS checks it over a channel at start-up).
  final bool nativeMapsKey;

  static const _apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const useMocks = bool.fromEnvironment('USE_MOCKS');
  static const googleMapsApiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
  static const _initialRoute = String.fromEnvironment('INITIAL_ROUTE');

  /// Host only: the paths in openapi.json already start with `/v1`. The localhost default is for dev only.
  String get apiBaseUrl => _apiBaseUrl.isNotEmpty ? _apiBaseUrl : 'http://localhost:3000';

  /// Release check, run at start-up: a misconfigured staging or prod build stops at once instead of
  /// failing every call (or, in prod, pinning addresses on the mock map).
  void validate() {
    if (flavor == Flavor.prod && useMocks) throw StateError('USE_MOCKS must be false for prod');
    if (flavor == Flavor.dev || useMocks) return; // mock builds call no API
    if (!_apiBaseUrl.startsWith('https://')) {
      throw StateError('API_BASE_URL must be an https URL for ${flavor.name} (config/${flavor.name}.json)');
    }
    if (flavor == Flavor.prod && googleMapsApiKey.isEmpty) {
      throw StateError('GOOGLE_MAPS_API_KEY is required for prod (config/prod.json)');
    }
  }

  /// Both the Dart and the native key are set: only then is a Google map created.
  bool get hasMapsKey => googleMapsApiKey.isNotEmpty && nativeMapsKey;

  /// Sample places (the mock geocoder) are only for mocks and dev; real builds never invent an address.
  bool get allowsFakeGeocoding => useMocks || flavor == Flavor.dev;

  /// The debug-only widget gallery is reachable outside production.
  bool get showGallery => flavor != Flavor.prod;

  /// Opens the app on a route (design QA on a simulator). Ignored in prod.
  String get initialRoute => flavor != Flavor.prod && _initialRoute.isNotEmpty ? _initialRoute : '/';
}
