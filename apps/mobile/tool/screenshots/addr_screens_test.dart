import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/app/shell/main_shell.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_form_screen.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/addresses/presentation/addresses_screen.dart';
import 'package:jazlah/features/auth/presentation/session_controller.dart';

import 'harness.dart';

class _Repo extends MockAddressRepository {
  _Repo({this.mode = 'figma'})
    : super(
        seed: mode == 'empty'
            ? []
            : const [
                Address(
                  id: 'a1',
                  label: 'المنزل',
                  point: GeoPoint(24.8168, 46.6195),
                  isDefault: true,
                  city: 'الرياض',
                  district: 'حي الملقا',
                  street: 'شارع أنس بن مالك',
                ),
                Address(
                  id: 'a2',
                  label: 'العمل',
                  point: GeoPoint(24.69, 46.685),
                  isDefault: false,
                  city: 'الرياض',
                  district: 'حي العليا',
                  street: 'طريق الملك فهد',
                ),
                Address(
                  id: 'a3',
                  label: 'بيت العائلة',
                  point: GeoPoint(24.84, 46.66),
                  isDefault: false,
                  city: 'الرياض',
                  district: 'حي النرجس',
                ),
              ],
      );

  final String mode;

  @override
  Future<List<Address>> list() async {
    if (mode == 'hang') return hang();
    if (mode == 'error') throw const ApiError(code: ApiError.network);
    return super.list();
  }

  @override
  Future<Address> update(Address before, AddressDraft draft) => hang();
}

const _home = Address(
  id: 'a1',
  label: 'المنزل',
  point: GeoPoint(24.8168, 46.6195),
  isDefault: true,
  city: 'الرياض',
  district: 'الملقا',
  street: 'شارع أنس بن مالك، مبنى 12',
);

Widget _tabs(Widget c) => MainShell(location: '/account', child: c);

List<dynamic> _o(String mode) => [
  sessionProvider.overrideWithBuild((ref, n) => SessionStatus.signedIn),
  addressRepositoryProvider.overrideWithValue(_Repo(mode: mode)),
];

void main() {
  setUpAll(loadFonts);

  testWidgets('list', (t) async {
    await shoot(t, '86-8871', _tabs(const AddressesScreen()), overrides: _o('figma'));
    await shoot(t, '86-8947', _tabs(const AddressesScreen()), overrides: _o('empty'));
    await shoot(t, '86-9041', _tabs(const AddressesScreen()), overrides: _o('hang'));
    await shoot(t, '86-9115', _tabs(const AddressesScreen()), overrides: _o('error'));
  });

  testWidgets('edit', (t) async {
    await shoot(t, '86-9219', const AddressFormScreen.edit(address: _home), overrides: _o('figma'));
    await shoot(
      t,
      '86-9264',
      const AddressFormScreen.edit(address: _home),
      overrides: _o('figma'),
      act: (t) async {
        await t.enterText(find.byType(TextField).at(2), '');
        await t.tap(find.text('حفظ التغييرات'));
        FocusManager.instance.primaryFocus?.unfocus();
      },
    );
    await shoot(
      t,
      '86-9334',
      const AddressFormScreen.edit(address: _home),
      overrides: _o('figma'),
      act: (t) async {
        await t.tap(find.text('حفظ التغييرات'));
      },
    );
  });
}
