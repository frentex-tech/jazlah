// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_payment_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreatePaymentDto _$CreatePaymentDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CreatePaymentDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['method']);
      final val = CreatePaymentDto(
        method: $checkedConvert(
          'method',
          (v) => $enumDecode(
            _$CreatePaymentDtoMethodEnumEnumMap,
            v,
            unknownValue: CreatePaymentDtoMethodEnum.unknownDefaultOpenApi,
          ),
        ),
        walletAmountHalalas: $checkedConvert(
          'walletAmountHalalas',
          (v) => (v as num?)?.toInt(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CreatePaymentDtoToJson(CreatePaymentDto instance) =>
    <String, dynamic>{
      'method': _$CreatePaymentDtoMethodEnumEnumMap[instance.method]!,
      'walletAmountHalalas': ?instance.walletAmountHalalas,
    };

const _$CreatePaymentDtoMethodEnumEnumMap = {
  CreatePaymentDtoMethodEnum.mada: 'mada',
  CreatePaymentDtoMethodEnum.card: 'card',
  CreatePaymentDtoMethodEnum.applepay: 'applepay',
  CreatePaymentDtoMethodEnum.cod: 'cod',
  CreatePaymentDtoMethodEnum.wallet: 'wallet',
  CreatePaymentDtoMethodEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
