//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'time_window_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class TimeWindowDto {
  /// Returns a new [TimeWindowDto] instance.
  TimeWindowDto({

    required  this.start,

    required  this.end,
  });

      /// Start, Riyadh time, `HH:mm` (24 hours).
  @JsonKey(
    
    name: r'start',
    required: true,
    includeIfNull: false,
  )


  final String start;



      /// End, Riyadh time, `HH:mm`, after `start` (VALIDATION_FAILED `endBeforeStart` otherwise).
  @JsonKey(
    
    name: r'end',
    required: true,
    includeIfNull: false,
  )


  final String end;





    @override
    bool operator ==(Object other) => identical(this, other) || other is TimeWindowDto &&
      other.start == start &&
      other.end == end;

    @override
    int get hashCode =>
        start.hashCode +
        end.hashCode;

  factory TimeWindowDto.fromJson(Map<String, dynamic> json) => _$TimeWindowDtoFromJson(json);

  Map<String, dynamic> toJson() => _$TimeWindowDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

