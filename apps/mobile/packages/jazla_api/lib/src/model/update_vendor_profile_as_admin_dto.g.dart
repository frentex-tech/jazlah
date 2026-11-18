// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_vendor_profile_as_admin_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateVendorProfileAsAdminDto _$UpdateVendorProfileAsAdminDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateVendorProfileAsAdminDto', json, ($checkedConvert) {
  final val = UpdateVendorProfileAsAdminDto(
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
    city: $checkedConvert('city', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$UpdateVendorProfileAsAdminDtoToJson(
  UpdateVendorProfileAsAdminDto instance,
) => <String, dynamic>{
  'logoMediaId': ?instance.logoMediaId,
  'coverMediaId': ?instance.coverMediaId,
  'contactPhone': ?instance.contactPhone,
  'contactEmail': ?instance.contactEmail,
  'vatNumber': ?instance.vatNumber,
  'description': ?instance.description?.toJson(),
  'city': ?instance.city,
};
