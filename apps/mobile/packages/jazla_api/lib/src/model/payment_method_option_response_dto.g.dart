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
        _$PaymentMethodEnumMap,
        v,
        unknownValue: PaymentMethod.unknownDefaultOpenApi,
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
  'method': _$PaymentMethodEnumMap[instance.method]!,
  'isAvailable': instance.isAvailable,
  'reason': _$PaymentMethodOptionResponseDtoReasonEnumEnumMap[instance.reason],
};

const _$PaymentMethodEnumMap = {
  PaymentMethod.mada: 'mada',
  PaymentMethod.card: 'card',
  PaymentMethod.applepay: 'applepay',
  PaymentMethod.cod: 'cod',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$PaymentMethodOptionResponseDtoReasonEnumEnumMap = {
  PaymentMethodOptionResponseDtoReasonEnum.INSUFFICIENT_BALANCE:
      'INSUFFICIENT_BALANCE',
  PaymentMethodOptionResponseDtoReasonEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
