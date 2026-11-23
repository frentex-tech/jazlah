import 'package:dio/dio.dart' show Response;
import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/cart/data/cart_repository.dart';
import 'package:jazlah/features/cart/domain/cart.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/product/domain/product.dart';

/// The account cart on the API (CRT-API-1 `/v1/customer/cart…`, CRT-API-3 coupon routes), through the generated
/// client. The server prices every line; its totals (`vatHalalas` and the rest) are shown as they come, never
/// recomputed on the device.
class ApiCartRepository implements CartRepository {
  ApiCartRepository(this._api);

  final JazlaApi _api;

  CustomerCartApi get _cart => _api.getCustomerCartApi();

  Future<Cart> _call(Future<Response<CartResponseDto>> Function() f) async {
    try {
      return cartFrom((await f()).data!);
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  @override
  Future<Cart> get() => _call(() => _cart.customerGetCart());

  @override
  Future<Cart> add(CartItemInput item, {bool replace = false}) => _call(
    () => _cart.customerAddCartItem(
      addCartItemDto: AddCartItemDto(
        productId: item.productId,
        sizeId: item.sizeId,
        cuttingStyleId: item.cutId,
        packaging: _enum(AddCartItemDtoPackagingEnum.values, item.packagingId),
        exclusionItemIds: item.exclusionIds,
        notes: item.notes.isEmpty ? null : item.notes,
        quantity: item.quantity,
        replaceCart: replace ? true : null,
      ),
    ),
  );

  @override
  Future<Cart> update(String lineId, int quantity) => _call(
    () => _cart.customerUpdateCartItem(
      id: lineId,
      updateCartItemDto: UpdateCartItemDto(quantity: quantity),
    ),
  );

  @override
  Future<Cart> remove(String lineId) => _call(() => _cart.customerRemoveCartItem(id: lineId));

  @override
  Future<Cart> applyCoupon(String code) =>
      _call(() => _cart.customerApplyCoupon(applyCouponDto: ApplyCouponDto(code: code.trim())));

  @override
  Future<Cart> removeCoupon() => _call(() => _cart.customerRemoveCoupon());

  @override
  Future<CartMergeResult> merge(List<CartItemInput> items, {String? mergeId}) async {
    try {
      final res = (await _cart.customerMergeCart(
        mergeCartDto: MergeCartDto(
          // The contract requires one; the device cart always has its own (LocalCartRepository.mergeId).
          mergeId: mergeId!,
          items: [
            for (final i in items)
              CartItemInputDto(
                productId: i.productId,
                sizeId: i.sizeId,
                cuttingStyleId: i.cutId,
                packaging: _enum(CartItemInputDtoPackagingEnum.values, i.packagingId),
                exclusionItemIds: i.exclusionIds,
                notes: i.notes.isEmpty ? null : i.notes,
                quantity: i.quantity,
              ),
          ],
        ),
      )).data!;
      return CartMergeResult(
        cart: cartFrom(res.cart),
        replacedPreviousCart: res.replacedPreviousCart,
        skipped: res.skippedCount,
      );
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}

/// The generated enum value named [value] (packagings are sent by their enum value).
T? _enum<T extends Enum>(List<T> values, String? value) =>
    value == null ? null : values.where((e) => (e as dynamic).value == value).firstOrNull;

LocalizedText text(LocalizedTextResponseDto t) => LocalizedText(t.ar, t.en);

GeoPoint? point(GeoPointDto? p) => p == null ? null : GeoPoint(p.latitude.toDouble(), p.longitude.toDouble());

Fulfilment fulfilmentFrom(FulfilmentMethod m) => m == FulfilmentMethod.pickup ? Fulfilment.pickup : Fulfilment.delivery;

/// `pickupPoint { name, address, location, phone, hours }`.
PickupInfo? pickupFrom(PickupPointResponseDto? p) => p == null
    ? null
    : PickupInfo(
        name: text(p.name),
        address: p.address == null ? null : text(p.address!),
        point: point(p.location),
        opensAt: p.hours?.start,
        closesAt: p.hours?.end,
        phone: p.phone,
      );

/// `CartResponseDto` as the app's [Cart].
Cart cartFrom(CartResponseDto d) {
  final issues = [
    for (final i in d.issues)
      CartIssue(i.code.value, i.lineId, oldUnitPrice: i.oldUnitPriceHalalas, newUnitPrice: i.newUnitPriceHalalas),
  ];
  return Cart(
    lines: [
      for (final l in d.lines)
        CartLine(
          id: l.id,
          item: CartItemInput(
            productId: l.productId,
            sizeId: l.size.id,
            cutId: l.cutting?.id,
            packagingId: l.packaging?.value,
            exclusionIds: [for (final e in l.exclusions) e.id],
            notes: l.notes ?? '',
            quantity: l.quantity,
          ),
          name: text(l.name),
          image: l.imageUrl,
          sizeGrams: l.size.approxWeightGrams,
          cutName: l.cutting == null ? null : text(l.cutting!.name),
          unitPrice: l.unitPriceHalalas,
          lineTotal: l.totalHalalas,
          // The price when added is only known from a price-changed issue; otherwise it is today's.
          unitPriceSnapshot:
              issues.where((i) => i.lineId == l.id && i.oldUnitPrice != null).firstOrNull?.oldUnitPrice ??
              l.unitPriceHalalas,
          available: l.isAvailable,
        ),
    ],
    vendorId: d.vendor?.id,
    vendorName: d.vendor == null ? null : text(d.vendor!.name),
    couponCode: d.coupon?.code,
    subtotal: d.subtotalHalalas,
    discount: d.discountHalalas,
    deliveryFee: d.deliveryFeeHalalas,
    total: d.totalHalalas,
    vatIncluded: d.vatHalalas,
    minOrder: d.minOrderHalalas,
    minOrderRemaining: d.minOrderRemainingHalalas,
    canCheckout: d.canCheckout,
    issues: issues,
    fulfilment: d.fulfilment == null
        ? null
        : FulfilmentChoice(
            method: fulfilmentFrom(d.fulfilment!.method),
            date: d.fulfilment!.date,
            addressId: d.fulfilment!.addressId,
          ),
    pickup: pickupFrom(d.fulfilment?.pickupPoint),
  );
}
