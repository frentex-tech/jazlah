// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'named_reference_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NamedReferenceResponseDto _$NamedReferenceResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('NamedReferenceResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name']);
  final val = NamedReferenceResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$NamedReferenceResponseDtoToJson(
  NamedReferenceResponseDto instance,
) => <String, dynamic>{'id': instance.id, 'name': instance.name.toJson()};
