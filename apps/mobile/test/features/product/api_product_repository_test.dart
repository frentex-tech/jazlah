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
  test('maps cuts, sizes with their availability, the default size and the incompatible pairs', () async {
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
          {'id': 's1', 'approxWeightGrams': 1000, 'priceHalalas': 8900, 'tag': null, 'isAvailable': true},
          {'id': 's2', 'approxWeightGrams': 2000, 'priceHalalas': 17200, 'tag': null, 'isAvailable': false},
        ],
        'cuttings': [
          {
            'cuttingStyleId': 'cut-1',
            'name': {'ar': 'شرائح', 'en': 'Slices'},
            'extraPriceHalalas': 0,
          },
          {
            'cuttingStyleId': 'cut-2',
            'name': {'ar': 'مكعبات', 'en': 'Cubes'},
            'extraPriceHalalas': 200,
          },
        ],
        'packagings': [
          {'packaging': 'trays', 'extraPriceHalalas': 0},
          {'packaging': 'vacuum', 'extraPriceHalalas': 500},
        ],
        'exclusions': <Object>[],
        'minPriceHalalas': 8900,
        'isAvailable': false,
        'defaultSizeId': 's1',
        'incompatiblePairs': [
          {'cuttingStyleId': 'cut-2', 'packaging': 'trays'},
        ],
      });
    final p = await ApiProductRepository(api).product('p1');
    expect(p.cuts.map((c) => c.id), ['cut-1', 'cut-2']);
    expect(p.sizes.map((s) => (s.id, s.available)), [('s1', true), ('s2', false)]);
    expect(p.available, isFalse); // an unavailable product now opens, marked
    expect(p.defaultSizeId, 's1');
    expect(p.compatible('cut-2', 'trays'), isFalse);
    expect(p.compatible('cut-2', 'vacuum'), isTrue);
    expect(p.compatible('cut-1', 'trays'), isTrue);
  });
}
