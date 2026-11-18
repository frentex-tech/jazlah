import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/providers.dart';
import 'package:jazlah/app/shell/home_tab.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/core/widgets/widgets.dart';
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

List<dynamic> _o(DeviceLocation device) => [
  deviceLocationProvider.overrideWithValue(device),
  geocoderProvider.overrideWithValue(MockGeocoder()),
  coverageRepositoryProvider.overrideWithValue(MockCoverageRepository()),
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
      const HomeTab(),
      overrides: _o(MockDeviceLocation()),
      prefs: {'locale': 'ar', 'location.selected': '{"lat":23.2,"lng":45.1,"line":"حي بعيد","covered":false}'},
    );
    await t.pump();
    expect(find.text(outside.line), findsOneWidget);
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsOneWidget);
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
      routes: [GoRoute(path: '/picker', builder: (_, _) => const MapPickerScreen(initial: GeoPoint(23.2, 45.1)))],
    );
    await t.tap(find.text('open'));
    await t.pumpAndSettle(const Duration(seconds: 1));
    await t.tap(find.text('تصفّح واستلم من المتجر'));
    await t.pumpAndSettle(const Duration(seconds: 1));
    expect(picked, isNotNull);
    expect(picked!.coverage.covered, isFalse);
    expect(picked!.point, const GeoPoint(23.2, 45.1));
  });

  testWidgets('services off: the sheet opens the location settings instead of looping', (t) async {
    await t.pumpScreen(const MapPickerScreen(), overrides: _o(MockDeviceLocation(state: LocationAccess.serviceOff)));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('تعذّر تحديد موقعك'), findsOneWidget);
    expect(find.text('فتح الإعدادات'), findsOneWidget);
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
