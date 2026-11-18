//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'localized_description_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class LocalizedDescriptionDto {
  /// Returns a new [LocalizedDescriptionDto] instance.
  LocalizedDescriptionDto({

     this.ar,

     this.en,
  });

      /// The text in Arabic, up to 1000 characters; trimmed. In an update, omit it to keep the current text, or send null or a blank text to clear it.
  @JsonKey(
    
    name: r'ar',
    required: false,
    includeIfNull: false,
  )


  final String? ar;



      /// The text in English, up to 1000 characters; trimmed. In an update, omit it to keep the current text, or send null or a blank text to clear it.
  @JsonKey(
    
    name: r'en',
    required: false,
    includeIfNull: false,
  )


  final String? en;





    @override
    bool operator ==(Object other) => identical(this, other) || other is LocalizedDescriptionDto &&
      other.ar == ar &&
      other.en == en;

    @override
    int get hashCode =>
        (ar == null ? 0 : ar.hashCode) +
        (en == null ? 0 : en.hashCode);

  factory LocalizedDescriptionDto.fromJson(Map<String, dynamic> json) => _$LocalizedDescriptionDtoFromJson(json);

  Map<String, dynamic> toJson() => _$LocalizedDescriptionDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

