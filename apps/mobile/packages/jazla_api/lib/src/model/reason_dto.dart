//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'reason_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ReasonDto {
  /// Returns a new [ReasonDto] instance.
  ReasonDto({

    required  this.reason,
  });

      /// Why, in the words of the admin, 1 to 500 characters; trimmed. A rejection reason is shown to the vendor or applicant, so write it for them.
  @JsonKey(
    
    name: r'reason',
    required: true,
    includeIfNull: false,
  )


  final String reason;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ReasonDto &&
      other.reason == reason;

    @override
    int get hashCode =>
        reason.hashCode;

  factory ReasonDto.fromJson(Map<String, dynamic> json) => _$ReasonDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ReasonDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

