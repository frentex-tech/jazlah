// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_vendor_upload_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestVendorUploadDto _$RequestVendorUploadDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('RequestVendorUploadDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['contentType', 'purpose']);
  final val = RequestVendorUploadDto(
    contentType: $checkedConvert('contentType', (v) => v as String),
    fileName: $checkedConvert('fileName', (v) => v as String?),
    purpose: $checkedConvert(
      'purpose',
      (v) => $enumDecode(
        _$RequestVendorUploadDtoPurposeEnumEnumMap,
        v,
        unknownValue: RequestVendorUploadDtoPurposeEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$RequestVendorUploadDtoToJson(
  RequestVendorUploadDto instance,
) => <String, dynamic>{
  'contentType': instance.contentType,
  'fileName': ?instance.fileName,
  'purpose': _$RequestVendorUploadDtoPurposeEnumEnumMap[instance.purpose]!,
};

const _$RequestVendorUploadDtoPurposeEnumEnumMap = {
  RequestVendorUploadDtoPurposeEnum.vendorPeriodLogo: 'vendor.logo',
  RequestVendorUploadDtoPurposeEnum.vendorPeriodCover: 'vendor.cover',
  RequestVendorUploadDtoPurposeEnum.catalogPeriodProductImage:
      'catalog.product-image',
  RequestVendorUploadDtoPurposeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
