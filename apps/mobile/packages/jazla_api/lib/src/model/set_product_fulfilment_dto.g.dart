// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_product_fulfilment_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetProductFulfilmentDto _$SetProductFulfilmentDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetProductFulfilmentDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['fulfilment']);
  final val = SetProductFulfilmentDto(
    fulfilment: $checkedConvert(
      'fulfilment',
      (v) => $enumDecode(
        _$SetProductFulfilmentDtoFulfilmentEnumEnumMap,
        v,
        unknownValue:
            SetProductFulfilmentDtoFulfilmentEnum.unknownDefaultOpenApi,
      ),
    ),
  );
  return val;
});

Map<String, dynamic> _$SetProductFulfilmentDtoToJson(
  SetProductFulfilmentDto instance,
) => <String, dynamic>{
  'fulfilment':
      _$SetProductFulfilmentDtoFulfilmentEnumEnumMap[instance.fulfilment]!,
};

const _$SetProductFulfilmentDtoFulfilmentEnumEnumMap = {
  SetProductFulfilmentDtoFulfilmentEnum.delivery: 'delivery',
  SetProductFulfilmentDtoFulfilmentEnum.pickup: 'pickup',
  SetProductFulfilmentDtoFulfilmentEnum.both: 'both',
  SetProductFulfilmentDtoFulfilmentEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
