import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/app/providers.dart';

/// The HTTP layer under the real Api* repositories: each request is answered by [handler] with an
/// openapi-shaped body (null: 404 NOT_FOUND). The app's own repository providers stay as they are (no
/// USE_MOCKS in tests), so the screens run on the real API wiring; only the network is fake.
class FakeHttp implements HttpClientAdapter {
  FakeHttp(this.handler);

  final Object? Function(RequestOptions request) handler;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    requests.add(o);
    final answer = handler(o);
    final (status, json) = answer == null
        ? (404, {'code': 'NOT_FOUND', 'message': 'not found', 'requestId': 'r'})
        : (200, answer);
    return ResponseBody.fromString(
      jsonEncode(json),
      status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  /// The requests sent to [path].
  List<RequestOptions> to(String path) => [
    for (final r in requests)
      if (r.path == path) r,
  ];

  @override
  void close({bool force = false}) {}
}

/// Overrides the generated client with one on [http].
dynamic apiOn(FakeHttp http) => apiProvider.overrideWithValue(
  JazlaApi(dio: Dio(BaseOptions(baseUrl: 'http://api.test'))..httpClientAdapter = http),
);

Map<String, Object?> ar(String ar, [String? en]) => {'ar': ar, 'en': en ?? ar};

/// openapi: ReferenceItemResponseDto (a category).
Map<String, Object?> categoryJson(String id, String name) => {
  'id': id,
  'name': ar(name),
  'isActive': true,
  'sortOrder': 0,
  'imageUrl': null,
  'createdAt': '2026-11-01T06:00:00.000Z',
};

/// openapi: PublicVendorResponseDto.
Map<String, Object?> vendorJson(String id, String name) => {
  'id': id,
  'name': ar(name),
  'description': {'ar': null, 'en': null},
  'logoUrl': null,
  'coverUrl': null,
  'city': 'الرياض',
};

/// openapi: ProductCardResponseDto.
Map<String, Object?> cardJson(String id, String name, {String vendorId = 'v1', String vendor = 'ملحمة النخبة'}) => {
  'id': id,
  'vendor': {'id': vendorId, 'name': ar(vendor)},
  'name': ar(name),
  'categoryId': 'c1',
  'meatTypeId': null,
  'status': 'published',
  'isAvailable': true,
  'minPriceHalalas': 6500,
  'coverUrl': null,
  'createdAt': '2026-11-01T06:00:00.000Z',
};

/// openapi: PublicProductResponseDto.
Map<String, Object?> productJson(
  String id, {
  List<Map<String, Object?>> cuttings = const [],
  List<Map<String, Object?>> packagings = const [],
  List<Map<String, Object?>> incompatiblePairs = const [],
  bool isAvailable = true,
}) => {
  'id': id,
  'vendor': {'id': 'v1', 'name': ar('ملحمة النخبة')},
  'name': ar('ذبيحة نعيمي', 'Naimi lamb'),
  'description': {'ar': null, 'en': null},
  'category': {'id': 'c1', 'name': ar('ذبائح كاملة')},
  'meatType': null,
  'fulfilment': 'both',
  'isAvailable': isAvailable,
  'images': <Object>[],
  'sizes': [
    {'id': 'sz-1', 'approxWeightGrams': 9000, 'priceHalalas': 145000, 'tag': null, 'isAvailable': true},
  ],
  'defaultSizeId': 'sz-1',
  'cuttings': cuttings,
  'packagings': packagings,
  'exclusions': <Object>[],
  'incompatiblePairs': incompatiblePairs,
  'minPriceHalalas': 145000,
};
