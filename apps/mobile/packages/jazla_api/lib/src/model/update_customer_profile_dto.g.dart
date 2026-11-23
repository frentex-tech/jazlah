// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_customer_profile_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCustomerProfileDto _$UpdateCustomerProfileDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateCustomerProfileDto', json, ($checkedConvert) {
  final val = UpdateCustomerProfileDto(
    fullName: $checkedConvert('fullName', (v) => v as String?),
    email: $checkedConvert('email', (v) => v as String?),
    preferredLanguage: $checkedConvert(
      'preferredLanguage',
      (v) => $enumDecodeNullable(
        _$UpdateCustomerProfileDtoPreferredLanguageEnumEnumMap,
        v,
        unknownValue:
            UpdateCustomerProfileDtoPreferredLanguageEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$UpdateCustomerProfileDtoToJson(
  UpdateCustomerProfileDto instance,
) => <String, dynamic>{
  'fullName': ?instance.fullName,
  'email': ?instance.email,
  'preferredLanguage':
      ?_$UpdateCustomerProfileDtoPreferredLanguageEnumEnumMap[instance
          .preferredLanguage],
};

const _$UpdateCustomerProfileDtoPreferredLanguageEnumEnumMap = {
  UpdateCustomerProfileDtoPreferredLanguageEnum.ar: 'ar',
  UpdateCustomerProfileDtoPreferredLanguageEnum.en: 'en',
  UpdateCustomerProfileDtoPreferredLanguageEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
