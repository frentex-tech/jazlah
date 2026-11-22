// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coupon_usage_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CouponUsageResponseDto _$CouponUsageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CouponUsageResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['uses', 'distinctCustomers', 'totalDiscountHalalas'],
  );
  final val = CouponUsageResponseDto(
    uses: $checkedConvert('uses', (v) => (v as num).toInt()),
    distinctCustomers: $checkedConvert(
      'distinctCustomers',
      (v) => (v as num).toInt(),
    ),
    totalDiscountHalalas: $checkedConvert(
      'totalDiscountHalalas',
      (v) => (v as num).toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$CouponUsageResponseDtoToJson(
  CouponUsageResponseDto instance,
) => <String, dynamic>{
  'uses': instance.uses,
  'distinctCustomers': instance.distinctCustomers,
  'totalDiscountHalalas': instance.totalDiscountHalalas,
};
