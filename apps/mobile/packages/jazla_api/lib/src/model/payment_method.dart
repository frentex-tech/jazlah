//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// The method chosen (beside any wallet part).
enum PaymentMethod {
          /// The method chosen (beside any wallet part).
      @JsonValue(r'mada')
      mada(r'mada'),
          /// The method chosen (beside any wallet part).
      @JsonValue(r'card')
      card(r'card'),
          /// The method chosen (beside any wallet part).
      @JsonValue(r'applepay')
      applepay(r'applepay'),
          /// The method chosen (beside any wallet part).
      @JsonValue(r'cod')
      cod(r'cod'),
          /// The method chosen (beside any wallet part).
      @JsonValue(r'wallet')
      wallet(r'wallet'),
          /// The method chosen (beside any wallet part).
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const PaymentMethod(this.value);

  final String value;

  @override
  String toString() => value;
}
