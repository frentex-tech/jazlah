/// The one place the app prices a product line, with the formula of CAT-API-1 / CRT-API-1
/// (PricingService.priceLine): unit = size + cut extra + packaging extra, line = unit × quantity, VAT
/// included, exclusions free. Same result shape and error codes as the server. The server stays
/// authoritative in the cart; swap this for its price here when the product page should show it.
library;

import 'package:jazlah/features/product/domain/product.dart';

abstract final class PriceError {
  static const productUnavailable = 'PRODUCT_UNAVAILABLE';
  static const sizeUnavailable = 'SIZE_UNAVAILABLE';
  static const cutPackagingIncompatible = 'CUT_PACKAGING_INCOMPATIBLE';
  static const optionNotInProduct = 'OPTION_NOT_IN_PRODUCT';
}

enum PriceKind { size, cut, packaging }

/// One priced part of the unit price.
class PriceComponent {
  const PriceComponent(this.kind, this.optionId, this.halalas);

  final PriceKind kind;
  final String optionId;
  final int halalas;
}

class PriceLine {
  const PriceLine({required this.unitPrice, required this.lineTotal, required this.breakdown, required this.errors});

  final int unitPrice;
  final int lineTotal;
  final List<PriceComponent> breakdown;

  /// [PriceError] codes. When not empty, the line cannot be bought and its prices are 0.
  final List<String> errors;

  bool get ok => errors.isEmpty;
}

PriceLine priceLine(ProductDetail p, ProductSelection s) {
  assert(s.quantity >= 1, 'quantity starts at 1');
  final errors = <String>{};
  T? find<T>(List<T> list, String? id, String Function(T) idOf) {
    if (id == null) return null;
    final hit = list.where((o) => idOf(o) == id).firstOrNull;
    if (hit == null) errors.add(PriceError.optionNotInProduct);
    return hit;
  }

  if (!p.available) errors.add(PriceError.productUnavailable);
  final size = find(p.sizes, s.sizeId, (o) => o.id);
  if (s.sizeId == null) errors.add(PriceError.optionNotInProduct);
  if (size != null && !size.available) errors.add(PriceError.sizeUnavailable);
  final cut = find(p.cuts, s.cutId, (o) => o.id);
  final packaging = find(p.packagings, s.packagingId, (o) => o.id);
  for (final id in s.exclusionIds) {
    find(p.exclusions, id, (o) => o.id);
  }
  if (!p.compatible(s.cutId, s.packagingId)) errors.add(PriceError.cutPackagingIncompatible);
  if (errors.isNotEmpty) return PriceLine(unitPrice: 0, lineTotal: 0, breakdown: const [], errors: errors.toList());

  final breakdown = [
    PriceComponent(PriceKind.size, size!.id, size.priceHalalas),
    if (cut != null) PriceComponent(PriceKind.cut, cut.id, cut.extraHalalas),
    if (packaging != null) PriceComponent(PriceKind.packaging, packaging.id, packaging.extraHalalas),
  ];
  final unit = breakdown.fold(0, (sum, c) => sum + c.halalas);
  return PriceLine(unitPrice: unit, lineTotal: unit * s.quantity, breakdown: breakdown, errors: const []);
}
