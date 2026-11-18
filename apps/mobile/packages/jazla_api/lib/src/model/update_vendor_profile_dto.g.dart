// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_vendor_profile_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateVendorProfileDto _$UpdateVendorProfileDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateVendorProfileDto', json, ($checkedConvert) {
  final val = UpdateVendorProfileDto(
    logoMediaId: $checkedConvert('logoMediaId', (v) => v as String?),
    coverMediaId: $checkedConvert('coverMediaId', (v) => v as String?),
    contactPhone: $checkedConvert('contactPhone', (v) => v as String?),
    contactEmail: $checkedConvert('contactEmail', (v) => v as String?),
    vatNumber: $checkedConvert('vatNumber', (v) => v as String?),
    description: $checkedConvert(
      'description',
      (v) => v == null
          ? null
          : LocalizedDescriptionDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$UpdateVendorProfileDtoToJson(
  UpdateVendorProfileDto instance,
) => <String, dynamic>{
  'logoMediaId': ?instance.logoMediaId,
  'coverMediaId': ?instance.coverMediaId,
  'contactPhone': ?instance.contactPhone,
  'contactEmail': ?instance.contactEmail,
  'vatNumber': ?instance.vatNumber,
  'description': ?instance.description?.toJson(),
};
