//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'ordering_pause_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderingPauseResponseDto {
  /// Returns a new [OrderingPauseResponseDto] instance.
  OrderingPauseResponseDto({

    required  this.isPaused,

    required  this.messageAr,

    required  this.messageEn,
  });

      /// While true, every cart change and checkout call answers ORDERING_PAUSED with these messages.
  @JsonKey(
    
    name: r'isPaused',
    required: true,
    includeIfNull: false,
  )


  final bool isPaused;



      /// The message in Arabic; null when not paused.
  @JsonKey(
    
    name: r'messageAr',
    required: true,
    includeIfNull: true,
  )


  final String? messageAr;



      /// The message in English; null when not paused.
  @JsonKey(
    
    name: r'messageEn',
    required: true,
    includeIfNull: true,
  )


  final String? messageEn;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderingPauseResponseDto &&
      other.isPaused == isPaused &&
      other.messageAr == messageAr &&
      other.messageEn == messageEn;

    @override
    int get hashCode =>
        isPaused.hashCode +
        (messageAr == null ? 0 : messageAr.hashCode) +
        (messageEn == null ? 0 : messageEn.hashCode);

  factory OrderingPauseResponseDto.fromJson(Map<String, dynamic> json) => _$OrderingPauseResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderingPauseResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

