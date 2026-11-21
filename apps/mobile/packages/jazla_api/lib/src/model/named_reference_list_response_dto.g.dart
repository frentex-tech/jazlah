// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'named_reference_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

NamedReferenceListResponseDto _$NamedReferenceListResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('NamedReferenceListResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items']);
  final val = NamedReferenceListResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                NamedReferenceResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$NamedReferenceListResponseDtoToJson(
  NamedReferenceListResponseDto instance,
) => <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};
