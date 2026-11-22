// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_method_option_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentMethodOptionResponseDto _$PaymentMethodOptionResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentMethodOptionResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['method', 'isAvailable', 'reason']);
  final val = PaymentMethodOptionResponseDto(
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(
        _$PaymentMethodOptionResponseDtoMethodEnumEnumMap,
        v,
        unknownValue:
            PaymentMethodOptionResponseDtoMethodEnum.unknownDefaultOpenApi,
      ),
    ),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    reason: $checkedConvert(
      'reason',
      (v) => $enumDecodeNullable(
        _$PaymentMethodOptionResponseDtoReasonEnumEnumMap,
        v,
        unknownValue:
            PaymentMethodOptionResponseDtoReasonEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$PaymentMethodOptionResponseDtoToJson(
  PaymentMethodOptionResponseDto instance,
) => <String, dynamic>{
  'method': _$PaymentMethodOptionResponseDtoMethodEnumEnumMap[instance.method]!,
  'isAvailable': instance.isAvailable,
  'reason': _$PaymentMethodOptionResponseDtoReasonEnumEnumMap[instance.reason],
};

const _$PaymentMethodOptionResponseDtoMethodEnumEnumMap = {
  PaymentMethodOptionResponseDtoMethodEnum.mada: 'mada',
  PaymentMethodOptionResponseDtoMethodEnum.card: 'card',
  PaymentMethodOptionResponseDtoMethodEnum.applepay: 'applepay',
  PaymentMethodOptionResponseDtoMethodEnum.cod: 'cod',
  PaymentMethodOptionResponseDtoMethodEnum.wallet: 'wallet',
  PaymentMethodOptionResponseDtoMethodEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$PaymentMethodOptionResponseDtoReasonEnumEnumMap = {
  PaymentMethodOptionResponseDtoReasonEnum.insufficientBalance:
      'insufficient_balance',
  PaymentMethodOptionResponseDtoReasonEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
