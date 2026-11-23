//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/cutoff_rule_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cutoffs_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CutoffsDto {
  /// Returns a new [CutoffsDto] instance.
  CutoffsDto({

    required  this.readyMeat,

    required  this.carcass,

    required  this.cooked,

    required  this.occasion,

    required  this.adha,
  });

      /// Ready meat (`ready_meat`); default 12:00, 0 days.
  @JsonKey(
    
    name: r'readyMeat',
    required: true,
    includeIfNull: false,
  )


  final CutoffRuleDto readyMeat;



      /// Whole carcasses (`carcass`); default 20:00, 1 day.
  @JsonKey(
    
    name: r'carcass',
    required: true,
    includeIfNull: false,
  )


  final CutoffRuleDto carcass;



      /// Cooked food (`cooked`); default 18:00, 1 day.
  @JsonKey(
    
    name: r'cooked',
    required: true,
    includeIfNull: false,
  )


  final CutoffRuleDto cooked;



      /// Occasion packages (`occasion`); default no time, 3 days.
  @JsonKey(
    
    name: r'occasion',
    required: true,
    includeIfNull: false,
  )


  final CutoffRuleDto occasion;



      /// Eid al-Adha sacrifices (`adha`); default no time, 3 days, until the Adha calendar lands (Sprint 6).
  @JsonKey(
    
    name: r'adha',
    required: true,
    includeIfNull: false,
  )


  final CutoffRuleDto adha;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CutoffsDto &&
      other.readyMeat == readyMeat &&
      other.carcass == carcass &&
      other.cooked == cooked &&
      other.occasion == occasion &&
      other.adha == adha;

    @override
    int get hashCode =>
        readyMeat.hashCode +
        carcass.hashCode +
        cooked.hashCode +
        occasion.hashCode +
        adha.hashCode;

  factory CutoffsDto.fromJson(Map<String, dynamic> json) => _$CutoffsDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CutoffsDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

