// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coverage_check_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CoverageCheckResponseDto _$CoverageCheckResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CoverageCheckResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['covered', 'zone']);
  final val = CoverageCheckResponseDto(
    covered: $checkedConvert('covered', (v) => v as bool),
    zone: $checkedConvert(
      'zone',
      (v) => v == null
          ? null
          : CoveringZoneResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$CoverageCheckResponseDtoToJson(
  CoverageCheckResponseDto instance,
) => <String, dynamic>{
  'covered': instance.covered,
  'zone': instance.zone?.toJson(),
};
