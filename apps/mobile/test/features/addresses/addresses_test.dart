import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';
import 'package:jazlah/features/addresses/presentation/address_form_screen.dart';
import 'package:jazlah/features/addresses/presentation/address_providers.dart';
import 'package:jazlah/features/addresses/presentation/addresses_screen.dart';
import 'package:jazlah/features/location/data/location_repositories.dart';
import 'package:jazlah/features/location/domain/location.dart';
import 'package:jazlah/features/location/presentation/location_providers.dart';
import 'package:jazlah/features/location/presentation/map_picker_screen.dart';

import '../../helpers/pump_screen.dart';

const _locked = Address(
  id: 'l1',
  label: 'بيت العائلة',
  point: GeoPoint(24.84, 46.66),
  isDefault: false,
  district: 'حي النرجس',
  locked: true,
);
const _outside = Address(
  id: 'o1',
  label: 'الاستراحة',
  point: GeoPoint(23.2, 45.1),
  isDefault: false,
  district: 'بعيد',
  covered: false,
);

List<dynamic> _o(MockAddressRepository repo) => [
  addressRepositoryProvider.overrideWithValue(repo),
  coverageRepositoryProvider.overrideWithValue(MockCoverageRepository()),
];

class _Failing extends MockAddressRepository {
  @override
  Future<List<Address>> list() => Future.error(Exception('offline'));
}

JButton _button(WidgetTester t, String label) => t.widget<JButton>(find.widgetWithText(JButton, label));

void main() {
  testWidgets('the list shows the default badge, the coverage tag and the lock', (t) async {
    await t.pumpScreen(
      const AddressesScreen(),
      overrides: _o(
        MockAddressRepository(
          seed: const [
            Address(
              id: 'a1',
              label: 'المنزل',
              point: GeoPoint(24.8168, 46.6195),
              isDefault: true,
              district: 'حي الملقا',
            ),
            _locked,
            _outside,
          ],
        ),
      ),
    );
    await t.pump(const Duration(seconds: 1));
    expect(find.text('افتراضي'), findsOneWidget);
    expect(find.text('خارج النطاق'), findsOneWidget); // only the far one
    expect(find.byIcon(JIcons.lockSimple), findsOneWidget);
    expect(find.byIcon(JIcons.pencilSimple), findsNWidgets(2));
  });

  testWidgets('a failed load shows the error panel at once (no automatic retry)', (t) async {
    await t.pumpScreen(
      const AddressesScreen(),
      overrides: [
        addressRepositoryProvider.overrideWithValue(_Failing()),
        coverageRepositoryProvider.overrideWithValue(MockCoverageRepository()),
      ],
    );
    await t.pump();
    await t.pump();
    expect(find.text('تعذّر تحميل العناوين'), findsOneWidget);
  });

  testWidgets('a locked address opens with edit and delete disabled and an explanation', (t) async {
    await t.pumpPushed(const AddressFormScreen.edit(address: _locked), overrides: _o(MockAddressRepository()));
    await t.pump(const Duration(seconds: 1));
    expect(find.textContaining('مرتبط بطلب قيد التنفيذ'), findsOneWidget);
    expect(_button(t, 'حفظ التغييرات').onPressed, isNull);
    expect(_button(t, 'حذف العنوان').onPressed, isNull);
    expect(t.widget<TextField>(find.byType(TextField).first).enabled, isFalse);
  });

  testWidgets('an out-of-coverage address can be saved, and is flagged', (t) async {
    final repo = MockAddressRepository(seed: []);
    const place = PickedPlace(
      point: GeoPoint(23.2, 45.1),
      address: PlaceAddress(city: 'الخرج', district: 'حي بعيد'),
      coverage: Coverage(covered: false),
    );
    await t.pumpPushed(const AddressFormScreen.add(place: place), overrides: _o(repo));
    await t.pump();
    expect(find.textContaining('خارج نطاق التوصيل حاليًا'), findsOneWidget);
    await t.enterText(find.byType(TextField).first, 'الاستراحة');
    await t.pump();
    // The test font's wide glyphs wrap the checkbox label, so the page scrolls a little.
    await t.ensureVisible(find.text('حفظ العنوان'));
    await t.pump();
    await t.tap(find.text('حفظ العنوان'));
    await t.pump(const Duration(seconds: 1));
    final saved = (await t.runAsync(repo.list))!;
    expect(saved.single.label, 'الاستراحة');
    expect(saved.single.district, 'حي بعيد');
    expect(saved.single.isDefault, isTrue); // the first address is the default
  });

  testWidgets('saving needs a name and a district', (t) async {
    await t.pumpPushed(
      const AddressFormScreen.edit(
        address: Address(id: 'a', label: 'المنزل', point: GeoPoint(24.8, 46.6), isDefault: true, district: 'الملقا'),
      ),
      overrides: _o(MockAddressRepository()),
    );
    await t.enterText(find.byType(TextField).at(2), '');
    await t.tap(find.text('حفظ التغييرات'));
    await t.pump();
    expect(find.text('الحي مطلوب'), findsOneWidget);
    expect(_button(t, 'حفظ التغييرات').onPressed, isNull);
    await t.pump(const Duration(seconds: 1)); // the background coverage check
  });

  testWidgets('delete asks first, then removes the address', (t) async {
    final repo = MockAddressRepository();
    final first = (await t.runAsync(repo.list))!.first;
    await t.pumpPushed(AddressFormScreen.edit(address: first), overrides: _o(repo));
    await t.pump();
    await t.tap(find.text('حذف العنوان'));
    await t.pumpAndSettle();
    expect(find.text('حذف العنوان؟'), findsOneWidget);
    await t.tap(find.text('حذف'));
    await t.pump(const Duration(seconds: 1));
    await t.pump(const Duration(seconds: 1));
    expect((await t.runAsync(repo.list))!.map((a) => a.id), isNot(contains(first.id)));
  });

  // ApiAddressRepository request bodies: test/features/addresses/address_repository_test.dart
}
