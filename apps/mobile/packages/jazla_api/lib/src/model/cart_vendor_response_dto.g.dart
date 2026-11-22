// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_vendor_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartVendorResponseDto _$CartVendorResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartVendorResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name']);
  final val = CartVendorResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$CartVendorResponseDtoToJson(
  CartVendorResponseDto instance,
) => <String, dynamic>{'id': instance.id, 'name': instance.name.toJson()};
