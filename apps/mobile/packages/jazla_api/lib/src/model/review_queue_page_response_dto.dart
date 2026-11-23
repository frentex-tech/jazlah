//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/review_queue_item_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'review_queue_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReviewQueuePageResponseDto {
  /// Returns a new [ReviewQueuePageResponseDto] instance.
  ReviewQueuePageResponseDto({

    required  this.items,

    required  this.nextCursor,

    required  this.count,
  });

      /// The items of this page, newest submission first; empty when none wait.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<ReviewQueueItemResponseDto> items;



      /// Send as `cursor` for the next page; null on the last page.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;



      /// How many items wait in all for this filter (every page, not this page): the side-nav badge.
  @JsonKey(
    
    name: r'count',
    required: true,
    includeIfNull: false,
  )


  final int count;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReviewQueuePageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor &&
      other.count == count;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode) +
        count.hashCode;

  factory ReviewQueuePageResponseDto.fromJson(Map<String, dynamic> json) => _$ReviewQueuePageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReviewQueuePageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

