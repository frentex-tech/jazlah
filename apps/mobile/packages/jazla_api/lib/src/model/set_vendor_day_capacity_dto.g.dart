// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_vendor_day_capacity_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetVendorDayCapacityDto _$SetVendorDayCapacityDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetVendorDayCapacityDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['ordersLimit', 'carcassesLimit']);
  final val = SetVendorDayCapacityDto(
    ordersLimit: $checkedConvert('ordersLimit', (v) => (v as num?)?.toInt()),
    carcassesLimit: $checkedConvert(
      'carcassesLimit',
      (v) => (v as num?)?.toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$SetVendorDayCapacityDtoToJson(
  SetVendorDayCapacityDto instance,
) => <String, dynamic>{
  'ordersLimit': instance.ordersLimit,
  'carcassesLimit': instance.carcassesLimit,
};
