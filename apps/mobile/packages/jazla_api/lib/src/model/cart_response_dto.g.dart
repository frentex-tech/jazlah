// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartResponseDto _$CartResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'vendor',
      'lines',
      'coupon',
      'fulfilment',
      'subtotalHalalas',
      'discountHalalas',
      'deliveryFeeHalalas',
      'totalHalalas',
      'vatHalalas',
      'minOrderHalalas',
      'minOrderRemainingHalalas',
      'issues',
      'canCheckout',
    ],
  );
  final val = CartResponseDto(
    vendor: $checkedConvert(
      'vendor',
      (v) => v == null
          ? null
          : CartVendorResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    lines: $checkedConvert(
      'lines',
      (v) => (v as List<dynamic>)
          .map((e) => CartLineResponseDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    coupon: $checkedConvert(
      'coupon',
      (v) => v == null
          ? null
          : CartCouponResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    fulfilment: $checkedConvert(
      'fulfilment',
      (v) => v == null
          ? null
          : CartFulfilmentResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    subtotalHalalas: $checkedConvert(
      'subtotalHalalas',
      (v) => (v as num).toInt(),
    ),
    discountHalalas: $checkedConvert(
      'discountHalalas',
      (v) => (v as num).toInt(),
    ),
    deliveryFeeHalalas: $checkedConvert(
      'deliveryFeeHalalas',
      (v) => (v as num).toInt(),
    ),
    totalHalalas: $checkedConvert('totalHalalas', (v) => (v as num).toInt()),
    vatHalalas: $checkedConvert('vatHalalas', (v) => (v as num).toInt()),
    minOrderHalalas: $checkedConvert(
      'minOrderHalalas',
      (v) => (v as num).toInt(),
    ),
    minOrderRemainingHalalas: $checkedConvert(
      'minOrderRemainingHalalas',
      (v) => (v as num).toInt(),
    ),
    issues: $checkedConvert(
      'issues',
      (v) => (v as List<dynamic>)
          .map((e) => CartIssueResponseDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    canCheckout: $checkedConvert('canCheckout', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$CartResponseDtoToJson(CartResponseDto instance) =>
    <String, dynamic>{
      'vendor': instance.vendor?.toJson(),
      'lines': instance.lines.map((e) => e.toJson()).toList(),
      'coupon': instance.coupon?.toJson(),
      'fulfilment': instance.fulfilment?.toJson(),
      'subtotalHalalas': instance.subtotalHalalas,
      'discountHalalas': instance.discountHalalas,
      'deliveryFeeHalalas': instance.deliveryFeeHalalas,
      'totalHalalas': instance.totalHalalas,
      'vatHalalas': instance.vatHalalas,
      'minOrderHalalas': instance.minOrderHalalas,
      'minOrderRemainingHalalas': instance.minOrderRemainingHalalas,
      'issues': instance.issues.map((e) => e.toJson()).toList(),
      'canCheckout': instance.canCheckout,
    };
