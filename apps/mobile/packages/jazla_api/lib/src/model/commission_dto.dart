//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'commission_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CommissionDto {
  /// Returns a new [CommissionDto] instance.
  CommissionDto({

    required  this.commissionBasisPoints,
  });

      /// The platform commission on future orders, in basis points: a whole number from 0 (0%) to 10000 (100%); 1250 is 12.5%. A fraction (12.5) is VALIDATION_FAILED.
          // minimum: 0
          // maximum: 10000
  @JsonKey(
    
    name: r'commissionBasisPoints',
    required: true,
    includeIfNull: false,
  )


  final num commissionBasisPoints;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CommissionDto &&
      other.commissionBasisPoints == commissionBasisPoints;

    @override
    int get hashCode =>
        commissionBasisPoints.hashCode;

  factory CommissionDto.fromJson(Map<String, dynamic> json) => _$CommissionDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CommissionDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

