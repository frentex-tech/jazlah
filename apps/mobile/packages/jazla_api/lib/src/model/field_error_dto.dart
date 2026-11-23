//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'field_error_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class FieldErrorDto {
  /// Returns a new [FieldErrorDto] instance.
  FieldErrorDto({

    required  this.field,

    required  this.constraints,
  });

      /// Dotted path of the invalid field.
  @JsonKey(
    
    name: r'field',
    required: true,
    includeIfNull: false,
  )


  final String field;



      /// Names of the failed checks (class-validator constraint names), stable and language-neutral.
  @JsonKey(
    
    name: r'constraints',
    required: true,
    includeIfNull: false,
  )


  final List<String> constraints;





    @override
    bool operator ==(Object other) => identical(this, other) || other is FieldErrorDto &&
      other.field == field &&
      other.constraints == constraints;

    @override
    int get hashCode =>
        field.hashCode +
        constraints.hashCode;

  factory FieldErrorDto.fromJson(Map<String, dynamic> json) => _$FieldErrorDtoFromJson(json);

  Map<String, dynamic> toJson() => _$FieldErrorDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

