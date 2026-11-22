// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'place_order_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PlaceOrderDto _$PlaceOrderDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('PlaceOrderDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['paymentMethod']);
      final val = PlaceOrderDto(
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
        notes: $checkedConvert('notes', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$PlaceOrderDtoToJson(PlaceOrderDto instance) =>
    <String, dynamic>{
      'paymentMethod': _$PaymentMethodEnumMap[instance.paymentMethod]!,
      'walletAmountHalalas': ?instance.walletAmountHalalas,
      'notes': ?instance.notes,
    };

const _$PaymentMethodEnumMap = {
  PaymentMethod.mada: 'mada',
  PaymentMethod.card: 'card',
  PaymentMethod.applepay: 'applepay',
  PaymentMethod.cod: 'cod',
  PaymentMethod.wallet: 'wallet',
  PaymentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};
