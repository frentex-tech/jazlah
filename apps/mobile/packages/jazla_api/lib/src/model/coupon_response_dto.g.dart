// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coupon_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CouponResponseDto _$CouponResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CouponResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'code',
      'type',
      'value',
      'maxDiscountHalalas',
      'minOrderHalalas',
      'vendorIds',
      'categoryIds',
      'startsAt',
      'endsAt',
      'usageLimit',
      'perUserLimit',
      'isActive',
      'status',
      'usageCount',
      'createdAt',
      'updatedAt',
    ],
  );
  final val = CouponResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    code: $checkedConvert('code', (v) => v as String),
    type: $checkedConvert(
      'type',
      (v) => $enumDecode(
        _$CouponResponseDtoTypeEnumEnumMap,
        v,
        unknownValue: CouponResponseDtoTypeEnum.unknownDefaultOpenApi,
      ),
    ),
    value: $checkedConvert('value', (v) => (v as num).toInt()),
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
      (v) => (v as List<dynamic>).map((e) => e as String).toList(),
    ),
    categoryIds: $checkedConvert(
      'categoryIds',
      (v) => (v as List<dynamic>).map((e) => e as String).toList(),
    ),
    startsAt: $checkedConvert('startsAt', (v) => DateTime.parse(v as String)),
    endsAt: $checkedConvert('endsAt', (v) => DateTime.parse(v as String)),
    usageLimit: $checkedConvert('usageLimit', (v) => (v as num?)?.toInt()),
    perUserLimit: $checkedConvert('perUserLimit', (v) => (v as num?)?.toInt()),
    isActive: $checkedConvert('isActive', (v) => v as bool),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$CouponResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: CouponResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    usageCount: $checkedConvert('usageCount', (v) => (v as num).toInt()),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$CouponResponseDtoToJson(CouponResponseDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'type': _$CouponResponseDtoTypeEnumEnumMap[instance.type]!,
      'value': instance.value,
      'maxDiscountHalalas': instance.maxDiscountHalalas,
      'minOrderHalalas': instance.minOrderHalalas,
      'vendorIds': instance.vendorIds,
      'categoryIds': instance.categoryIds,
      'startsAt': instance.startsAt.toIso8601String(),
      'endsAt': instance.endsAt.toIso8601String(),
      'usageLimit': instance.usageLimit,
      'perUserLimit': instance.perUserLimit,
      'isActive': instance.isActive,
      'status': _$CouponResponseDtoStatusEnumEnumMap[instance.status]!,
      'usageCount': instance.usageCount,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$CouponResponseDtoTypeEnumEnumMap = {
  CouponResponseDtoTypeEnum.percent: 'percent',
  CouponResponseDtoTypeEnum.fixed: 'fixed',
  CouponResponseDtoTypeEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$CouponResponseDtoStatusEnumEnumMap = {
  CouponResponseDtoStatusEnum.active: 'active',
  CouponResponseDtoStatusEnum.scheduled: 'scheduled',
  CouponResponseDtoStatusEnum.expired: 'expired',
  CouponResponseDtoStatusEnum.inactive: 'inactive',
  CouponResponseDtoStatusEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
