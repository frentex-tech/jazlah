// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_next_action_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentNextActionResponseDto _$PaymentNextActionResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentNextActionResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['type', 'redirectUrl', 'returnUrl']);
  final val = PaymentNextActionResponseDto(
    type: $checkedConvert(
      'type',
      (v) => $enumDecode(
        _$PaymentNextActionResponseDtoTypeEnumEnumMap,
        v,
        unknownValue:
            PaymentNextActionResponseDtoTypeEnum.unknownDefaultOpenApi,
      ),
    ),
    redirectUrl: $checkedConvert('redirectUrl', (v) => v as String),
    returnUrl: $checkedConvert('returnUrl', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$PaymentNextActionResponseDtoToJson(
  PaymentNextActionResponseDto instance,
) => <String, dynamic>{
  'type': _$PaymentNextActionResponseDtoTypeEnumEnumMap[instance.type]!,
  'redirectUrl': instance.redirectUrl,
  'returnUrl': instance.returnUrl,
};

const _$PaymentNextActionResponseDtoTypeEnumEnumMap = {
  PaymentNextActionResponseDtoTypeEnum.redirect: 'redirect',
  PaymentNextActionResponseDtoTypeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
