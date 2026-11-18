// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_document_link_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationDocumentLinkResponseDto
_$VendorApplicationDocumentLinkResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VendorApplicationDocumentLinkResponseDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(
        json,
        requiredKeys: const ['kind', 'mediaId', 'url', 'expiresAt'],
      );
      final val = VendorApplicationDocumentLinkResponseDto(
        kind: $checkedConvert(
          'kind',
          (v) => $enumDecode(
            _$VendorApplicationDocumentLinkResponseDtoKindEnumEnumMap,
            v,
            unknownValue: VendorApplicationDocumentLinkResponseDtoKindEnum
                .unknownDefaultOpenApi,
          ),
        ),
        mediaId: $checkedConvert('mediaId', (v) => v as String),
        url: $checkedConvert('url', (v) => v as String),
        expiresAt: $checkedConvert(
          'expiresAt',
          (v) => v == null ? null : DateTime.parse(v as String),
        ),
      );
      return val;
    });

Map<String, dynamic> _$VendorApplicationDocumentLinkResponseDtoToJson(
  VendorApplicationDocumentLinkResponseDto instance,
) => <String, dynamic>{
  'kind':
      _$VendorApplicationDocumentLinkResponseDtoKindEnumEnumMap[instance.kind]!,
  'mediaId': instance.mediaId,
  'url': instance.url,
  'expiresAt': instance.expiresAt?.toIso8601String(),
};

const _$VendorApplicationDocumentLinkResponseDtoKindEnumEnumMap = {
  VendorApplicationDocumentLinkResponseDtoKindEnum.commercialRegistration:
      'commercial_registration',
  VendorApplicationDocumentLinkResponseDtoKindEnum.healthCertificate:
      'health_certificate',
  VendorApplicationDocumentLinkResponseDtoKindEnum.facilityPhoto:
      'facility_photo',
  VendorApplicationDocumentLinkResponseDtoKindEnum.municipalityLicence:
      'municipality_licence',
  VendorApplicationDocumentLinkResponseDtoKindEnum.nationalId: 'national_id',
  VendorApplicationDocumentLinkResponseDtoKindEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
