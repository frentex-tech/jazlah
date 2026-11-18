// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_vendor_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductVendorResponseDto _$ProductVendorResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductVendorResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name']);
  final val = ProductVendorResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductVendorResponseDtoToJson(
  ProductVendorResponseDto instance,
) => <String, dynamic>{'id': instance.id, 'name': instance.name?.toJson()};
