// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'apply_coupon_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApplyCouponDto _$ApplyCouponDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ApplyCouponDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['code']);
      final val = ApplyCouponDto(
        code: $checkedConvert('code', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$ApplyCouponDtoToJson(ApplyCouponDto instance) =>
    <String, dynamic>{'code': instance.code};
