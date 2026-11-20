/// A product as its detail page shows it (public product, CAT-API-5). Money is integer halalas, VAT
/// included. Fields marked "API gap" have no source in openapi.json yet: only the mock fills them, the
/// API repository leaves the default and the page hides what they feed (docs/frontend/not-built-yet.md).
library;

import 'package:jazlah/features/catalog/domain/catalog.dart';

class ProductSize {
  const ProductSize({
    required this.id,
    required this.grams,
    required this.priceHalalas,
    this.tag,
    this.available = true,
  });

  final String id;

  /// Approximate weight; the label ("500 g", "1 kg") is built from it.
  final int grams;
  final int priceHalalas;
  final LocalizedText? tag;

  /// API gap: stock per size.
  final bool available;
}

/// A cut, a packaging or an exclusion. Exclusions are free.
class ProductOption {
  const ProductOption({required this.id, required this.name, this.extraHalalas = 0});

  final String id;
  final LocalizedText name;
  final int extraHalalas;
}

class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.vendorId,
    required this.name,
    required this.sizes,
    this.vendorName,
    this.description,
    this.images = const [],
    this.cuts = const [],
    this.packagings = const [],
    this.exclusions = const [],
    this.available = true,
    this.vendorRating,
    this.slaughteredAt,
    this.deliveredWithinHours,
    this.defaultSizeId,
    this.incompatible = const {},
  });

  final String id;
  final String vendorId;
  final LocalizedText? vendorName;
  final LocalizedText name;
  final LocalizedText? description;
  final List<String> images;
  final List<ProductSize> sizes;
  final List<ProductOption> cuts;
  final List<ProductOption> packagings;
  final List<ProductOption> exclusions;

  /// API gap: the detail has no availability flag (the card has).
  final bool available;

  /// API gap: the store's rating.
  final double? vendorRating;

  /// API gap: slaughter time today (minutes after midnight, Riyadh) and the chilled delivery window.
  final int? slaughteredAt;
  final int? deliveredWithinHours;

  /// API gap: the size picked when the page opens; else the first available one.
  final String? defaultSizeId;

  /// API gap: packaging id → the cut ids it does not go with.
  final Map<String, Set<String>> incompatible;

  /// A choice must be made when the product has cuts.
  bool get cutRequired => cuts.isNotEmpty;

  bool compatible(String? cutId, String? packagingId) =>
      cutId == null || packagingId == null || !(incompatible[packagingId]?.contains(cutId) ?? false);
}

/// What the customer picked on the page. Immutable; the page swaps it on every change.
class ProductSelection {
  const ProductSelection({this.sizeId, this.cutId, this.packagingId, this.exclusionIds = const {}, this.quantity = 1});

  /// The default size if it can be bought, else the first one that can; nothing else is pre-picked.
  factory ProductSelection.initial(ProductDetail p) {
    final open = p.sizes.where((s) => s.available);
    final preferred = open.where((s) => s.id == p.defaultSizeId);
    return ProductSelection(sizeId: (preferred.isNotEmpty ? preferred : open).firstOrNull?.id);
  }

  final String? sizeId;
  final String? cutId;
  final String? packagingId;
  final Set<String> exclusionIds;
  final int quantity;

  static const maxQuantity = 99;

  ProductSelection _copy({
    required String? sizeId,
    required String? cutId,
    required String? packagingId,
    Set<String>? exclusionIds,
    int? quantity,
  }) => ProductSelection(
    sizeId: sizeId,
    cutId: cutId,
    packagingId: packagingId,
    exclusionIds: exclusionIds ?? this.exclusionIds,
    quantity: quantity ?? this.quantity,
  );

  ProductSelection withSize(String id) => _copy(sizeId: id, cutId: cutId, packagingId: packagingId);

  /// Choosing a cut drops a packaging that does not go with it (the customer picks one again).
  ProductSelection withCut(ProductDetail p, String id) =>
      _copy(sizeId: sizeId, cutId: id, packagingId: p.compatible(id, packagingId) ? packagingId : null);

  /// An incompatible packaging cannot be chosen: the selection stays as it was.
  ProductSelection withPackaging(ProductDetail p, String id) =>
      p.compatible(cutId, id) ? _copy(sizeId: sizeId, cutId: cutId, packagingId: id) : this;

  ProductSelection toggleExclusion(String id) => _copy(
    sizeId: sizeId,
    cutId: cutId,
    packagingId: packagingId,
    exclusionIds: exclusionIds.contains(id) ? ({...exclusionIds}..remove(id)) : {...exclusionIds, id},
  );

  ProductSelection withQuantity(int q) =>
      _copy(sizeId: sizeId, cutId: cutId, packagingId: packagingId, quantity: q.clamp(1, maxQuantity));
}
