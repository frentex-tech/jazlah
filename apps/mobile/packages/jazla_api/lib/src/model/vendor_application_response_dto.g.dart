// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationResponseDto _$VendorApplicationResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorApplicationResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'applicantId',
      'status',
      'name',
      'description',
      'commercialRegistrationNumber',
      'vatNumber',
      'city',
      'ibanMasked',
      'accountHolderName',
      'location',
      'documents',
      'rejectionReason',
      'reviewedAt',
      'createdAt',
    ],
  );
  final val = VendorApplicationResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    applicantId: $checkedConvert('applicantId', (v) => v as String),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$VendorApplicationResponseDtoStatusEnumEnumMap,
        v,
        unknownValue:
            VendorApplicationResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) =>
          OptionalLocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    commercialRegistrationNumber: $checkedConvert(
      'commercialRegistrationNumber',
      (v) => v as String,
    ),
    vatNumber: $checkedConvert('vatNumber', (v) => v as String?),
    city: $checkedConvert('city', (v) => v as String?),
    ibanMasked: $checkedConvert('ibanMasked', (v) => v as String),
    accountHolderName: $checkedConvert('accountHolderName', (v) => v as String),
    location: $checkedConvert(
      'location',
      (v) => GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    documents: $checkedConvert(
      'documents',
      (v) => (v as List<dynamic>)
          .map(
            (e) => VendorApplicationDocumentResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    rejectionReason: $checkedConvert('rejectionReason', (v) => v as String?),
    reviewedAt: $checkedConvert(
      'reviewedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$VendorApplicationResponseDtoToJson(
  VendorApplicationResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'applicantId': instance.applicantId,
  'status': _$VendorApplicationResponseDtoStatusEnumEnumMap[instance.status]!,
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'commercialRegistrationNumber': instance.commercialRegistrationNumber,
  'vatNumber': instance.vatNumber,
  'city': instance.city,
  'ibanMasked': instance.ibanMasked,
  'accountHolderName': instance.accountHolderName,
  'location': instance.location.toJson(),
  'documents': instance.documents.map((e) => e.toJson()).toList(),
  'rejectionReason': instance.rejectionReason,
  'reviewedAt': instance.reviewedAt?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$VendorApplicationResponseDtoStatusEnumEnumMap = {
  VendorApplicationResponseDtoStatusEnum.pending: 'pending',
  VendorApplicationResponseDtoStatusEnum.approved: 'approved',
  VendorApplicationResponseDtoStatusEnum.rejected: 'rejected',
  VendorApplicationResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
