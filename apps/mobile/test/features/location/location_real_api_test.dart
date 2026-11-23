import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/home/presentation/home_screen.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';

import '../../helpers/fake_api.dart';
import '../../helpers/pump_screen.dart';

/// LOC-MOB-1 #26 on the real API wiring: ApiCoverageRepository over a fake HTTP layer answering
/// GET /v1/public/coverage/check (openapi CoverageCheckResponseDto). The device permission is the platform's,
/// faked here; the geocoder is the dev sample one (not our API).

class _RefusingDevice extends MockDeviceLocation {
  @override
  Future<LocationAccess> request() async => state = LocationAccess.denied;
}

/// Covered inside the Riyadh box only (lat 24..25.5, lng 46..47.5); the catalog lists stay empty.
FakeHttp _server() => FakeHttp((r) {
  switch (r.path) {
    case '/v1/public/coverage/check':
      // openapi: GET with lat and lng in the query; another method or shape fails here.
      if (r.method != 'GET') return null;
      final lat = double.parse('${r.queryParameters['lat']}');
      final lng = double.parse('${r.queryParameters['lng']}');
      final covered = lat > 24 && lat < 25.5 && lng > 46 && lng < 47.5;
      return {
        'covered': covered,
        'zone': covered ? {'id': 'z1', 'name': ar('شمال الرياض'), 'city': 'الرياض'} : null,
      };
    case '/v1/public/categories':
      return {'items': <Object>[]};
    case '/v1/public/vendors':
      return {'items': <Object>[], 'nextCursor': null};
  }
  return null;
});

List<dynamic> _o(FakeHttp http, DeviceLocation device) => [
  apiOn(http),
  deviceLocationProvider.overrideWithValue(device),
  geocoderProvider.overrideWithValue(MockGeocoder()),
];

JButton _button(WidgetTester t, String label) => t.widget<JButton>(find.widgetWithText(JButton, label));

void main() {
  testWidgets('denying the permission falls back to manual selection, which the API confirms', (t) async {
    final http = _server();
    await t.pumpScreen(const MapPickerScreen(), overrides: _o(http, _RefusingDevice()));
    await t.pump(const Duration(seconds: 1));
    await t.tap(find.text('السماح أثناء الاستخدام'));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('إذن الموقع متوقف'), findsOneWidget);
    await t.tap(find.text('إدخال العنوان يدويًا'));
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect(find.text('إذن الموقع متوقف'), findsNothing);
    expect(http.to('/v1/public/coverage/check'), isNotEmpty); // the pin is checked by the API
    expect(_button(t, 'تأكيد الموقع').onPressed, isNotNull); // no dead end
  });

  testWidgets('outside coverage (API says no): the banner on the map, confirm disabled', (t) async {
    final http = _server();
    await t.pumpScreen(const MapPickerScreen(initial: GeoPoint(23.2, 45.1)), overrides: _o(http, MockDeviceLocation()));
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect(http.to('/v1/public/coverage/check'), isNotEmpty);
    expect(find.text('عذرًا، لا نوصّل إلى هذا الموقع حاليًا.'), findsOneWidget);
    expect(_button(t, 'تأكيد الموقع').onPressed, isNull);
    expect(find.text('تصفّح واستلم من المتجر'), findsOneWidget); // the pickup suggestion on the map
  });

  testWidgets('outside coverage: the screen suggests pickup (no served-cities list without the API)', (t) async {
    await t.pumpScreen(
      const OutOfCoverageScreen(point: GeoPoint(23.2, 45.1)),
      overrides: _o(_server(), MockDeviceLocation()),
    );
    await t.pump(const Duration(seconds: 1));
    expect(find.text('خارج نطاق التوصيل'), findsOneWidget);
    expect(find.text('تصفّح واستلم من المتجر'), findsOneWidget);
    expect(find.textContaining('المناطق المتاحة حاليًا'), findsNothing); // LOC-API-1 #24 gap: no list
  });

  testWidgets('a saved location the API says is outside shows the pickup banner on home', (t) async {
    final http = _server();
    await t.pumpScreen(
      const MainShell(location: '/home', child: HomeScreen()),
      overrides: _o(http, MockDeviceLocation()),
      prefs: {'locale': 'ar', 'location.selected': '{"lat":23.2,"lng":45.1,"line":"حي بعيد","covered":true}'},
    );
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect(http.to('/v1/public/coverage/check'), isNotEmpty); // the start-up re-check
    expect(find.text('خارج نطاق التوصيل: تصفّح واطلب الاستلام من المتجر.'), findsOneWidget);
  });
}
