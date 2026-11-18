//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'named_reference_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class NamedReferenceResponseDto {
  /// Returns a new [NamedReferenceResponseDto] instance.
  NamedReferenceResponseDto({

    required  this.id,

    required  this.name,
  });

      /// The entry’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The entry’s name in Arabic and English.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;





    @override
    bool operator ==(Object other) => identical(this, other) || other is NamedReferenceResponseDto &&
      other.id == id &&
      other.name == name;

    @override
    int get hashCode =>
        id.hashCode +
        name.hashCode;

  factory NamedReferenceResponseDto.fromJson(Map<String, dynamic> json) => _$NamedReferenceResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$NamedReferenceResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

