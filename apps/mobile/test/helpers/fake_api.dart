import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:jazla_api/jazla_api.dart';
import 'package:jazlah/app/providers.dart';

/// An answer with another status than 200 (an error body, a 201…).
class HttpAnswer {
  const HttpAnswer(this.status, this.body);

  final int status;
  final Object body;
}

/// The error body of the API (`ErrorResponseDto`).
HttpAnswer apiError(int status, String code, {Object? details}) => HttpAnswer(status, {
  'code': code,
  'message': code,
  'details': ?details,
  'requestId': 'r',
});

/// NOT_IMPLEMENTED (501): a Sprint 3 route before its task lands.
HttpAnswer notImplemented(String task) => apiError(501, 'NOT_IMPLEMENTED', details: {'task': task});

/// The HTTP layer under the real Api* repositories: each request is answered by [handler] with an
/// openapi-shaped body, an [HttpAnswer], or null (404 NOT_FOUND). The app's own repository providers stay as they are (no
/// USE_MOCKS in tests), so the screens run on the real API wiring; only the network is fake.
class FakeHttp implements HttpClientAdapter {
  FakeHttp(this.handler);

  final Object? Function(RequestOptions request) handler;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<List<int>>? body, Future<void>? cancel) async {
    requests.add(o);
    final answer = handler(o);
    final (status, json) = switch (answer) {
      null => (404, {'code': 'NOT_FOUND', 'message': 'not found', 'requestId': 'r'}),
      HttpAnswer(:final status, :final body) => (status, body),
      _ => (200, answer),
    };
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

/// The JSON body of a request (Dio has already encoded it when the adapter sees it).
Map<String, dynamic> jsonBody(RequestOptions r) =>
    (r.data is String ? jsonDecode(r.data as String) : r.data) as Map<String, dynamic>;

/// Overrides the generated client with one on [http].
Override apiOn(FakeHttp http) => apiProvider.overrideWithValue(
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

// ---- Sprint 3 contract bodies (openapi: CartResponseDto, OrderResponseDto, …) ----

/// openapi: CartLineResponseDto.
Map<String, Object?> cartLineJson(
  String id, {
  String productId = 'p1',
  String name = 'ريب آي',
  int quantity = 1,
  int unitPrice = 8900,
  bool isAvailable = true,
}) => {
  'id': id,
  'productId': productId,
  'name': ar(name),
  'imageUrl': null,
  'size': {'id': 'sz-1kg', 'approxWeightGrams': 1000, 'tag': null},
  'cutting': {'id': 'cut-slices', 'name': ar('شرائح')},
  'packaging': 'trays',
  'exclusions': <Object>[],
  'notes': null,
  'quantity': quantity,
  'unitPriceHalalas': unitPrice,
  'totalHalalas': unitPrice * quantity,
  'isAvailable': isAvailable,
};

/// openapi: CartResponseDto. The totals are the server's, given as is.
Map<String, Object?> cartJson({
  List<Map<String, Object?>> lines = const [],
  int minOrder = 10000,
  int? minOrderRemaining,
  bool? canCheckout,
  Map<String, Object?>? fulfilment,
  int deliveryFee = 0,
}) {
  final subtotal = lines.fold<int>(0, (s, l) => s + (l['totalHalalas']! as int));
  final remaining = minOrderRemaining ?? (minOrder - subtotal).clamp(0, minOrder);
  final total = subtotal + deliveryFee;
  return {
    'vendor': lines.isEmpty ? null : {'id': 'v1', 'name': ar('ملحمة النخبة')},
    'lines': lines,
    'coupon': null,
    'fulfilment': fulfilment,
    'subtotalHalalas': subtotal,
    'discountHalalas': 0,
    'deliveryFeeHalalas': deliveryFee,
    'totalHalalas': total,
    'vatHalalas': (total * 15 + 57) ~/ 115,
    'minOrderHalalas': minOrder,
    'minOrderRemainingHalalas': remaining,
    'issues': <Object>[],
    'canCheckout': canCheckout ?? (lines.isNotEmpty && remaining == 0),
  };
}

/// openapi: CustomerAddressResponseDto.
Map<String, Object?> addressJson(String id, {String label = 'المنزل', bool covered = true, bool isDefault = true}) => {
  'id': id,
  'label': label,
  'location': {'latitude': 24.8, 'longitude': 46.6},
  'city': 'الرياض',
  'district': 'حي الملقا',
  'street': null,
  'building': null,
  'shortNationalAddress': null,
  'driverInstructions': null,
  'isDefault': isDefault,
  'isCovered': covered,
  'createdAt': '2026-11-01T06:00:00.000Z',
  'updatedAt': '2026-11-01T06:00:00.000Z',
};

/// openapi: CheckoutDayResponseDto.
Map<String, Object?> dayJson(String date, {String? reason}) => {
  'date': date,
  'isAvailable': reason == null,
  'reason': reason,
  'window': {'start': '16:00', 'end': '22:00'},
};

/// openapi: ClientSettingsResponseDto.
Map<String, Object?> clientSettingsJson({bool paused = false}) => {
  'deliveryWindow': {'start': '16:00', 'end': '22:00'},
  'bookingHorizonDays': 14,
  'minOrderHalalas': 10000,
  'deliveryFeeHalalas': 1500,
  'codEnabled': true,
  'codMaxOrderHalalas': null,
  'paused': {'isPaused': paused, 'messageAr': null, 'messageEn': null},
};

/// openapi: PaymentMethodListResponseDto.
Map<String, Object?> paymentMethodsJson({int walletBalance = 0, int total = 12300}) => {
  'items': [
    {'method': 'mada', 'isAvailable': true, 'reason': null},
    {'method': 'applepay', 'isAvailable': true, 'reason': null},
    {
      'method': 'wallet',
      'isAvailable': walletBalance >= total,
      'reason': walletBalance >= total ? null : 'INSUFFICIENT_BALANCE',
    },
    {'method': 'cod', 'isAvailable': true, 'reason': null},
  ],
  'walletBalanceHalalas': walletBalance,
  'totalHalalas': total,
};

/// openapi: OrderResponseDto (a delivery order of one line).
Map<String, Object?> orderJson(
  String id, {
  String status = 'pending_payment',
  String paymentMethod = 'mada',
  String? paymentStatus,
  String? paymentId,
  int walletRestored = 0,
  List<Map<String, Object?>> history = const [],
}) => {
  'id': id,
  'number': 'JZ-261110-0007',
  'status': status,
  'orderType': 'ready_meat',
  'fulfilment': 'delivery',
  'fulfilmentDate': '2026-11-11',
  'vendor': {
    'id': 'v1',
    'name': ar('ملحمة النخبة'),
    'phone': '+966500000001',
    'location': {'latitude': 24.7, 'longitude': 46.7},
    'city': 'الرياض',
  },
  'customer': {'id': 'u1', 'name': 'سارة', 'phone': '+966500000002'},
  'paymentMethod': paymentMethod,
  'totalHalalas': 12300,
  'createdAt': '2026-11-10T10:00:00.000Z',
  'items': [
    {
      'id': 'i1',
      'productId': 'p1',
      'name': ar('كباب لحم غنم'),
      'imageUrl': null,
      'size': {'id': 'sz-500g', 'approxWeightGrams': 500, 'tag': null},
      'cutting': null,
      'packaging': 'trays',
      'exclusions': <Object>[],
      'notes': null,
      'quantity': 3,
      'unitPriceHalalas': 3600,
      'totalHalalas': 10800,
    },
  ],
  'address': {
    'label': 'المنزل',
    'location': {'latitude': 24.8, 'longitude': 46.6},
    'city': 'الرياض',
    'district': 'حي الملقا',
    'street': null,
    'building': null,
    'shortNationalAddress': null,
    'driverInstructions': null,
  },
  'pickupPoint': null,
  'window': {'start': '16:00', 'end': '22:00'},
  'subtotalHalalas': 10800,
  'discountHalalas': 0,
  'deliveryFeeHalalas': 1500,
  'vatHalalas': 1604,
  'couponCode': null,
  'notes': null,
  'cancelReason': null,
  'expiresAt': status == 'pending_payment' ? '2026-11-10T10:15:00.000Z' : null,
  'payment': {
    'method': paymentMethod,
    'status': paymentStatus,
    'paymentId': paymentId,
    'walletHalalas': 0,
    'walletRestoredHalalas': walletRestored,
    'cardLast4': null,
  },
  'refunds': <Object>[],
  'history': history,
  'allowedTransitions': <Object>[],
};

/// openapi: PaymentResponseDto with a redirect next action.
Map<String, Object?> paymentJson(String id, {String method = 'mada', int amount = 12300}) => {
  'id': id,
  'method': method,
  'status': 'initiated',
  'amountHalalas': amount,
  'nextAction': {
    'type': 'redirect',
    'redirectUrl': 'https://pay.fake.test/hosted/$id',
    'returnUrl': 'jazlah://checkout/pay/return',
  },
  'createdAt': '2026-11-10T10:00:00.000Z',
};
