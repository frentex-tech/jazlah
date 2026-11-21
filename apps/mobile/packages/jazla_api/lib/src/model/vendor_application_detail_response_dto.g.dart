// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_detail_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationDetailResponseDto _$VendorApplicationDetailResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorApplicationDetailResponseDto', json, (
  $checkedConvert,
) {
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
      'rejectionReason',
      'reviewedAt',
      'createdAt',
      'documents',
      'reviewedById',
    ],
  );
  final val = VendorApplicationDetailResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    applicantId: $checkedConvert('applicantId', (v) => v as String),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$VendorApplicationDetailResponseDtoStatusEnumEnumMap,
        v,
        unknownValue:
            VendorApplicationDetailResponseDtoStatusEnum.unknownDefaultOpenApi,
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
    rejectionReason: $checkedConvert('rejectionReason', (v) => v as String?),
    reviewedAt: $checkedConvert(
      'reviewedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    documents: $checkedConvert(
      'documents',
      (v) => (v as List<dynamic>)
          .map(
            (e) => VendorApplicationDocumentLinkResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    reviewedById: $checkedConvert('reviewedById', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$VendorApplicationDetailResponseDtoToJson(
  VendorApplicationDetailResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'applicantId': instance.applicantId,
  'status':
      _$VendorApplicationDetailResponseDtoStatusEnumEnumMap[instance.status]!,
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'commercialRegistrationNumber': instance.commercialRegistrationNumber,
  'vatNumber': instance.vatNumber,
  'city': instance.city,
  'ibanMasked': instance.ibanMasked,
  'accountHolderName': instance.accountHolderName,
  'location': instance.location.toJson(),
  'rejectionReason': instance.rejectionReason,
  'reviewedAt': instance.reviewedAt?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
  'documents': instance.documents.map((e) => e.toJson()).toList(),
  'reviewedById': instance.reviewedById,
};

const _$VendorApplicationDetailResponseDtoStatusEnumEnumMap = {
  VendorApplicationDetailResponseDtoStatusEnum.pending: 'pending',
  VendorApplicationDetailResponseDtoStatusEnum.approved: 'approved',
  VendorApplicationDetailResponseDtoStatusEnum.rejected: 'rejected',
  VendorApplicationDetailResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
