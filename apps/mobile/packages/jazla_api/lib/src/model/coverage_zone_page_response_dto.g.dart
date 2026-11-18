// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coverage_zone_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CoverageZonePageResponseDto _$CoverageZonePageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CoverageZonePageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = CoverageZonePageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => CoverageZoneResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$CoverageZonePageResponseDtoToJson(
  CoverageZonePageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
