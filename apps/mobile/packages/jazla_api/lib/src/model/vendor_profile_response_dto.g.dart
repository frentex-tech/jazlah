// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_profile_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorProfileResponseDto _$VendorProfileResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorProfileResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'name',
      'description',
      'logoUrl',
      'coverUrl',
      'city',
      'commissionBasisPoints',
      'commercialRegistrationNumber',
      'vatNumber',
      'contactPhone',
      'contactEmail',
      'ibanMasked',
      'accountHolderName',
      'location',
      'createdAt',
    ],
  );
  final val = VendorProfileResponseDto(
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
    commissionBasisPoints: $checkedConvert(
      'commissionBasisPoints',
      (v) => v as num,
    ),
    commercialRegistrationNumber: $checkedConvert(
      'commercialRegistrationNumber',
      (v) => v as String?,
    ),
    vatNumber: $checkedConvert('vatNumber', (v) => v as String?),
    contactPhone: $checkedConvert('contactPhone', (v) => v as String?),
    contactEmail: $checkedConvert('contactEmail', (v) => v as String?),
    ibanMasked: $checkedConvert('ibanMasked', (v) => v as String?),
    accountHolderName: $checkedConvert(
      'accountHolderName',
      (v) => v as String?,
    ),
    location: $checkedConvert(
      'location',
      (v) => v == null ? null : GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$VendorProfileResponseDtoToJson(
  VendorProfileResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'logoUrl': instance.logoUrl,
  'coverUrl': instance.coverUrl,
  'city': instance.city,
  'commissionBasisPoints': instance.commissionBasisPoints,
  'commercialRegistrationNumber': instance.commercialRegistrationNumber,
  'vatNumber': instance.vatNumber,
  'contactPhone': instance.contactPhone,
  'contactEmail': instance.contactEmail,
  'ibanMasked': instance.ibanMasked,
  'accountHolderName': instance.accountHolderName,
  'location': instance.location?.toJson(),
  'createdAt': instance.createdAt.toIso8601String(),
};
