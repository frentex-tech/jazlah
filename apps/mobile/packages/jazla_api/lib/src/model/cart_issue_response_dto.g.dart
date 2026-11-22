// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_issue_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartIssueResponseDto _$CartIssueResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartIssueResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'code',
      'lineId',
      'oldUnitPriceHalalas',
      'newUnitPriceHalalas',
    ],
  );
  final val = CartIssueResponseDto(
    code: $checkedConvert(
      'code',
      (v) => $enumDecode(
        _$CartIssueResponseDtoCodeEnumEnumMap,
        v,
        unknownValue: CartIssueResponseDtoCodeEnum.unknownDefaultOpenApi,
      ),
    ),
    lineId: $checkedConvert('lineId', (v) => v as String),
    oldUnitPriceHalalas: $checkedConvert(
      'oldUnitPriceHalalas',
      (v) => (v as num?)?.toInt(),
    ),
    newUnitPriceHalalas: $checkedConvert(
      'newUnitPriceHalalas',
      (v) => (v as num?)?.toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$CartIssueResponseDtoToJson(
  CartIssueResponseDto instance,
) => <String, dynamic>{
  'code': _$CartIssueResponseDtoCodeEnumEnumMap[instance.code]!,
  'lineId': instance.lineId,
  'oldUnitPriceHalalas': instance.oldUnitPriceHalalas,
  'newUnitPriceHalalas': instance.newUnitPriceHalalas,
};

const _$CartIssueResponseDtoCodeEnumEnumMap = {
  CartIssueResponseDtoCodeEnum.PRICE_CHANGED: 'PRICE_CHANGED',
  CartIssueResponseDtoCodeEnum.ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  CartIssueResponseDtoCodeEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
