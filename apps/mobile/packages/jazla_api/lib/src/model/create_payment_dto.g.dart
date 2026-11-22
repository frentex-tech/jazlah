// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_payment_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreatePaymentDto _$CreatePaymentDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CreatePaymentDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['paymentMethod']);
      final val = CreatePaymentDto(
        paymentMethod: $checkedConvert(
          'paymentMethod',
          (v) => $enumDecode(
            _$PaymentMethodEnumMap,
            v,
            unknownValue: PaymentMethod.unknownDefaultOpenApi,
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
      'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
      'walletAmountHalalas': ?instance.walletAmountHalalas,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.mada: 'mada',
  PaymentMethod.card: 'card',
  PaymentMethod.applepay: 'applepay',
  PaymentMethod.cod: 'cod',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};
