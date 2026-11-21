import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/search/data/search_repository.dart';
import 'package:jazlah/features/search/domain/search.dart';

/// Records each request and answers one page; [offline] fails as a connection error.
class _Api implements HttpClientAdapter {
  _Api({this.offline = false});

  final bool offline;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    requests.add(o);
    if (offline) throw DioException.connectionError(requestOptions: o, reason: 'offline');
    return ResponseBody.fromString(
      jsonEncode({
        'items': [
          {
            'id': 'p1',
            'vendor': {
              'id': 'v1',
              'name': {'ar': 'مجازر الفلاح', 'en': 'Al Falah'},
            },
            'name': {'ar': 'ريب آي', 'en': 'Ribeye'},
            'categoryId': 'c1',
            'meatTypeId': null,
            'status': 'published',
            'isAvailable': true,
            'minPriceHalalas': 4950,
            'coverUrl': null,
            'createdAt': '2026-11-20T10:00:00.000Z',
          },
        ],
        'nextCursor': 'next',
      }),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

ApiSearchRepository _repo(_Api a) =>
    ApiSearchRepository(JazlaApi(dio: Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = a));

void main() {
  test('sends the words, filters and cursor; maps the page', () async {
    final a = _Api();
    final page = await _repo(a).search(
      const SearchQuery(
        text: 'ريب آي',
        categoryId: 'c1',
        vendorId: 'v1',
        minPriceHalalas: 1000,
        maxPriceHalalas: 10000,
        availableOnly: true,
      ),
      cursor: 'abc',
    );
    final r = a.requests.single;
    expect(r.path, '/v1/public/products');
    expect(r.queryParameters, {
      'cursor': 'abc',
      'limit': 20,
      'q': 'ريب آي',
      'categoryId': 'c1',
      'vendorId': 'v1',
      'minPriceHalalas': 1000,
      'maxPriceHalalas': 10000,
    });
    expect(page.items.single.vendorName?.ar, 'مجازر الفلاح');
    expect(page.items.single.minPriceHalalas, 4950);
    expect(page.nextCursor, 'next');
  });

  test('no words and no filters: only the page size is sent', () async {
    final a = _Api();
    await _repo(a).search(const SearchQuery());
    expect(a.requests.single.queryParameters, {'limit': 20});
  });

  test('gaps say so: no count, no popular searches, no sort, no availability filter', () async {
    final repo = _repo(_Api());
    expect(await repo.count(const SearchQuery(text: 'x')), isNull);
    expect(await repo.popular(), isEmpty);
    expect(repo.canSort, isFalse);
    expect(repo.canFilterAvailable, isFalse);
  });

  test('a network failure becomes the offline error', () async {
    await expectLater(
      _repo(_Api(offline: true)).search(const SearchQuery(text: 'x')),
      throwsA(isA<ApiError>().having((e) => e.code, 'code', ApiError.network)),
    );
  });
}
