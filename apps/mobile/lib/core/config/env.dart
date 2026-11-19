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

  /// Host only: the paths in openapi.json already start with `/v1`.
  String get apiBaseUrl => _apiBaseUrl.isNotEmpty ? _apiBaseUrl : 'http://localhost:3000';

  /// Both the Dart and the native key are set: only then is a Google map created.
  bool get hasMapsKey => googleMapsApiKey.isNotEmpty && nativeMapsKey;

  /// Sample places (the mock geocoder) are only for mocks and dev; real builds never invent an address.
  bool get allowsFakeGeocoding => useMocks || flavor == Flavor.dev;

  /// The debug-only widget gallery is reachable outside production.
  bool get showGallery => flavor != Flavor.prod;

  /// Opens the app on a route (design QA on a simulator). Ignored in prod.
  String get initialRoute => flavor != Flavor.prod && _initialRoute.isNotEmpty ? _initialRoute : '/';
}
