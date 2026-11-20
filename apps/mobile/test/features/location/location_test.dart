import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../helpers/pump_screen.dart';

class _RefusingDevice extends MockDeviceLocation {
  _RefusingDevice() : super();

  @override
  Future<LocationAccess> request() async => state = LocationAccess.denied;
}

class _FailingGeocoder extends MockGeocoder {
  @override
  Future<PlaceAddress> reverse(GeoPoint p, String language) => Future.error(StateError('geocoding: OVER_QUERY_LIMIT'));
}

class _FailingCoverage extends MockCoverageRepository {
  @override
  Future<Coverage> check(GeoPoint p) => Future.error(StateError('offline'));
}

List<dynamic> _o(DeviceLocation device, {Geocoder? geocoder, CoverageRepository? coverage}) => [
  deviceLocationProvider.overrideWithValue(device),
  geocoderProvider.overrideWithValue(geocoder ?? MockGeocoder()),
  coverageRepositoryProvider.overrideWithValue(coverage ?? MockCoverageRepository()),
  catalogRepositoryProvider.overrideWithValue(MockCatalogRepository()),
];

JButton _button(WidgetTester t, String label) => t.widget<JButton>(find.widgetWithText(JButton, label));

void main() {
  testWidgets('the app explains before asking; refusing falls back to manual selection', (t) async {
    await t.pumpScreen(const MapPickerScreen(), overrides: _o(_RefusingDevice()));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('السماح بالوصول إلى موقعك'), findsOneWidget);

    await t.tap(find.text('السماح أثناء الاستخدام'));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('إذن الموقع متوقف'), findsOneWidget);
    expect(find.text('فتح الإعدادات'), findsOneWidget);

    await t.tap(find.text('إدخال العنوان يدويًا'));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('إذن الموقع متوقف'), findsNothing);
    expect(_button(t, 'تأكيد الموقع').onPressed, isNotNull); // the map works without the permission
  });

  testWidgets('granting the permission moves the map to the current location', (t) async {
    await t.pumpScreen(const MapPickerScreen(), overrides: _o(MockDeviceLocation()));
    await t.pump(const Duration(seconds: 1));
    await t.tap(find.text('السماح أثناء الاستخدام'));
    await t.pump(const Duration(seconds: 2));
    expect(find.text('حي الملقا، شارع أنس بن مالك'), findsOneWidget);
  });

  testWidgets('outside coverage: banner on the map and confirm disabled', (t) async {
    await t.pumpScreen(const MapPickerScreen(initial: GeoPoint(23.2, 45.1)), overrides: _o(MockDeviceLocation()));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('عذرًا، لا نوصّل إلى هذا الموقع حاليًا.'), findsOneWidget);
    expect(_button(t, 'تأكيد الموقع').onPressed, isNull);
  });

  testWidgets('outside coverage: the screen suggests pickup and lists the served cities', (t) async {
    await t.pumpScreen(const OutOfCoverageScreen(point: GeoPoint(23.2, 45.1)), overrides: _o(MockDeviceLocation()));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('خارج نطاق التوصيل'), findsOneWidget);
    expect(find.text('تصفّح واستلم من المتجر'), findsOneWidget);
    expect(find.text('المناطق المتاحة حاليًا: الرياض، جدة، الدمام.'), findsOneWidget);
  });

  testWidgets('an out-of-coverage location shows the pickup banner on home, browsing stays open', (t) async {
    const outside = SelectedLocation(point: GeoPoint(23.2, 45.1), line: 'حي بعيد', covered: false);
    await t.pumpScreen(
      const MainShell(location: '/home', child: HomeScreen()),
      overrides: _o(MockDeviceLocation()),
      prefs: {'locale': 'ar', 'location.selected': '{"lat":23.2,"lng":45.1,"line":"حي بعيد","covered":false}'},
    );
    await t.pump();
    expect(find.text(outside.line), findsOneWidget);
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsOneWidget);
    await t.pump(const Duration(seconds: 1)); // the start-up re-check (still outside)
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsOneWidget);
  });

  testWidgets('home re-checks the saved location: a zone added since clears the banner', (t) async {
    await t.pumpScreen(
      const MainShell(location: '/home', child: HomeScreen()),
      overrides: _o(MockDeviceLocation()),
      prefs: {'locale': 'ar', 'location.selected': '{"lat":24.8,"lng":46.6,"line":"حي الملقا","covered":false}'},
    );
    await t.pump();
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsOneWidget);
    await t.pump(const Duration(seconds: 1));
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsNothing);
  });

  testWidgets('no geocode result is not a dead end: the pin can be confirmed', (t) async {
    await t.pumpScreen(
      const MapPickerScreen(initial: GeoPoint(24.8, 46.6)),
      overrides: _o(MockDeviceLocation(), geocoder: _FailingGeocoder()),
    );
    await t.pump(const Duration(seconds: 1));
    expect(find.text('موقع التوصيل'), findsOneWidget);
    expect(_button(t, 'تأكيد الموقع').onPressed, isNotNull);
  });

  testWidgets('a failed coverage check offers retry', (t) async {
    await t.pumpScreen(
      const MapPickerScreen(initial: GeoPoint(24.8, 46.6)),
      overrides: _o(MockDeviceLocation(), coverage: _FailingCoverage()),
    );
    await t.pump(const Duration(seconds: 1));
    expect(find.text('إعادة المحاولة'), findsOneWidget);
    expect(find.text('تأكيد الموقع'), findsNothing);
  });

  test('sample addresses only in dev or with mocks; staging and prod without a key type them', () {
    String geocoder(Flavor f) {
      final c = ProviderContainer(overrides: [envProvider.overrideWithValue(Env(f))]);
      addTearDown(c.dispose);
      return c.read(geocoderProvider).runtimeType.toString();
    }

    expect(geocoder(Flavor.dev), 'MockGeocoder');
    expect(geocoder(Flavor.staging), 'NoKeyGeocoder');
    expect(geocoder(Flavor.prod), 'NoKeyGeocoder');
  });

  test('the selected location survives a restart and a sign-out', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await Prefs.load();
    ProviderContainer make() => ProviderContainer(
      overrides: [
        envProvider.overrideWithValue(const Env(Flavor.dev)),
        prefsProvider.overrideWithValue(prefs),
      ],
    );
    final a = make();
    await a
        .read(selectedLocationProvider.notifier)
        .select(const SelectedLocation(point: GeoPoint(24.8, 46.6), line: 'حي الملقا', covered: true));
    a.dispose();
    await prefs.clearAccountData();
    final b = make();
    expect(b.read(selectedLocationProvider)?.line, 'حي الملقا');
    b.dispose();
  });

  testWidgets('outside coverage, picked by hand: the pickup suggestion returns the point', (t) async {
    PickedPlace? picked;
    await t.pumpScreen(
      Builder(
        builder: (context) => TextButton(
          onPressed: () async => picked = await context.push<PickedPlace>('/picker'),
          child: const Text('open'),
        ),
      ),
      overrides: _o(MockDeviceLocation()),
      routes: [
        GoRoute(
          path: '/picker',
          builder: (_, _) => const MapPickerScreen(initial: GeoPoint(23.2, 45.1)),
        ),
      ],
    );
    await t.tap(find.text('open'));
    await t.pumpAndSettle(const Duration(seconds: 1));
    await t.tap(find.text('تصفّح واستلم من المتجر'));
    await t.pumpAndSettle(const Duration(seconds: 1));
    expect(picked, isNotNull);
    expect(picked!.coverage.covered, isFalse);
    expect(picked!.point, const GeoPoint(23.2, 45.1));
  });

  testWidgets('services off: Figma retry, with manual entry as the way out', (t) async {
    await t.pumpScreen(const MapPickerScreen(), overrides: _o(MockDeviceLocation(state: LocationAccess.serviceOff)));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('تعذّر تحديد موقعك'), findsOneWidget);
    expect(find.text('إعادة المحاولة'), findsOneWidget);
    expect(find.text('إدخال العنوان يدويًا'), findsOneWidget);
  });

  testWidgets('current location outside every zone opens the out-of-coverage screen', (t) async {
    await t.pumpScreen(
      const MapPickerScreen(),
      overrides: _o(MockDeviceLocation(state: LocationAccess.granted, position: const GeoPoint(23.2, 45.1))),
    );
    await t.pump(const Duration(seconds: 3));
    await t.pumpAndSettle();
    expect(find.text('route:/location/outside'), findsOneWidget);
  });
}
