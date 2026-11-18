// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'verify_otp_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VerifyOtpDto _$VerifyOtpDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VerifyOtpDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const ['phone', 'audience', 'code', 'devicePlatform'],
      );
      final val = VerifyOtpDto(
        phone: $checkedConvert('phone', (v) => v as String),
        audience: $checkedConvert(
          'audience',
          (v) => $enumDecode(
            _$VerifyOtpDtoAudienceEnumEnumMap,
            v,
            unknownValue: VerifyOtpDtoAudienceEnum.unknownDefaultOpenApi,
          ),
        ),
        code: $checkedConvert('code', (v) => v as String),
        devicePlatform: $checkedConvert(
          'devicePlatform',
          (v) => $enumDecode(
            _$VerifyOtpDtoDevicePlatformEnumEnumMap,
            v,
            unknownValue: VerifyOtpDtoDevicePlatformEnum.unknownDefaultOpenApi,
          ),
        ),
        deviceName: $checkedConvert('deviceName', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$VerifyOtpDtoToJson(VerifyOtpDto instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'audience': _$VerifyOtpDtoAudienceEnumEnumMap[instance.audience]!,
      'code': instance.code,
      'devicePlatform':
          _$VerifyOtpDtoDevicePlatformEnumEnumMap[instance.devicePlatform]!,
      'deviceName': ?instance.deviceName,
    };

const _$VerifyOtpDtoAudienceEnumEnumMap = {
  VerifyOtpDtoAudienceEnum.customer: 'customer',
  VerifyOtpDtoAudienceEnum.vendor: 'vendor',
  VerifyOtpDtoAudienceEnum.kitchen: 'kitchen',
  VerifyOtpDtoAudienceEnum.admin: 'admin',
  VerifyOtpDtoAudienceEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$VerifyOtpDtoDevicePlatformEnumEnumMap = {
  VerifyOtpDtoDevicePlatformEnum.ios: 'ios',
  VerifyOtpDtoDevicePlatformEnum.android: 'android',
  VerifyOtpDtoDevicePlatformEnum.web: 'web',
  VerifyOtpDtoDevicePlatformEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
