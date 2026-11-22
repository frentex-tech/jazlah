import 'dart:async';
import 'dart:convert';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/core/storage/prefs.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/catalog/data/mock_catalog_repository.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/checkout/data/order_repository.dart' show newIdempotencyKey;
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/domain/price.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// The cart routes of CRT-API-1 / CRT-API-3 (`/v1/customer/cart…`). Each call answers the whole cart.
abstract interface class CartRepository {
  Future<Cart> get();

  /// Throws [CartError.vendorMismatch] when the cart holds another store's products and not [replace].
  Future<Cart> add(CartItemInput item, {bool replace = false});
  Future<Cart> update(String lineId, int quantity);
  Future<Cart> remove(String lineId);
  Future<Cart> applyCoupon(String code);
  Future<Cart> removeCoupon();

  /// The guest cart after sign-in (CRT-API-1 merge rules). [mergeId] is the device cart's stable id, so a merge
  /// repeated after the app died before clearing the device cart answers the first result (lead review A8).
  // shortcut: the server ignores the merge id until CRT-API-1 #61 dedupes by it (not-built-yet.md).
  Future<CartMergeResult> merge(List<CartItemInput> items, {String? mergeId});
}

/// A product as it is now; null when it no longer exists.
typedef ProductLookup = Future<ProductDetail?> Function(String id);

/// The cart rules shared by the device cart and the mock server cart: one store per cart, the same
/// choices sum their quantities, and every read re-prices through [priceLine].
abstract class EntriesCart implements CartRepository {
  EntriesCart(this.product, {this.settings});

  final ProductLookup product;
  final CartSettings? settings;
  var _n = 0;

  Future<List<CartEntry>> read();
  Future<void> write(List<CartEntry> entries);

  /// The store changed or the cart emptied (the mock drops its coupon).
  void onCleared() {}

  Future<Map<String, ProductDetail?>> products(Iterable<String> ids) async {
    final unique = ids.toSet().toList();
    final found = await Future.wait(unique.map(product));
    return {for (final (i, id) in unique.indexed) id: found[i]};
  }

  Future<Cart> priced(List<CartEntry> entries) async =>
      priceCart(entries, await products(entries.map((e) => e.item.productId)), settings: settings);

  /// Adds [item] or sums it into the line with the same choices, at today's [unitPrice].
  List<CartEntry> put(List<CartEntry> entries, CartItemInput item, String vendorId, int unitPrice) {
    final i = entries.indexWhere((e) => e.item.sameConfiguration(item));
    if (i < 0) {
      final id = 'l${DateTime.now().microsecondsSinceEpoch}-${_n++}';
      return [...entries, CartEntry(id: id, item: item, vendorId: vendorId, unitPriceSnapshot: unitPrice)];
    }
    final sum = entries[i].item.withQuantity(entries[i].item.quantity + item.quantity);
    return [...entries]..[i] = entries[i].copyWith(item: sum, unitPriceSnapshot: unitPrice);
  }

  @override
  Future<Cart> get() async => priced(await read());

  @override
  Future<Cart> add(CartItemInput item, {bool replace = false}) async {
    final p = await product(item.productId);
    if (p == null) throw const ApiError(code: 'NOT_FOUND');
    final line = priceLine(p, item.selection);
    if (!line.ok) throw ApiError(code: line.errors.first);
    var entries = await read();
    final current = entries.firstOrNull?.vendorId;
    if (current != null && current != p.vendorId) {
      if (!replace) throw const ApiError(code: CartError.vendorMismatch);
      entries = [];
      onCleared();
    }
    entries = put(entries, item, p.vendorId, line.unitPrice);
    await write(entries);
    return priced(entries);
  }

  /// Changing a line also takes today's price (it clears its PRICE_CHANGED issue).
  @override
  Future<Cart> update(String lineId, int quantity) async {
    final entries = [...await read()];
    final i = entries.indexWhere((e) => e.id == lineId);
    if (i < 0) throw const ApiError(code: 'NOT_FOUND');
    final p = await product(entries[i].item.productId);
    final line = p == null ? null : priceLine(p, entries[i].item.selection);
    entries[i] = entries[i].copyWith(
      item: entries[i].item.withQuantity(quantity),
      unitPriceSnapshot: line != null && line.ok ? line.unitPrice : null,
    );
    await write(entries);
    return priced(entries);
  }

  @override
  Future<Cart> remove(String lineId) async {
    final entries = (await read()).where((e) => e.id != lineId).toList();
    if (entries.isEmpty) onCleared();
    await write(entries);
    return priced(entries);
  }
}

/// The cart kept on this device: a guest's cart (merged into the account on sign-in), and everyone's
/// cart in builds without the cart API. Priced from the public product; no coupons or merge.
// shortcut: real builds keep every cart here until CRT-API-1 #61 lands (not-built-yet.md).
class LocalCartRepository extends EntriesCart {
  LocalCartRepository(this._prefs, super.product, {super.settings});

  final Prefs _prefs;

  /// Removed by `Prefs.clearAccountData()` on sign-out like the other account data.
  static const key = 'cart.local';

  List<CartEntry> get entries {
    final raw = _prefs.getString(key);
    if (raw == null) return const [];
    try {
      return [for (final e in jsonDecode(raw) as List) CartEntry.fromJson(e as Map<String, dynamic>)];
    } on Object {
      return const []; // an unreadable cart from an older build is dropped, not a crash
    }
  }

  List<CartItemInput> get items => [for (final e in entries) e.item];

  Future<void> clear() async {
    await _prefs.remove(key);
    await _prefs.remove(mergeIdKey); // the next device cart is another merge
  }

  @override
  Future<List<CartEntry>> read() async => entries;

  @override
  Future<void> write(List<CartEntry> entries) async {
    if (entries.isEmpty) return clear();
    mergeId; // made with the first line, kept with the cart
    await _prefs.setString(key, jsonEncode([for (final e in entries) e.toJson()]));
  }

  @override
  Future<Cart> priced(List<CartEntry> entries) async => priceCart(
    entries,
    await products(entries.map((e) => e.item.productId)),
    settings: settings,
    onDevice: true,
  );

  @override
  Future<Cart> applyCoupon(String code) => throw UnsupportedError('coupons need the account cart');

  @override
  Future<Cart> removeCoupon() => throw UnsupportedError('coupons need the account cart');

  @override
  Future<CartMergeResult> merge(List<CartItemInput> items, {String? mergeId}) =>
      throw UnsupportedError('merge is a server call');

  static const mergeIdKey = 'cart.local.mergeId';

  /// One stable id per device cart, made with its first line and dropped with it; sent with the merge.
  String get mergeId {
    final id = _prefs.getString(mergeIdKey);
    if (id != null) return id;
    final made = newIdempotencyKey();
    unawaited(_prefs.setString(mergeIdKey, made));
    return made;
  }
}

/// A mock CRT-API-3 coupon. Dates are flags (the mock has no clock here): [scheduled] = `startsAt` in the future,
/// [expired] = `endsAt` passed.
class _Coupon {
  const _Coupon({
    this.percent = 0,
    this.fixed = 0,
    this.maxDiscount,
    this.minOrder,
    this.vendorIds,
    this.categoryIds,
    this.expired = false,
    this.scheduled = false,
    this.isActive = true,
    this.limitReached = false,
    this.perUserLimitReached = false,
    this.firstOrderOnly = false,
  });

  final int percent;
  final int fixed;
  final int? maxDiscount;
  final int? minOrder;
  final Set<String>? vendorIds;
  final Set<String>? categoryIds;
  final bool expired;
  final bool scheduled;
  final bool isActive;
  final bool limitReached;
  final bool perUserLimitReached;
  final bool firstOrderOnly;

  /// Whether a line counts for the discount (a scoped coupon discounts only the eligible lines, CRT-API-3).
  bool eligible(String productId) {
    if (categoryIds == null) return true;
    final card = MockCatalogRepository.productList.where((p) => p.id == productId).firstOrNull;
    return card != null && categoryIds!.contains(card.categoryId);
  }

  /// The discount on the eligible lines' total.
  // shortcut: percent is floored; the server's rounding is open (lead review A10) until CRT-API-3 #62 decides it.
  int discount(int eligibleTotal) {
    final d = fixed + eligibleTotal * percent ~/ 100;
    return maxDiscount == null ? d : d.clamp(0, maxDiscount!);
  }
}

/// The account cart for USE_MOCKS and tests: the server rules of CRT-API-1 / CRT-API-3 in memory, priced
/// against the mock catalog ([MockProductRepository]) on every read.
// shortcut: mock cart until CRT-API-1 #61 and CRT-API-3 #62 land (not-built-yet.md).
class MockCartRepository extends EntriesCart {
  MockCartRepository({ProductLookup? products, this.delay = const Duration(milliseconds: 300)})
    : super(products ?? catalogProduct, settings: opsSettings);

  final Duration delay;

  /// Ops settings as SCH-API-1 #68 would serve them.
  static const opsSettings = CartSettings(minOrder: 10000, deliveryFee: 1500);

  /// The pickup point of each store that offers pickup (in the cart response, SCH-API-2 #69).
  static const pickupPoints = {
    'v-falah': PickupInfo(
      name: LocalizedText('مجازر الفلاح · فرع العليا', 'Al Falah Butchers · Olaya branch'),
      address: LocalizedText('الرياض، حي العليا، طريق التخصصي', 'Riyadh, Al Olaya, Takhassusi Road'),
      point: GeoPoint(24.6950, 46.6830),
      opensAt: '09:00',
      closesAt: '22:00',
    ),
    'v-nukhba': PickupInfo(
      name: LocalizedText('ملحمة النخبة · فرع الياسمين', 'Al Nukhba Butchery · Al Yasmin branch'),
      address: LocalizedText('الرياض، حي الياسمين، طريق أنس بن مالك', 'Riyadh, Al Yasmin, Anas Ibn Malik Road'),
      point: GeoPoint(24.8240, 46.6420),
      opensAt: '10:00',
      closesAt: '23:00',
    ),
    'v-deera': PickupInfo(
      name: LocalizedText('ذبائح الديرة', 'Al Deera Slaughterhouse'),
      address: LocalizedText('الرياض، حي الديرة', 'Riyadh, Al Deera'),
      point: GeoPoint(24.6310, 46.7130),
      opensAt: '08:00',
      closesAt: '21:00',
    ),
  };

  /// Set by the checkout mock once `PATCH /v1/customer/cart/fulfilment` is valid (SCH-MOB-1 #71).
  FulfilmentChoice? fulfilment;

  /// JAZLA10 is the valid one; each other code answers one coupon error.
  static const _coupons = {
    'JAZLA10': _Coupon(percent: 10, maxDiscount: 5000),
    'EID25': _Coupon(percent: 25, expired: true),
    'BIG50': _Coupon(fixed: 5000, minOrder: 30000),
    'FALAH15': _Coupon(percent: 15, vendorIds: {'v-falah'}),
    'WELCOME5': _Coupon(fixed: 500, limitReached: true),
    'BEEF20': _Coupon(percent: 20, categoryIds: {'c-cattle'}), // beef lines only
    'SOON10': _Coupon(percent: 10, scheduled: true),
    'OFF10': _Coupon(percent: 10, isActive: false),
    'ONCE10': _Coupon(percent: 10, perUserLimitReached: true),
    'FIRST15': _Coupon(percent: 15, firstOrderOnly: true),
  };

  /// For FIRST15: the customer already has an order (first-order coupons then refuse).
  bool hasOrdered = false;

  static Future<ProductDetail?> catalogProduct(String id) async {
    final card = MockCatalogRepository.productList.where((p) => p.id == id).firstOrNull;
    return card == null ? null : MockProductRepository.detail(card);
  }

  List<CartEntry> _entries = [];
  String? _coupon;

  Future<void> _wait() => delay > Duration.zero ? Future<void>.delayed(delay) : Future.value();

  @override
  Future<List<CartEntry>> read() async {
    await _wait();
    return _entries;
  }

  @override
  Future<void> write(List<CartEntry> entries) async => _entries = entries;

  /// Another store (or none): its coupon and fulfilment no longer apply.
  @override
  void onCleared() {
    _coupon = null;
    fulfilment = null;
  }

  String? _check(String code, Cart cart) {
    final c = _coupons[code];
    // shortcut: an inactive coupon answers not found and a scheduled one not applicable until CRT-API-3 #62
    // names their codes (lead review A10, not-built-yet.md).
    if (c == null || !c.isActive) return CartError.couponNotFound;
    if (c.expired) return CartError.couponExpired;
    if (c.scheduled) return CartError.couponNotApplicable;
    if (c.limitReached || c.perUserLimitReached) return CartError.couponLimitReached;
    if (c.firstOrderOnly && hasOrdered) return CartError.couponNotApplicable;
    if (c.vendorIds != null && !c.vendorIds!.contains(cart.vendorId)) return CartError.couponNotApplicable;
    if (!cart.lines.any((l) => l.available && c.eligible(l.item.productId))) return CartError.couponNotApplicable;
    if (c.minOrder != null && cart.subtotal < c.minOrder!) return CartError.couponMinOrder;
    return null;
  }

  /// A coupon that stops applying (the subtotal fell under its minimum) is dropped.
  @override
  Future<Cart> priced(List<CartEntry> entries) async {
    final found = await products(entries.map((e) => e.item.productId));
    Cart? plain;
    Cart price(String? code) => priceCart(
      entries,
      found,
      settings: settings,
      couponCode: code,
      // The eligible lines only (every line for an unscoped coupon).
      discountOf: code == null
          ? null
          : (_) => _coupons[code]!.discount(
              plain!.lines.where((l) => _coupons[code]!.eligible(l.item.productId)).fold(0, (s, l) => s + l.lineTotal),
            ),
      fulfilment: fulfilment,
      pickup: pickupPoints[entries.firstOrNull?.vendorId],
    );
    plain = price(null);
    if (_coupon != null && _check(_coupon!, plain) != null) _coupon = null;
    return _coupon == null ? plain : price(_coupon);
  }

  @override
  Future<Cart> applyCoupon(String code) async {
    final normalized = code.trim().toUpperCase(); // codes are case-insensitive
    final cart = await get();
    final error = _check(normalized, cart);
    if (error != null) throw ApiError(code: error);
    _coupon = normalized;
    return priced(_entries);
  }

  @override
  Future<Cart> removeCoupon() async {
    await _wait();
    _coupon = null;
    return priced(_entries);
  }

  /// Same store or an empty account cart: lines merge (same choices sum). Another store: the guest cart
  /// wins and [CartMergeResult.replacedPreviousCart] is set. Lines that cannot be bought are skipped.
  @override
  Future<CartMergeResult> merge(List<CartItemInput> items, {String? mergeId}) async {
    await _wait();
    final seen = mergeId == null ? null : _merged[mergeId];
    if (seen != null) return seen; // the same device cart again: merged once
    final result = await _merge(items);
    if (mergeId != null) _merged[mergeId] = result;
    return result;
  }

  final _merged = <String, CartMergeResult>{};

  Future<CartMergeResult> _merge(List<CartItemInput> items) async {
    var skipped = 0;
    String? vendor;
    final valid = <(CartItemInput, String, int)>[];
    for (final item in items) {
      final p = await product(item.productId);
      final line = p == null ? null : priceLine(p, item.selection);
      if (p == null || !line!.ok || (vendor != null && vendor != p.vendorId)) {
        skipped++;
        continue;
      }
      vendor = p.vendorId;
      valid.add((item, p.vendorId, line.unitPrice));
    }
    var replaced = false;
    if (vendor != null && _entries.isNotEmpty && _entries.first.vendorId != vendor) {
      _entries = [];
      onCleared();
      replaced = true;
    }
    for (final (item, vendorId, price) in valid) {
      _entries = put(_entries, item, vendorId, price);
    }
    return CartMergeResult(cart: await priced(_entries), replacedPreviousCart: replaced, skipped: skipped);
  }
}
