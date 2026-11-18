import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';

void main() {
  test('masks to 5X XXX XXXX, normalising Arabic digits and dropping prefixes', () {
    expect(JSaudiPhoneFormatter.format('551234567'), '55 123 4567');
    expect(JSaudiPhoneFormatter.format('٥٥١٢٣'), '55 123');
    expect(JSaudiPhoneFormatter.format('+966 55 123 4567'), '55 123 4567');
    expect(JSaudiPhoneFormatter.format('0551234567'), '55 123 4567');
    expect(JSaudiPhoneFormatter.format('5512345678999'), '55 123 4567');
    expect(JSaudiPhoneFormatter.digitsOf('55 123 4567'), '551234567');
  });
}
