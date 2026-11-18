//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'optional_localized_text_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OptionalLocalizedTextResponseDto {
  /// Returns a new [OptionalLocalizedTextResponseDto] instance.
  OptionalLocalizedTextResponseDto({

    required  this.ar,

    required  this.en,
  });

      /// The text in Arabic; null when there is none.
  @JsonKey(
    
    name: r'ar',
    required: true,
    includeIfNull: true,
  )


  final String? ar;



      /// The text in English; null when there is none.
  @JsonKey(
    
    name: r'en',
    required: true,
    includeIfNull: true,
  )


  final String? en;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OptionalLocalizedTextResponseDto &&
      other.ar == ar &&
      other.en == en;

    @override
    int get hashCode =>
        (ar == null ? 0 : ar.hashCode) +
        (en == null ? 0 : en.hashCode);

  factory OptionalLocalizedTextResponseDto.fromJson(Map<String, dynamic> json) => _$OptionalLocalizedTextResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OptionalLocalizedTextResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

