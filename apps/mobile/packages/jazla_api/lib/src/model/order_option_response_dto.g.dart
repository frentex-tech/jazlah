// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_option_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderOptionResponseDto _$OrderOptionResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderOptionResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name']);
  final val = OrderOptionResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$OrderOptionResponseDtoToJson(
  OrderOptionResponseDto instance,
) => <String, dynamic>{'id': instance.id, 'name': instance.name.toJson()};
