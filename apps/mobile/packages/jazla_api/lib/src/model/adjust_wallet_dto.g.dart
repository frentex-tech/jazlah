// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjust_wallet_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdjustWalletDto _$AdjustWalletDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('AdjustWalletDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['type', 'amountHalalas', 'reason']);
      final val = AdjustWalletDto(
        type: $checkedConvert(
          'type',
          (v) => $enumDecode(
            _$AdjustWalletDtoTypeEnumEnumMap,
            v,
            unknownValue: AdjustWalletDtoTypeEnum.unknownDefaultOpenApi,
          ),
        ),
        amountHalalas: $checkedConvert(
          'amountHalalas',
          (v) => (v as num).toInt(),
        ),
        reason: $checkedConvert('reason', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$AdjustWalletDtoToJson(AdjustWalletDto instance) =>
    <String, dynamic>{
      'type': _$AdjustWalletDtoTypeEnumEnumMap[instance.type]!,
      'amountHalalas': instance.amountHalalas,
      'reason': instance.reason,
    };

const _$AdjustWalletDtoTypeEnumEnumMap = {
  AdjustWalletDtoTypeEnum.credit: 'credit',
  AdjustWalletDtoTypeEnum.debit: 'debit',
  AdjustWalletDtoTypeEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
