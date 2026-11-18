//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'localized_name_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class LocalizedNameDto {
  /// Returns a new [LocalizedNameDto] instance.
  LocalizedNameDto({

    required  this.ar,

    required  this.en,
  });

      /// The name in Arabic, 2 to 100 characters; trimmed.
  @JsonKey(
    
    name: r'ar',
    required: true,
    includeIfNull: false,
  )


  final String ar;



      /// The name in English, 2 to 100 characters; trimmed.
  @JsonKey(
    
    name: r'en',
    required: true,
    includeIfNull: false,
  )


  final String en;





    @override
    bool operator ==(Object other) => identical(this, other) || other is LocalizedNameDto &&
      other.ar == ar &&
      other.en == en;

    @override
    int get hashCode =>
        ar.hashCode +
        en.hashCode;

  factory LocalizedNameDto.fromJson(Map<String, dynamic> json) => _$LocalizedNameDtoFromJson(json);

  Map<String, dynamic> toJson() => _$LocalizedNameDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

