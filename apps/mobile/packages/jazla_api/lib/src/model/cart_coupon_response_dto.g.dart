// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_coupon_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartCouponResponseDto _$CartCouponResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartCouponResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['code', 'discountHalalas']);
  final val = CartCouponResponseDto(
    code: $checkedConvert('code', (v) => v as String),
    discountHalalas: $checkedConvert(
      'discountHalalas',
      (v) => (v as num).toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$CartCouponResponseDtoToJson(
  CartCouponResponseDto instance,
) => <String, dynamic>{
  'code': instance.code,
  'discountHalalas': instance.discountHalalas,
};
