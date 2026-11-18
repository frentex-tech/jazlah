import 'package:jazlah/core/geo/geo_point.dart';

class Address {
  const Address({
    required this.id,
    required this.label,
    required this.point,
    required this.isDefault,
    this.city,
    this.district,
    this.street,
    this.building,
    this.driverInstructions,
    this.locked = false,
    this.covered = true,
  });

  final String id;
  final String label;
  final GeoPoint point;
  final bool isDefault;
  final String? city;
  final String? district;
  final String? street;
  final String? building;
  final String? driverInstructions;

  /// Used by an order in progress: it cannot be edited or deleted until the order is done.
  /// shortcut: the API has no lock yet (it comes with checkout and orders); always false from the API.
  final bool locked;

  /// Inside an active delivery zone (`isCovered`, worked out by the API on every read).
  final bool covered;

  /// «حي الملقا، شارع أنس بن مالك، الرياض».
  String line(String separator) =>
      [district, street, city].whereType<String>().where((s) => s.trim().isNotEmpty).join(separator);
}

/// The editable fields of an address. On update, a null field keeps its value and an empty text clears it.
class AddressDraft {
  const AddressDraft({
    required this.label,
    required this.point,
    this.city,
    this.district,
    this.street,
    this.driverInstructions,
    this.isDefault = false,
  });

  final String label;
  final GeoPoint point;
  final String? city;
  final String? district;
  final String? street;
  final String? driverInstructions;
  final bool isDefault;
}
