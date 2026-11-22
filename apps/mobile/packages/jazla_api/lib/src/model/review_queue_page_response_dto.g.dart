// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_queue_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReviewQueuePageResponseDto _$ReviewQueuePageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ReviewQueuePageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor', 'count']);
  final val = ReviewQueuePageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                ReviewQueueItemResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
    count: $checkedConvert('count', (v) => (v as num).toInt()),
  );
  return val;
});

Map<String, dynamic> _$ReviewQueuePageResponseDtoToJson(
  ReviewQueuePageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
  'count': instance.count,
};
