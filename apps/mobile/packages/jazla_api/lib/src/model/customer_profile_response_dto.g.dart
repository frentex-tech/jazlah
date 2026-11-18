// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_profile_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerProfileResponseDto _$CustomerProfileResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CustomerProfileResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'fullName',
      'email',
      'preferredLanguage',
      'isComplete',
    ],
  );
  final val = CustomerProfileResponseDto(
    fullName: $checkedConvert('fullName', (v) => v as String?),
    email: $checkedConvert('email', (v) => v as String?),
    preferredLanguage: $checkedConvert(
      'preferredLanguage',
      (v) => $enumDecode(
        _$CustomerProfileResponseDtoPreferredLanguageEnumEnumMap,
        v,
        unknownValue: CustomerProfileResponseDtoPreferredLanguageEnum
            .unknownDefaultOpenApi,
      ),
    ),
    isComplete: $checkedConvert('isComplete', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$CustomerProfileResponseDtoToJson(
  CustomerProfileResponseDto instance,
) => <String, dynamic>{
  'fullName': instance.fullName,
  'email': instance.email,
  'preferredLanguage':
      _$CustomerProfileResponseDtoPreferredLanguageEnumEnumMap[instance
          .preferredLanguage]!,
  'isComplete': instance.isComplete,
};

const _$CustomerProfileResponseDtoPreferredLanguageEnumEnumMap = {
  CustomerProfileResponseDtoPreferredLanguageEnum.ar: 'ar',
  CustomerProfileResponseDtoPreferredLanguageEnum.en: 'en',
  CustomerProfileResponseDtoPreferredLanguageEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
