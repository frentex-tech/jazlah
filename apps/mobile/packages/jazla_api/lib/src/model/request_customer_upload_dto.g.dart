// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_customer_upload_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestCustomerUploadDto _$RequestCustomerUploadDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('RequestCustomerUploadDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['contentType', 'purpose']);
  final val = RequestCustomerUploadDto(
    contentType: $checkedConvert('contentType', (v) => v as String),
    fileName: $checkedConvert('fileName', (v) => v as String?),
    purpose: $checkedConvert(
      'purpose',
      (v) => $enumDecode(
        _$RequestCustomerUploadDtoPurposeEnumEnumMap,
        v,
        unknownValue: RequestCustomerUploadDtoPurposeEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$RequestCustomerUploadDtoToJson(
  RequestCustomerUploadDto instance,
) => <String, dynamic>{
  'contentType': instance.contentType,
  'fileName': ?instance.fileName,
  'purpose': _$RequestCustomerUploadDtoPurposeEnumEnumMap[instance.purpose]!,
};

const _$RequestCustomerUploadDtoPurposeEnumEnumMap = {
  RequestCustomerUploadDtoPurposeEnum.vendorPeriodDocument: 'vendor.document',
  RequestCustomerUploadDtoPurposeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
