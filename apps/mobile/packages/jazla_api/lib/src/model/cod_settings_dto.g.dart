// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cod_settings_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CodSettingsDto _$CodSettingsDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CodSettingsDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const [
          'enabled',
          'maxOrderHalalas',
          'allowedOrderTypes',
          'confirmation',
        ],
      );
      final val = CodSettingsDto(
        enabled: $checkedConvert('enabled', (v) => v as bool),
        maxOrderHalalas: $checkedConvert(
          'maxOrderHalalas',
          (v) => (v as num?)?.toInt(),
        ),
        allowedOrderTypes: $checkedConvert(
          'allowedOrderTypes',
          (v) => (v as List<dynamic>)
              .map((e) => $enumDecode(_$OrderTypeEnumMap, e))
              .toList(),
        ),
        confirmation: $checkedConvert(
          'confirmation',
          (v) => $enumDecode(
            _$CodSettingsDtoConfirmationEnumEnumMap,
            v,
            unknownValue: CodSettingsDtoConfirmationEnum.unknownDefaultOpenApi,
          ),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CodSettingsDtoToJson(CodSettingsDto instance) =>
    <String, dynamic>{
      'enabled': instance.enabled,
      'maxOrderHalalas': instance.maxOrderHalalas,
      'allowedOrderTypes': instance.allowedOrderTypes
          .map((e) => _$OrderTypeEnumMap[e]!)
          .toList(),
      'confirmation':
          _$CodSettingsDtoConfirmationEnumEnumMap[instance.confirmation]!,
    };

const _$OrderTypeEnumMap = {
  OrderType.readyMeat: 'ready_meat',
  OrderType.carcass: 'carcass',
  OrderType.cooked: 'cooked',
  OrderType.occasion: 'occasion',
  OrderType.adha: 'adha',
  OrderType.mixed: 'mixed',
  OrderType.unknownDefaultOpenApi: 'unknown_default_open_api',
};

const _$CodSettingsDtoConfirmationEnumEnumMap = {
  CodSettingsDtoConfirmationEnum.auto: 'auto',
  CodSettingsDtoConfirmationEnum.review: 'review',
  CodSettingsDtoConfirmationEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
