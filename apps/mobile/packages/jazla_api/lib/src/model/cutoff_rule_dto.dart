//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cutoff_rule_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CutoffRuleDto {
  /// Returns a new [CutoffRuleDto] instance.
  CutoffRuleDto({

    required  this.time,

    required  this.leadDays,
  });

      /// The daily cut-off, Riyadh time `HH:mm`; null: no cut-off time, only the lead days count.
  @JsonKey(
    
    name: r'time',
    required: true,
    includeIfNull: true,
  )


  final String? time;



      /// Whole days between ordering and the first possible day, 0 to 30.
          // minimum: 0
          // maximum: 30
  @JsonKey(
    
    name: r'leadDays',
    required: true,
    includeIfNull: false,
  )


  final int leadDays;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CutoffRuleDto &&
      other.time == time &&
      other.leadDays == leadDays;

    @override
    int get hashCode =>
        (time == null ? 0 : time.hashCode) +
        leadDays.hashCode;

  factory CutoffRuleDto.fromJson(Map<String, dynamic> json) => _$CutoffRuleDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CutoffRuleDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

