import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';
import 'package:jazlah/features/location/presentation/out_of_coverage_screen.dart';

import 'harness.dart';

class _Device extends MockDeviceLocation {
  _Device(LocationAccess s, {this.hangCurrent = false}) : super(state: s);

  final bool hangCurrent;

  @override
  Future<GeoPoint> current() => hangCurrent ? hang() : super.current();
}

class _Geo extends MockGeocoder {
  _Geo({this.mode = 'ok'});

  final String mode;

  @override
  Future<PlaceAddress> reverse(GeoPoint p, String language) async {
    if (mode == 'hang') return hang();
    if (mode == 'error') throw StateError('x');
    return super.reverse(p, language);
  }
}

class _Coverage extends MockCoverageRepository {
  _Coverage({this.mode = 'ok'});

  final String mode;

  @override
  Future<Coverage> check(GeoPoint p) async {
    if (mode == 'hang') return hang();
    if (mode == 'error') throw StateError('x');
    return super.check(p);
  }
}

const _malqa = GeoPoint(24.8168, 46.6195);
const _outside = GeoPoint(23.2, 45.1);

List<dynamic> _o({
  LocationAccess access = LocationAccess.granted,
  bool hangCurrent = false,
  String geo = 'ok',
  String cov = 'ok',
}) => [
  deviceLocationProvider.overrideWithValue(_Device(access, hangCurrent: hangCurrent)),
  geocoderProvider.overrideWithValue(_Geo(mode: geo)),
  coverageRepositoryProvider.overrideWithValue(_Coverage(mode: cov)),
];

void main() {
  setUpAll(loadFonts);

  testWidgets('permission sheet', (t) async {
    await shoot(t, '86-3583', const MapPickerScreen(), overrides: _o(access: LocationAccess.notAsked));
    await shoot(t, '86-3642', const MapPickerScreen(), overrides: _o(access: LocationAccess.denied));
    await shoot(t, '86-3701', const MapPickerScreen(), overrides: _o(hangCurrent: true));
    await shoot(t, '86-3762', const MapPickerScreen(), overrides: _o(access: LocationAccess.serviceOff));
  });

  testWidgets('map picker', (t) async {
    await shoot(t, '86-3340', const MapPickerScreen(initial: _malqa), overrides: _o());
    await shoot(
      t,
      '86-3383',
      const MapPickerScreen(initial: _malqa),
      overrides: _o(),
      act: (t) async {
        await t.tap(find.byType(TextField));
        await t.enterText(find.byType(TextField), 'ملقا');
        await t.pump(const Duration(seconds: 1));
      },
    );
    await shoot(t, '86-3439', const MapPickerScreen(initial: _outside), overrides: _o());
    await shoot(
      t,
      '86-3490',
      const MapPickerScreen(initial: _malqa),
      overrides: _o(geo: 'hang'),
    );
    await shoot(
      t,
      '86-3535',
      const MapPickerScreen(initial: _malqa),
      overrides: _o(geo: 'error'),
    );
  });

  testWidgets('out of coverage', (t) async {
    await shoot(t, '86-3823', const OutOfCoverageScreen(point: _outside), overrides: _o());
    await shoot(
      t,
      '86-3864',
      const OutOfCoverageScreen(point: _outside),
      overrides: _o(cov: 'hang'),
    );
    await shoot(
      t,
      '86-3907',
      const OutOfCoverageScreen(point: _outside),
      overrides: _o(cov: 'error'),
    );
  });
}
