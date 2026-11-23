// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_document_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationDocumentDto _$VendorApplicationDocumentDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorApplicationDocumentDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['kind', 'mediaId']);
  final val = VendorApplicationDocumentDto(
    kind: $checkedConvert(
      'kind',
      (v) => $enumDecode(
        _$VendorApplicationDocumentDtoKindEnumEnumMap,
        v,
        unknownValue:
            VendorApplicationDocumentDtoKindEnum.unknownDefaultOpenApi,
      ),
    ),
    mediaId: $checkedConvert('mediaId', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$VendorApplicationDocumentDtoToJson(
  VendorApplicationDocumentDto instance,
) => <String, dynamic>{
  'kind': _$VendorApplicationDocumentDtoKindEnumEnumMap[instance.kind]!,
  'mediaId': instance.mediaId,
};

const _$VendorApplicationDocumentDtoKindEnumEnumMap = {
  VendorApplicationDocumentDtoKindEnum.commercialRegistration:
      'commercial_registration',
  VendorApplicationDocumentDtoKindEnum.healthCertificate: 'health_certificate',
  VendorApplicationDocumentDtoKindEnum.facilityPhoto: 'facility_photo',
  VendorApplicationDocumentDtoKindEnum.municipalityLicence:
      'municipality_licence',
  VendorApplicationDocumentDtoKindEnum.nationalId: 'national_id',
  VendorApplicationDocumentDtoKindEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
