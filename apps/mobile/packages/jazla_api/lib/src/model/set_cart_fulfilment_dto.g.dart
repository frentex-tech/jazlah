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
        _$SetCartFulfilmentDtoMethodEnumEnumMap,
        v,
        unknownValue: SetCartFulfilmentDtoMethodEnum.unknownDefaultOpenApi,
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
  'method': _$SetCartFulfilmentDtoMethodEnumEnumMap[instance.method]!,
  'addressId': ?instance.addressId,
  'date': instance.date,
};

const _$SetCartFulfilmentDtoMethodEnumEnumMap = {
  SetCartFulfilmentDtoMethodEnum.delivery: 'delivery',
  SetCartFulfilmentDtoMethodEnum.pickup: 'pickup',
  SetCartFulfilmentDtoMethodEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
