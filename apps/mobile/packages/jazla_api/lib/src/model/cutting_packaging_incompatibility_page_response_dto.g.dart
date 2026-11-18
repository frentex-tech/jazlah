// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cutting_packaging_incompatibility_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CuttingPackagingIncompatibilityPageResponseDto
_$CuttingPackagingIncompatibilityPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CuttingPackagingIncompatibilityPageResponseDto', json, (
  $checkedConvert,
) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = CuttingPackagingIncompatibilityPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => CuttingPackagingIncompatibilityResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$CuttingPackagingIncompatibilityPageResponseDtoToJson(
  CuttingPackagingIncompatibilityPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
