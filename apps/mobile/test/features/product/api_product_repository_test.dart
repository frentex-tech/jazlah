import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/features/product/data/product_repository.dart';

class _Api implements HttpClientAdapter {
  _Api(this.answer);

  final Object answer;

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async =>
      ResponseBody.fromString(
        jsonEncode(answer),
        200,
        headers: {
          Headers.contentTypeHeader: [Headers.jsonContentType],
        },
      );

  @override
  void close({bool force = false}) {}
}

void main() {
  test('a cut without a name is skipped, never shown by its id', () async {
    final api = JazlaApi(dio: Dio(BaseOptions(baseUrl: 'http://api.test')))
      ..dio.httpClientAdapter = _Api({
        'id': 'p1',
        'vendor': {
          'id': 'v1',
          'name': {'ar': 'مجازر الفلاح', 'en': 'Al Falah'},
        },
        'name': {'ar': 'ريب آي', 'en': 'Ribeye'},
        'description': {'ar': null, 'en': null},
        'category': {
          'id': 'c1',
          'name': {'ar': 'الأبقار', 'en': 'Beef'},
        },
        'meatType': null,
        'fulfilment': 'both',
        'images': <Object>[],
        'sizes': [
          {'id': 's1', 'approxWeightGrams': 1000, 'priceHalalas': 8900, 'tag': null},
        ],
        'cuttings': [
          {
            'cuttingStyleId': 'cut-1',
            'name': {'ar': 'شرائح', 'en': 'Slices'},
            'extraPriceHalalas': 0,
          },
          {'cuttingStyleId': 'cut-2', 'name': null, 'extraPriceHalalas': 200},
        ],
        'packagings': <Object>[],
        'exclusions': <Object>[],
        'minPriceHalalas': 8900,
      });
    final p = await ApiProductRepository(api).product('p1');
    expect(p.cuts.map((c) => c.id), ['cut-1']);
  });
}
