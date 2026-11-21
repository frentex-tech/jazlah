// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_incompatibility_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorIncompatibilityResponseDto _$VendorIncompatibilityResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorIncompatibilityResponseDto', json, (
  $checkedConvert,
) {
  $checkKeys(json, requiredKeys: const ['cuttingStyle', 'packaging']);
  final val = VendorIncompatibilityResponseDto(
    cuttingStyle: $checkedConvert(
      'cuttingStyle',
      (v) => NamedReferenceResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecode(
        _$VendorIncompatibilityResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue:
            VendorIncompatibilityResponseDtoPackagingEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$VendorIncompatibilityResponseDtoToJson(
  VendorIncompatibilityResponseDto instance,
) => <String, dynamic>{
  'cuttingStyle': instance.cuttingStyle.toJson(),
  'packaging':
      _$VendorIncompatibilityResponseDtoPackagingEnumEnumMap[instance
          .packaging]!,
};

const _$VendorIncompatibilityResponseDtoPackagingEnumEnumMap = {
  VendorIncompatibilityResponseDtoPackagingEnum.trays: 'trays',
  VendorIncompatibilityResponseDtoPackagingEnum.bags: 'bags',
  VendorIncompatibilityResponseDtoPackagingEnum.vacuum: 'vacuum',
  VendorIncompatibilityResponseDtoPackagingEnum.none: 'none',
  VendorIncompatibilityResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
