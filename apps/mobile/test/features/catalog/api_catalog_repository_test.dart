import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/data/catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';

/// Answers by path; a missing path fails as a connection error (offline).
class _Api implements HttpClientAdapter {
  _Api(this.answers);

  final Map<String, Object> answers;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    requests.add(o);
    final answer = answers[o.path];
    if (answer == null) throw DioException.connectionError(requestOptions: o, reason: 'offline');
    return ResponseBody.fromString(
      jsonEncode(answer),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

ApiCatalogRepository _repo(_Api a) =>
    ApiCatalogRepository(JazlaApi(dio: Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = a));

Map<String, Object?> _card(String id, {Map<String, String>? vendorName}) => {
  'id': id,
  'vendor': {'id': 'v1', 'name': vendorName},
  'name': {'ar': 'ريب آي', 'en': 'Ribeye'},
  'categoryId': 'c1',
  'meatTypeId': null,
  'status': 'published',
  'isAvailable': true,
  'minPriceHalalas': 8900,
  'coverUrl': null,
  'createdAt': '2026-11-20T10:00:00.000Z',
};

Map<String, Object?> _vendor(String id, Map<String, String?> description) => {
  'id': id,
  'name': {'ar': 'مجازر الفلاح', 'en': 'Al Falah'},
  'description': description,
  'logoUrl': null,
  'coverUrl': null,
  'city': 'الرياض',
};

void main() {
  const query = (categoryId: 'c1', vendorId: 'v1', sort: ProductSort.popular);

  test('products: filters sent, cursor passed through, vendor name optional, price as int', () async {
    final a = _Api({
      '/v1/public/products': {
        'items': [
          _card('p1', vendorName: {'ar': 'مجازر الفلاح', 'en': 'Al Falah'}),
          _card('p2'),
        ],
        'nextCursor': 'abc',
      },
    });
    final page = await _repo(a).products(query, cursor: 'prev');
    expect(a.requests.single.queryParameters, containsPair('cursor', 'prev'));
    expect(a.requests.single.queryParameters, containsPair('categoryId', 'c1'));
    expect(a.requests.single.queryParameters, containsPair('vendorId', 'v1'));
    expect(page.nextCursor, 'abc');
    expect(page.items.first.vendorName!.ar, 'مجازر الفلاح');
    expect(page.items.last.vendorName, isNull);
    expect(page.items.first.minPriceHalalas, isA<int>().having((p) => p, 'value', 8900));
  });

  test('stores: a description in one language fills both; none stays null', () async {
    final a = _Api({
      '/v1/public/vendors': {
        'items': [
          _vendor('v1', {'ar': 'ذبائح طازجة', 'en': null}),
          _vendor('v2', {'ar': null, 'en': 'Fresh'}),
          _vendor('v3', {'ar': null, 'en': null}),
        ],
        'nextCursor': null,
      },
    });
    final page = await _repo(a).stores();
    expect(page.items[0].description!.of('en'), 'ذبائح طازجة');
    expect(page.items[1].description!.of('ar'), 'Fresh');
    expect(page.items[2].description, isNull);
    expect(page.nextCursor, isNull);
    expect(page.items[0].rating, isNull); // API gap: never invented
  });

  test('no network comes back as ApiError NETWORK', () async {
    await expectLater(
      _repo(_Api({})).categories(),
      throwsA(isA<ApiError>().having((e) => e.code, 'code', ApiError.network)),
    );
  });

  test('home with the API: no best sellers (no true list yet), categories and stores', () async {
    final a = _Api({
      '/v1/public/categories': {'items': <Object>[]},
      '/v1/public/vendors': {
        'items': [
          _vendor('v1', {'ar': null, 'en': null}),
        ],
        'nextCursor': null,
      },
    });
    final feed = await _repo(a).home();
    expect(feed.bestSellers, isEmpty);
    expect(feed.partnerStores.single.id, 'v1');
    expect(a.requests.any((r) => r.path == '/v1/public/products'), isFalse);
  });

  test('the API cannot sort yet', () => expect(_repo(_Api({})).canSort, isFalse));
}
