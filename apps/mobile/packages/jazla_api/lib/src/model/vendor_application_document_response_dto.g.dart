// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_document_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationDocumentResponseDto
_$VendorApplicationDocumentResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VendorApplicationDocumentResponseDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(json, requiredKeys: const ['kind', 'mediaId']);
      final val = VendorApplicationDocumentResponseDto(
        kind: $checkedConvert(
          'kind',
          (v) => $enumDecode(
            _$VendorApplicationDocumentResponseDtoKindEnumEnumMap,
            v,
            unknownValue: VendorApplicationDocumentResponseDtoKindEnum
                .unknownDefaultOpenApi,
          ),
        ),
        mediaId: $checkedConvert('mediaId', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$VendorApplicationDocumentResponseDtoToJson(
  VendorApplicationDocumentResponseDto instance,
) => <String, dynamic>{
  'kind': _$VendorApplicationDocumentResponseDtoKindEnumEnumMap[instance.kind]!,
  'mediaId': instance.mediaId,
};

const _$VendorApplicationDocumentResponseDtoKindEnumEnumMap = {
  VendorApplicationDocumentResponseDtoKindEnum.commercialRegistration:
      'commercial_registration',
  VendorApplicationDocumentResponseDtoKindEnum.healthCertificate:
      'health_certificate',
  VendorApplicationDocumentResponseDtoKindEnum.facilityPhoto: 'facility_photo',
  VendorApplicationDocumentResponseDtoKindEnum.municipalityLicence:
      'municipality_licence',
  VendorApplicationDocumentResponseDtoKindEnum.nationalId: 'national_id',
  VendorApplicationDocumentResponseDtoKindEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
