// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_capacity_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorCapacityResponseDto _$VendorCapacityResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorCapacityResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['vendorId', 'ordersPerDay', 'carcassesPerDay', 'days'],
  );
  final val = VendorCapacityResponseDto(
    vendorId: $checkedConvert('vendorId', (v) => v as String),
    ordersPerDay: $checkedConvert('ordersPerDay', (v) => (v as num?)?.toInt()),
    carcassesPerDay: $checkedConvert(
      'carcassesPerDay',
      (v) => (v as num?)?.toInt(),
    ),
    days: $checkedConvert(
      'days',
      (v) => (v as List<dynamic>)
          .map(
            (e) => VendorCapacityDayResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$VendorCapacityResponseDtoToJson(
  VendorCapacityResponseDto instance,
) => <String, dynamic>{
  'vendorId': instance.vendorId,
  'ordersPerDay': instance.ordersPerDay,
  'carcassesPerDay': instance.carcassesPerDay,
  'days': instance.days.map((e) => e.toJson()).toList(),
};
