import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// A product's detail page data (GET /v1/public/products/{id}).
// ignore: one_member_abstracts, the seam between the API and the USE_MOCKS data.
abstract interface class ProductRepository {
  Future<ProductDetail> product(String id);
}

class ApiProductRepository implements ProductRepository {
  ApiProductRepository(this._api);

  final JazlaApi _api;

  /// The API names packagings by kind only.
  static const packagingNames = {
    'trays': LocalizedText('أطباق', 'Trays'),
    'bags': LocalizedText('كيس عادي', 'Regular bag'),
    'vacuum': LocalizedText('تغليف مفرغ', 'Vacuum packed'),
    'none': LocalizedText('بدون تغليف', 'No packaging'),
  };

  static LocalizedText _text(LocalizedTextResponseDto t) => LocalizedText(t.ar, t.en);

  static ProductDetail _detail(PublicProductResponseDto d) {
    final ar = d.description.ar ?? d.description.en;
    final en = d.description.en ?? d.description.ar;
    return ProductDetail(
      id: d.id,
      vendorId: d.vendor.id,
      vendorName: d.vendor.name == null ? null : _text(d.vendor.name!),
      name: _text(d.name),
      description: ar == null ? null : LocalizedText(ar, en!),
      fulfilment: switch (d.fulfilment) {
        PublicProductResponseDtoFulfilmentEnum.delivery => Fulfilment.delivery,
        PublicProductResponseDtoFulfilmentEnum.pickup => Fulfilment.pickup,
        PublicProductResponseDtoFulfilmentEnum.both => Fulfilment.both,
        PublicProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi => null,
      },
      images: [for (final i in d.images) ?i.url],
      sizes: [
        for (final (i, s) in d.sizes.indexed)
          ProductSize(
            // shortcut: size id is nullable in the contract, positional id until CRT-API-1 (#61) needs a real one, API gap
            id: s.id ?? '${ProductSize.standInPrefix}$i',
            grams: s.approxWeightGrams.toInt(),
            priceHalalas: s.priceHalalas.toInt(),
            tag: s.tag == null ? null : _text(s.tag!),
          ),
      ],
      cuts: [
        // A cut without a name is skipped (never show its id), as an unknown packaging is.
        for (final c in d.cuttings)
          if (c.name case final name?)
            ProductOption(id: c.cuttingStyleId, name: _text(name), extraHalalas: c.extraPriceHalalas.toInt()),
      ],
      packagings: [
        for (final p in d.packagings)
          if (packagingNames[p.packaging.value] case final name?)
            ProductOption(id: p.packaging.value, name: name, extraHalalas: p.extraPriceHalalas.toInt()),
      ],
      exclusions: [for (final e in d.exclusions) ProductOption(id: e.id, name: _text(e.name))],
      // shortcut: the public detail has no availability, per-size stock, store rating, freshness, default
      // size or cut↔packaging rules, API gap for CAT-API-5 #50 (not-built-yet.md). Shown as available with no rules; the
      // server still refuses an unavailable size or an incompatible pair when the cart prices the line.
    );
  }

  @override
  Future<ProductDetail> product(String id) async {
    try {
      return _detail((await _api.getPublicCatalogApi().publicGetProduct(id: id)).data!);
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}
