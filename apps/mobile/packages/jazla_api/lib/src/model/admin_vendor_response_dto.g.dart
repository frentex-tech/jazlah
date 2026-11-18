// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_vendor_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminVendorResponseDto _$AdminVendorResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('AdminVendorResponseDto', json, ($checkedConvert) {
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
      'isPlatform',
      'status',
      'suspendedAt',
      'suspensionReason',
      'applicationId',
    ],
  );
  final val = AdminVendorResponseDto(
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
    isPlatform: $checkedConvert('isPlatform', (v) => v as bool),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$AdminVendorResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: AdminVendorResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    suspendedAt: $checkedConvert(
      'suspendedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    suspensionReason: $checkedConvert('suspensionReason', (v) => v as String?),
    applicationId: $checkedConvert('applicationId', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$AdminVendorResponseDtoToJson(
  AdminVendorResponseDto instance,
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
  'isPlatform': instance.isPlatform,
  'status': _$AdminVendorResponseDtoStatusEnumEnumMap[instance.status]!,
  'suspendedAt': instance.suspendedAt?.toIso8601String(),
  'suspensionReason': instance.suspensionReason,
  'applicationId': instance.applicationId,
};

const _$AdminVendorResponseDtoStatusEnumEnumMap = {
  AdminVendorResponseDtoStatusEnum.active: 'active',
  AdminVendorResponseDtoStatusEnum.suspended: 'suspended',
  AdminVendorResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
