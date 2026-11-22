// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_coupon_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCouponDto _$UpdateCouponDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('UpdateCouponDto', json, ($checkedConvert) {
      final val = UpdateCouponDto(
        code: $checkedConvert('code', (v) => v as String?),
        type: $checkedConvert(
          'type',
          (v) => $enumDecodeNullable(
            _$UpdateCouponDtoTypeEnumEnumMap,
            v,
            unknownValue: UpdateCouponDtoTypeEnum.unknownDefaultOpenApi,
          ),
        ),
        value: $checkedConvert('value', (v) => (v as num?)?.toInt()),
        maxDiscountHalalas: $checkedConvert(
          'maxDiscountHalalas',
          (v) => (v as num?)?.toInt(),
        ),
        minOrderHalalas: $checkedConvert(
          'minOrderHalalas',
          (v) => (v as num?)?.toInt(),
        ),
        vendorIds: $checkedConvert(
          'vendorIds',
          (v) => (v as List<dynamic>?)?.map((e) => e as String).toList(),
        ),
        categoryIds: $checkedConvert(
          'categoryIds',
          (v) => (v as List<dynamic>?)?.map((e) => e as String).toList(),
        ),
        startsAt: $checkedConvert('startsAt', (v) => v as String?),
        endsAt: $checkedConvert('endsAt', (v) => v as String?),
        usageLimit: $checkedConvert('usageLimit', (v) => (v as num?)?.toInt()),
        perUserLimit: $checkedConvert(
          'perUserLimit',
          (v) => (v as num?)?.toInt(),
        ),
        isActive: $checkedConvert('isActive', (v) => v as bool?),
      );
      return val;
    });

Map<String, dynamic> _$UpdateCouponDtoToJson(UpdateCouponDto instance) =>
    <String, dynamic>{
      'code': ?instance.code,
      'type': ?_$UpdateCouponDtoTypeEnumEnumMap[instance.type],
      'value': ?instance.value,
      'maxDiscountHalalas': ?instance.maxDiscountHalalas,
      'minOrderHalalas': ?instance.minOrderHalalas,
      'vendorIds': ?instance.vendorIds,
      'categoryIds': ?instance.categoryIds,
      'startsAt': ?instance.startsAt,
      'endsAt': ?instance.endsAt,
      'usageLimit': ?instance.usageLimit,
      'perUserLimit': ?instance.perUserLimit,
      'isActive': ?instance.isActive,
    };

const _$UpdateCouponDtoTypeEnumEnumMap = {
  UpdateCouponDtoTypeEnum.percent: 'percent',
  UpdateCouponDtoTypeEnum.fixed: 'fixed',
  UpdateCouponDtoTypeEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
