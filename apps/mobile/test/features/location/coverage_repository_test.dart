import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';

class _Answer implements HttpClientAdapter {
  _Answer(this.status, this.body);

  final int status;
  final Map<String, dynamic> body;
  RequestOptions? last;

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    last = o;
    return ResponseBody.fromString(
      jsonEncode(this.body),
      status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

ApiCoverageRepository _repo(_Answer a) =>
    ApiCoverageRepository(JazlaApi(dio: Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = a));

void main() {
  test('check sends lat/lng and maps covered', () async {
    final a = _Answer(200, {
      'covered': true,
      'zone': {
        'id': 'z1',
        'name': {'ar': 'شمال الرياض', 'en': 'North Riyadh'},
        'city': 'الرياض',
      },
    });
    final c = await _repo(a).check(const GeoPoint(24.8, 46.6));
    expect(c.covered, isTrue);
    expect(a.last!.path, '/v1/public/coverage/check');
    expect(a.last!.queryParameters, {'lat': 24.8, 'lng': 46.6});

    final out = await _repo(_Answer(200, {'covered': false, 'zone': null})).check(const GeoPoint(23, 45));
    expect(out.covered, isFalse);
  });

  test('an API error comes back as ApiError with its code', () async {
    final a = _Answer(400, {'code': 'VALIDATION_FAILED', 'message': 'lat'});
    await expectLater(
      _repo(a).check(const GeoPoint(99, 46)),
      throwsA(isA<ApiError>().having((e) => e.code, 'code', 'VALIDATION_FAILED')),
    );
  });

  test('the real build lists no served cities until the API has them', () async {
    expect(await _repo(_Answer(200, {})).cities('ar'), isEmpty);
  });
}
