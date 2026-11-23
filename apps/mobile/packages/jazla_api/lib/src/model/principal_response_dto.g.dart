// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'principal_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PrincipalResponseDto _$PrincipalResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PrincipalResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'userId',
      'phone',
      'audience',
      'organisationId',
      'sessionId',
    ],
  );
  final val = PrincipalResponseDto(
    userId: $checkedConvert('userId', (v) => v as String),
    phone: $checkedConvert('phone', (v) => v as String),
    audience: $checkedConvert(
      'audience',
      (v) => $enumDecode(
        _$PrincipalResponseDtoAudienceEnumEnumMap,
        v,
        unknownValue: PrincipalResponseDtoAudienceEnum.unknownDefaultOpenApi,
      ),
    ),
    organisationId: $checkedConvert('organisationId', (v) => v as String?),
    sessionId: $checkedConvert('sessionId', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$PrincipalResponseDtoToJson(
  PrincipalResponseDto instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'phone': instance.phone,
  'audience': _$PrincipalResponseDtoAudienceEnumEnumMap[instance.audience]!,
  'organisationId': instance.organisationId,
  'sessionId': instance.sessionId,
};

const _$PrincipalResponseDtoAudienceEnumEnumMap = {
  PrincipalResponseDtoAudienceEnum.customer: 'customer',
  PrincipalResponseDtoAudienceEnum.vendor: 'vendor',
  PrincipalResponseDtoAudienceEnum.kitchen: 'kitchen',
  PrincipalResponseDtoAudienceEnum.admin: 'admin',
  PrincipalResponseDtoAudienceEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
