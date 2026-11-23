import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';

/// Records every request and answers like the API (the address back, default when asked).
class _Recorder implements HttpClientAdapter {
  final requests = <({String method, String path, Map<String, dynamic>? body})>[];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    final raw = body == null ? null : await utf8.decodeStream(body);
    requests.add((
      method: o.method,
      path: o.path,
      body: raw == null || raw.isEmpty ? null : jsonDecode(raw) as Map<String, dynamic>,
    ));
    final address = {
      'id': 'a1',
      'label': 'المنزل',
      'location': {'latitude': 24.8, 'longitude': 46.6},
      'city': null,
      'district': null,
      'street': null,
      'building': null,
      'shortNationalAddress': null,
      'driverInstructions': null,
      'isDefault': o.path.endsWith('/default'),
      'isCovered': true,
      'createdAt': '2026-11-18T10:00:00.000Z',
      'updatedAt': '2026-11-18T10:00:00.000Z',
    };
    return ResponseBody.fromString(
      jsonEncode(address),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  late _Recorder rec;
  late ApiAddressRepository repo;

  setUp(() {
    rec = _Recorder();
    final dio = Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = rec;
    repo = ApiAddressRepository(JazlaApi(dio: dio, interceptors: const []));
  });

  const before = Address(
    id: 'a1',
    label: 'المنزل',
    point: GeoPoint(24.8, 46.6),
    isDefault: false,
    city: 'الرياض',
    district: 'الملقا',
    street: 'شارع أنس',
  );

  AddressDraft draft({
    String district = 'الملقا',
    bool isDefault = false,
    GeoPoint point = const GeoPoint(24.8, 46.6),
  }) => AddressDraft(
    label: 'المنزل',
    point: point,
    city: 'الرياض',
    district: district,
    street: 'شارع أنس',
    isDefault: isDefault,
  );

  test('PATCH sends only the cleared field, as an empty text', () async {
    await repo.update(before, draft(district: ''));
    expect(rec.requests.single.method, 'PATCH');
    expect(rec.requests.single.body, {'district': ''});
  });

  test('a moved pin sends the location; label stays out when unchanged', () async {
    await repo.update(before, draft(point: const GeoPoint(24.9, 46.7)));
    expect(rec.requests.single.body, {
      'location': {'latitude': 24.9, 'longitude': 46.7},
    });
  });

  test('only the default changed: no PATCH, the default route instead', () async {
    final saved = await repo.update(before, draft(isDefault: true));
    expect(rec.requests.map((r) => '${r.method} ${r.path}'), ['POST /v1/customer/addresses/a1/default']);
    expect(saved.isDefault, isTrue);
  });

  test('create sends isDefault only when checked, and trims blanks to null', () async {
    await repo.create(const AddressDraft(label: ' البيت ', point: GeoPoint(24.8, 46.6), street: '  '));
    expect(rec.requests.single.body, {
      'label': 'البيت',
      'location': {'latitude': 24.8, 'longitude': 46.6},
    });
    rec.requests.clear();
    await repo.create(const AddressDraft(label: 'البيت', point: GeoPoint(24.8, 46.6), isDefault: true));
    expect(rec.requests.single.body!['isDefault'], isTrue);
  });

  test('isCovered from the API becomes covered', () async {
    final a = await repo.update(before, draft(district: ''));
    expect(a.covered, isTrue);
  });
}
