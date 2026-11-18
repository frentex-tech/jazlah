// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_admin_upload_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestAdminUploadDto _$RequestAdminUploadDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('RequestAdminUploadDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['contentType', 'purpose']);
  final val = RequestAdminUploadDto(
    contentType: $checkedConvert('contentType', (v) => v as String),
    fileName: $checkedConvert('fileName', (v) => v as String?),
    purpose: $checkedConvert(
      'purpose',
      (v) => $enumDecode(
        _$RequestAdminUploadDtoPurposeEnumEnumMap,
        v,
        unknownValue: RequestAdminUploadDtoPurposeEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$RequestAdminUploadDtoToJson(
  RequestAdminUploadDto instance,
) => <String, dynamic>{
  'contentType': instance.contentType,
  'fileName': ?instance.fileName,
  'purpose': _$RequestAdminUploadDtoPurposeEnumEnumMap[instance.purpose]!,
};

const _$RequestAdminUploadDtoPurposeEnumEnumMap = {
  RequestAdminUploadDtoPurposeEnum.vendorPeriodLogo: 'vendor.logo',
  RequestAdminUploadDtoPurposeEnum.vendorPeriodCover: 'vendor.cover',
  RequestAdminUploadDtoPurposeEnum.catalogPeriodProductImage:
      'catalog.product-image',
  RequestAdminUploadDtoPurposeEnum.catalogPeriodCategoryImage:
      'catalog.category-image',
  RequestAdminUploadDtoPurposeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
