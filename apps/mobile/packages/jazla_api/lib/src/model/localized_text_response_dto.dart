//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'localized_text_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class LocalizedTextResponseDto {
  /// Returns a new [LocalizedTextResponseDto] instance.
  LocalizedTextResponseDto({

    required  this.ar,

    required  this.en,
  });

      /// The text in Arabic.
  @JsonKey(
    
    name: r'ar',
    required: true,
    includeIfNull: false,
  )


  final String ar;



      /// The text in English.
  @JsonKey(
    
    name: r'en',
    required: true,
    includeIfNull: false,
  )


  final String en;





    @override
    bool operator ==(Object other) => identical(this, other) || other is LocalizedTextResponseDto &&
      other.ar == ar &&
      other.en == en;

    @override
    int get hashCode =>
        ar.hashCode +
        en.hashCode;

  factory LocalizedTextResponseDto.fromJson(Map<String, dynamic> json) => _$LocalizedTextResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$LocalizedTextResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

