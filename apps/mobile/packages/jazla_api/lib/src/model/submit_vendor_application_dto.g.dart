// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submit_vendor_application_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SubmitVendorApplicationDto _$SubmitVendorApplicationDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SubmitVendorApplicationDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'name',
      'commercialRegistrationNumber',
      'city',
      'iban',
      'accountHolderName',
      'location',
      'documents',
    ],
  );
  final val = SubmitVendorApplicationDto(
    name: $checkedConvert(
      'name',
      (v) => LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) => v == null
          ? null
          : LocalizedDescriptionDto.fromJson(v as Map<String, dynamic>),
    ),
    commercialRegistrationNumber: $checkedConvert(
      'commercialRegistrationNumber',
      (v) => v as String,
    ),
    vatNumber: $checkedConvert('vatNumber', (v) => v as String?),
    city: $checkedConvert('city', (v) => v as String),
    iban: $checkedConvert('iban', (v) => v as String),
    accountHolderName: $checkedConvert('accountHolderName', (v) => v as String),
    location: $checkedConvert(
      'location',
      (v) => GeoPointDto.fromJson(v as Map<String, dynamic>),
    ),
    documents: $checkedConvert(
      'documents',
      (v) => (v as List<dynamic>)
          .map(
            (e) => VendorApplicationDocumentDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$SubmitVendorApplicationDtoToJson(
  SubmitVendorApplicationDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'description': ?instance.description?.toJson(),
  'commercialRegistrationNumber': instance.commercialRegistrationNumber,
  'vatNumber': ?instance.vatNumber,
  'city': instance.city,
  'iban': instance.iban,
  'accountHolderName': instance.accountHolderName,
  'location': instance.location.toJson(),
  'documents': instance.documents.map((e) => e.toJson()).toList(),
};
