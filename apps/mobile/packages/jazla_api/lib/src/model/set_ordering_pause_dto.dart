//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'set_ordering_pause_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class SetOrderingPauseDto {
  /// Returns a new [SetOrderingPauseDto] instance.
  SetOrderingPauseDto({

    required  this.isPaused,

     this.messageAr,

     this.messageEn,
  });

      /// `true`: pause new orders now; `false`: resume.
  @JsonKey(
    
    name: r'isPaused',
    required: true,
    includeIfNull: false,
  )


  final bool isPaused;



      /// The message in Arabic, 1 to 200 characters; required when pausing, ignored when resuming.
  @JsonKey(
    
    name: r'messageAr',
    required: false,
    includeIfNull: false,
  )


  final String? messageAr;



      /// The message in English, 1 to 200 characters; required when pausing, ignored when resuming.
  @JsonKey(
    
    name: r'messageEn',
    required: false,
    includeIfNull: false,
  )


  final String? messageEn;





    @override
    bool operator ==(Object other) => identical(this, other) || other is SetOrderingPauseDto &&
      other.isPaused == isPaused &&
      other.messageAr == messageAr &&
      other.messageEn == messageEn;

    @override
    int get hashCode =>
        isPaused.hashCode +
        messageAr.hashCode +
        messageEn.hashCode;

  factory SetOrderingPauseDto.fromJson(Map<String, dynamic> json) => _$SetOrderingPauseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$SetOrderingPauseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

