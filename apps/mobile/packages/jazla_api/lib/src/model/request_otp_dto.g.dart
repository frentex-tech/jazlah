// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'request_otp_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RequestOtpDto _$RequestOtpDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('RequestOtpDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['phone', 'audience']);
      final val = RequestOtpDto(
        phone: $checkedConvert('phone', (v) => v as String),
        audience: $checkedConvert(
          'audience',
          (v) => $enumDecode(
            _$RequestOtpDtoAudienceEnumEnumMap,
            v,
            unknownValue: RequestOtpDtoAudienceEnum.unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$RequestOtpDtoToJson(RequestOtpDto instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'audience': _$RequestOtpDtoAudienceEnumEnumMap[instance.audience]!,
    };

const _$RequestOtpDtoAudienceEnumEnumMap = {
  RequestOtpDtoAudienceEnum.customer: 'customer',
  RequestOtpDtoAudienceEnum.vendor: 'vendor',
  RequestOtpDtoAudienceEnum.kitchen: 'kitchen',
  RequestOtpDtoAudienceEnum.admin: 'admin',
  RequestOtpDtoAudienceEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
