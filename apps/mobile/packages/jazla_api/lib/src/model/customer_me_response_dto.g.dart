// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_me_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerMeResponseDto _$CustomerMeResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CustomerMeResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'userId',
      'phone',
      'audience',
      'organisationId',
      'sessionId',
      'fullName',
      'email',
      'preferredLanguage',
      'profileComplete',
      'marketingConsent',
    ],
  );
  final val = CustomerMeResponseDto(
    userId: $checkedConvert('userId', (v) => v as String),
    phone: $checkedConvert('phone', (v) => v as String),
    audience: $checkedConvert(
      'audience',
      (v) => $enumDecode(
        _$CustomerMeResponseDtoAudienceEnumEnumMap,
        v,
        unknownValue: CustomerMeResponseDtoAudienceEnum.unknownDefaultOpenApi,
      ),
    ),
    organisationId: $checkedConvert('organisationId', (v) => v as String?),
    sessionId: $checkedConvert('sessionId', (v) => v as String),
    fullName: $checkedConvert('fullName', (v) => v as String?),
    email: $checkedConvert('email', (v) => v as String?),
    preferredLanguage: $checkedConvert(
      'preferredLanguage',
      (v) => $enumDecode(
        _$CustomerMeResponseDtoPreferredLanguageEnumEnumMap,
        v,
        unknownValue:
            CustomerMeResponseDtoPreferredLanguageEnum.unknownDefaultOpenApi,
      ),
    ),
    profileComplete: $checkedConvert('profileComplete', (v) => v as bool),
    marketingConsent: $checkedConvert(
      'marketingConsent',
      (v) => MarketingConsentResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$CustomerMeResponseDtoToJson(
  CustomerMeResponseDto instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'phone': instance.phone,
  'audience': _$CustomerMeResponseDtoAudienceEnumEnumMap[instance.audience]!,
  'organisationId': instance.organisationId,
  'sessionId': instance.sessionId,
  'fullName': instance.fullName,
  'email': instance.email,
  'preferredLanguage':
      _$CustomerMeResponseDtoPreferredLanguageEnumEnumMap[instance
          .preferredLanguage]!,
  'profileComplete': instance.profileComplete,
  'marketingConsent': instance.marketingConsent.toJson(),
};

const _$CustomerMeResponseDtoAudienceEnumEnumMap = {
  CustomerMeResponseDtoAudienceEnum.customer: 'customer',
  CustomerMeResponseDtoAudienceEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$CustomerMeResponseDtoPreferredLanguageEnumEnumMap = {
  CustomerMeResponseDtoPreferredLanguageEnum.ar: 'ar',
  CustomerMeResponseDtoPreferredLanguageEnum.en: 'en',
  CustomerMeResponseDtoPreferredLanguageEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
