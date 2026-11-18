// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_vendor_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicVendorResponseDto _$PublicVendorResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicVendorResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'name',
      'description',
      'logoUrl',
      'coverUrl',
      'city',
    ],
  );
  final val = PublicVendorResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) =>
          OptionalLocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    logoUrl: $checkedConvert('logoUrl', (v) => v as String?),
    coverUrl: $checkedConvert('coverUrl', (v) => v as String?),
    city: $checkedConvert('city', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$PublicVendorResponseDtoToJson(
  PublicVendorResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'logoUrl': instance.logoUrl,
  'coverUrl': instance.coverUrl,
  'city': instance.city,
};
