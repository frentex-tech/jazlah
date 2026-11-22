// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_cart_fulfilment_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetCartFulfilmentDto _$SetCartFulfilmentDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetCartFulfilmentDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['method', 'date']);
  final val = SetCartFulfilmentDto(
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(
        _$FulfilmentMethodEnumMap,
        v,
        unknownValue: FulfilmentMethod.unknownDefaultOpenApi,
      ),
    ),
    addressId: $checkedConvert('addressId', (v) => v as String?),
    date: $checkedConvert('date', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$SetCartFulfilmentDtoToJson(
  SetCartFulfilmentDto instance,
) => <String, dynamic>{
  'method': _$FulfilmentMethodEnumMap[instance.method]!,
  'addressId': ?instance.addressId,
  'date': instance.date,
};

const _$FulfilmentMethodEnumMap = {
  FulfilmentMethod.delivery: 'delivery',
  FulfilmentMethod.pickup: 'pickup',
  FulfilmentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};
