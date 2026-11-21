/// The customer's cart in the shapes of CRT-API-1 / CRT-API-3 (sprint-3.md). Money is integer halalas, VAT
/// included. Every unit and line price comes from [priceLine]; [priceCart] only adds the lines up.
library;

import 'dart:math';

import 'package:flutter/foundation.dart';

import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/domain/price.dart';
import 'package:jazlah/features/product/domain/product.dart';

abstract final class CartError {
  static const vendorMismatch = 'CART_VENDOR_MISMATCH';
  static const couponNotFound = 'COUPON_NOT_FOUND';
  static const couponExpired = 'COUPON_EXPIRED';
  static const couponMinOrder = 'COUPON_MIN_ORDER';
  static const couponNotApplicable = 'COUPON_NOT_APPLICABLE';
  static const couponLimitReached = 'COUPON_LIMIT_REACHED';
}

/// Codes of `issues[]`. Both block checkout.
abstract final class CartIssueCode {
  static const priceChanged = 'PRICE_CHANGED';

  /// The app's name until CRT-API-1 #61 fixes it (not-built-yet.md).
  static const unavailable = 'ITEM_UNAVAILABLE';
}

/// One line as the customer picked it: the body of "add item" and of each merge item.
@immutable
class CartItemInput {
  const CartItemInput({
    required this.productId,
    required this.sizeId,
    this.cutId,
    this.packagingId,
    this.exclusionIds = const [],
    this.notes = '',
    this.quantity = 1,
  });

  factory CartItemInput.fromSelection(String productId, ProductSelection s, {String notes = ''}) => CartItemInput(
    productId: productId,
    sizeId: s.sizeId!,
    cutId: s.cutId,
    packagingId: s.packagingId,
    exclusionIds: s.exclusionIds.toList()..sort(),
    notes: notes.trim(),
    quantity: s.quantity,
  );

  factory CartItemInput.fromJson(Map<String, dynamic> j) => CartItemInput(
    productId: j['productId'] as String,
    sizeId: j['sizeId'] as String,
    cutId: j['cutId'] as String?,
    packagingId: j['packagingId'] as String?,
    exclusionIds: [for (final e in j['exclusionIds'] as List) e as String],
    notes: j['notes'] as String? ?? '',
    quantity: j['quantity'] as int,
  );

  final String productId;
  final String sizeId;
  final String? cutId;
  final String? packagingId;
  final List<String> exclusionIds;
  final String notes;
  final int quantity;

  Map<String, Object?> toJson() => {
    'productId': productId,
    'sizeId': sizeId,
    'cutId': cutId,
    'packagingId': packagingId,
    'exclusionIds': exclusionIds,
    'notes': notes,
    'quantity': quantity,
  };

  ProductSelection get selection => ProductSelection(
    sizeId: sizeId,
    cutId: cutId,
    packagingId: packagingId,
    exclusionIds: exclusionIds.toSet(),
    quantity: quantity,
  );

  /// Same product and choices: adding or merging it sums the quantities instead of a new line.
  bool sameConfiguration(CartItemInput o) =>
      productId == o.productId &&
      sizeId == o.sizeId &&
      cutId == o.cutId &&
      packagingId == o.packagingId &&
      setEquals(exclusionIds.toSet(), o.exclusionIds.toSet()) &&
      notes.trim() == o.notes.trim();

  CartItemInput withQuantity(int q) => CartItemInput(
    productId: productId,
    sizeId: sizeId,
    cutId: cutId,
    packagingId: packagingId,
    exclusionIds: exclusionIds,
    notes: notes,
    quantity: q.clamp(1, ProductSelection.maxQuantity),
  );
}

/// A line as a cart keeps it (CartItem): the choices, the product's store and the unit price when added.
@immutable
class CartEntry {
  const CartEntry({required this.id, required this.item, required this.vendorId, required this.unitPriceSnapshot});

  factory CartEntry.fromJson(Map<String, dynamic> j) => CartEntry(
    id: j['id'] as String,
    item: CartItemInput.fromJson(j['item'] as Map<String, dynamic>),
    vendorId: j['vendorId'] as String,
    unitPriceSnapshot: j['unitPriceSnapshot'] as int,
  );

  final String id;
  final CartItemInput item;
  final String vendorId;
  final int unitPriceSnapshot;

  Map<String, Object?> toJson() => {
    'id': id,
    'item': item.toJson(),
    'vendorId': vendorId,
    'unitPriceSnapshot': unitPriceSnapshot,
  };

  CartEntry copyWith({CartItemInput? item, int? unitPriceSnapshot}) => CartEntry(
    id: id,
    item: item ?? this.item,
    vendorId: vendorId,
    unitPriceSnapshot: unitPriceSnapshot ?? this.unitPriceSnapshot,
  );
}

/// A priced line, ready to show.
@immutable
class CartLine {
  const CartLine({
    required this.id,
    required this.item,
    required this.unitPrice,
    required this.lineTotal,
    required this.unitPriceSnapshot,
    required this.available,
    this.name,
    this.image,
    this.sizeGrams,
    this.cutName,
  });

  final String id;
  final CartItemInput item;

  /// Null when the product no longer exists.
  final LocalizedText? name;
  final String? image;
  final int? sizeGrams;
  final LocalizedText? cutName;

  /// 0 when not [available].
  final int unitPrice;
  final int lineTotal;
  final int unitPriceSnapshot;
  final bool available;
}

@immutable
class CartIssue {
  const CartIssue(this.code, this.lineId, {this.oldUnitPrice, this.newUnitPrice});

  final String code;
  final String lineId;
  final int? oldUnitPrice;
  final int? newUnitPrice;
}

/// The ops settings the cart needs (SCH-API-1 `ops.minOrderHalalas`, `ops.deliveryFeeHalalas`).
@immutable
class CartSettings {
  const CartSettings({required this.minOrder, required this.deliveryFee});

  final int minOrder;
  final int deliveryFee;
}

/// How and when the order is received (`PATCH /v1/customer/cart/fulfilment`, SCH-API-2). [date] is a Riyadh
/// `yyyy-MM-dd` as the server sends it; [addressId] only for delivery.
@immutable
class FulfilmentChoice {
  const FulfilmentChoice({required this.method, required this.date, this.addressId});

  /// Delivery or pickup ([Fulfilment.both] is a product flag, never a choice).
  final Fulfilment method;
  final String date;
  final String? addressId;
}

/// Where a pickup order is collected (SCH-API-2: vendor address, map point, hours, instructions). [opensAt] and
/// [closesAt] are Riyadh `HH:mm`.
@immutable
class PickupInfo {
  const PickupInfo({
    required this.name,
    required this.address,
    required this.point,
    required this.opensAt,
    required this.closesAt,
    this.instructions,
  });

  final LocalizedText name;
  final LocalizedText address;
  final GeoPoint point;
  final String opensAt;
  final String closesAt;
  final LocalizedText? instructions;
}

@immutable
class Cart {
  const Cart({
    required this.lines,
    required this.subtotal,
    required this.discount,
    required this.deliveryFee,
    required this.total,
    required this.vatIncluded,
    required this.canCheckout,
    required this.issues,
    this.vendorId,
    this.vendorName,
    this.couponCode,
    this.minOrder,
    this.minOrderRemaining,
    this.fulfilment,
    this.pickup,
    this.onDevice = false,
  });

  static const empty = Cart(
    lines: [],
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
    vatIncluded: 0,
    canCheckout: false,
    issues: [],
  );

  final List<CartLine> lines;
  final String? vendorId;
  final LocalizedText? vendorName;
  final String? couponCode;
  final int subtotal;
  final int discount;
  final int deliveryFee;
  final int total;
  final int vatIncluded;

  /// Null when the ops settings are unknown (no settings API yet in real builds): hidden, no checkout.
  final int? minOrder;
  final int? minOrderRemaining;
  final bool canCheckout;
  final List<CartIssue> issues;

  /// Chosen at checkout step 1 (SCH-MOB-1 #71); null until then.
  final FulfilmentChoice? fulfilment;

  /// The store's pickup point; null when it does not offer pickup (or the cart is empty).
  final PickupInfo? pickup;

  /// Fulfilment is delivery: only then is the delivery fee shown (and counted).
  bool get delivery => fulfilment?.method == Fulfilment.delivery;

  /// Kept on this device (guest, or no cart API): no coupons, merged into the account cart on sign-in.
  final bool onDevice;

  int get count => lines.fold(0, (n, l) => n + l.item.quantity);

  CartIssue? issueOf(String lineId) => issues.where((i) => i.lineId == lineId).firstOrNull;
}

/// The lines, issues and totals of a cart. [products] holds each product as it is now (null: gone);
/// [discountOf] turns the subtotal into the coupon's discount.
Cart priceCart(
  List<CartEntry> entries,
  Map<String, ProductDetail?> products, {
  CartSettings? settings,
  String? couponCode,
  int Function(int subtotal)? discountOf,
  FulfilmentChoice? fulfilment,
  PickupInfo? pickup,
  bool onDevice = false,
}) {
  final delivery = fulfilment?.method == Fulfilment.delivery;
  final lines = <CartLine>[];
  final issues = <CartIssue>[];
  LocalizedText? vendorName;
  for (final e in entries) {
    final p = products[e.item.productId];
    final priced = p == null ? null : priceLine(p, e.item.selection);
    final ok = priced?.ok ?? false;
    vendorName ??= p?.vendorName;
    lines.add(
      CartLine(
        id: e.id,
        item: e.item,
        name: p?.name,
        image: p?.images.firstOrNull,
        sizeGrams: p?.sizes.where((s) => s.id == e.item.sizeId).firstOrNull?.grams,
        cutName: p?.cuts.where((c) => c.id == e.item.cutId).firstOrNull?.name,
        unitPrice: ok ? priced!.unitPrice : 0,
        lineTotal: ok ? priced!.lineTotal : 0,
        unitPriceSnapshot: e.unitPriceSnapshot,
        available: ok,
      ),
    );
    if (!ok) {
      issues.add(CartIssue(CartIssueCode.unavailable, e.id));
    } else if (priced!.unitPrice != e.unitPriceSnapshot) {
      issues.add(
        CartIssue(
          CartIssueCode.priceChanged,
          e.id,
          oldUnitPrice: e.unitPriceSnapshot,
          newUnitPrice: priced.unitPrice,
        ),
      );
    }
  }
  final subtotal = lines.fold(0, (s, l) => s + l.lineTotal);
  final discount = lines.isEmpty ? 0 : (discountOf?.call(subtotal) ?? 0).clamp(0, subtotal);
  final deliveryFee = delivery && settings != null && lines.isNotEmpty ? settings.deliveryFee : 0;
  final total = subtotal - discount + deliveryFee;
  final remaining = settings == null ? null : max(0, settings.minOrder - subtotal);
  return Cart(
    lines: lines,
    vendorId: entries.firstOrNull?.vendorId,
    vendorName: vendorName,
    couponCode: couponCode,
    subtotal: subtotal,
    discount: discount,
    deliveryFee: deliveryFee,
    total: total,
    // Prices include 15% VAT: the VAT part of the total, rounded half up.
    vatIncluded: (total * 15 + 57) ~/ 115,
    minOrder: settings?.minOrder,
    minOrderRemaining: remaining,
    canCheckout: lines.isNotEmpty && issues.isEmpty && remaining == 0,
    issues: issues,
    fulfilment: fulfilment,
    pickup: pickup,
    onDevice: onDevice,
  );
}

/// What signing in did to the guest cart (`POST /v1/customer/cart/merge`).
@immutable
class CartMergeResult {
  const CartMergeResult({required this.cart, this.replacedPreviousCart = false, this.skipped = 0});

  final Cart cart;

  /// The account cart was from another store; the guest cart replaced it.
  final bool replacedPreviousCart;

  /// Guest lines that could not be bought any more and were left out.
  final int skipped;
}
