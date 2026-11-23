// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_vendor_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderVendorResponseDto _$OrderVendorResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderVendorResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['id', 'name', 'phone', 'location', 'city'],
  );
  final val = OrderVendorResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    phone: $checkedConvert('phone', (v) => v as String?),
    location: $checkedConvert(
      'location',
      (v) => v == null ? null : GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    city: $checkedConvert('city', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$OrderVendorResponseDtoToJson(
  OrderVendorResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'phone': instance.phone,
  'location': instance.location?.toJson(),
  'city': instance.city,
};
