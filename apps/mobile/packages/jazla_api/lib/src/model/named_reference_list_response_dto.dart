//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/named_reference_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'named_reference_list_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class NamedReferenceListResponseDto {
  /// Returns a new [NamedReferenceListResponseDto] instance.
  NamedReferenceListResponseDto({

    required  this.items,
  });

      /// Every active entry, with its Arabic and English name, oldest first; empty when there is none.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<NamedReferenceResponseDto> items;





    @override
    bool operator ==(Object other) => identical(this, other) || other is NamedReferenceListResponseDto &&
      other.items == items;

    @override
    int get hashCode =>
        items.hashCode;

  factory NamedReferenceListResponseDto.fromJson(Map<String, dynamic> json) => _$NamedReferenceListResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$NamedReferenceListResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

