import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/core/geo/geo_point.dart';
import 'package:jazlah/features/addresses/domain/address.dart';

/// The address book (docs/frontend/customer-profile.md): at most 10, the default first, not paged.
abstract interface class AddressRepository {
  Future<List<Address>> list();

  Future<Address> create(AddressDraft draft);

  /// Sends only what differs from [before]; empty texts clear a field.
  Future<Address> update(Address before, AddressDraft draft);

  Future<void> setDefault(String id);

  Future<void> delete(String id);
}

class ApiAddressRepository implements AddressRepository {
  ApiAddressRepository(this._api);

  final JazlaApi _api;

  CustomerAddressesApi get _a => _api.getCustomerAddressesApi();

  Future<T> _call<T>(Future<T> Function() f) async {
    try {
      return await f();
    } catch (e) {
      throw ApiError.from(e);
    }
  }

  static Address _map(CustomerAddressResponseDto d) => Address(
    id: d.id,
    label: d.label,
    point: GeoPoint(d.location.latitude.toDouble(), d.location.longitude.toDouble()),
    isDefault: d.isDefault,
    city: d.city,
    district: d.district,
    street: d.street,
    building: d.building,
    driverInstructions: d.driverInstructions,
    covered: d.isCovered,
  );

  static String? _blankToNull(String? s) => s == null || s.trim().isEmpty ? null : s.trim();

  @override
  Future<List<Address>> list() =>
      _call(() async => [for (final d in (await _a.customerListAddresses()).data!.items) _map(d)]);

  @override
  Future<Address> create(AddressDraft d) => _call(() async {
    final res = await _a.customerCreateAddress(
      createCustomerAddressDto: CreateCustomerAddressDto(
        label: d.label.trim(),
        location: GeoPointDto(latitude: d.point.latitude, longitude: d.point.longitude),
        city: _blankToNull(d.city),
        district: _blankToNull(d.district),
        street: _blankToNull(d.street),
        driverInstructions: _blankToNull(d.driverInstructions),
        isDefault: d.isDefault ? true : null,
      ),
    );
    return _map(res.data!);
  });

  @override
  Future<Address> update(Address before, AddressDraft d) => _call(() async {
    String? changed(String? now, String? was) => (now ?? '').trim() == (was ?? '') ? null : (now ?? '').trim();
    final dto = UpdateCustomerAddressDto(
      label: d.label.trim() == before.label ? null : d.label.trim(),
      location: d.point != before.point ? GeoPointDto(latitude: d.point.latitude, longitude: d.point.longitude) : null,
      city: changed(d.city, before.city),
      district: changed(d.district, before.district),
      street: changed(d.street, before.street),
      driverInstructions: changed(d.driverInstructions, before.driverInstructions),
    );
    var saved = before;
    // Nothing to write: no PATCH at all.
    if (dto.toJson().isNotEmpty) {
      saved = _map((await _a.customerUpdateAddress(id: before.id, updateCustomerAddressDto: dto)).data!);
    }
    // Being the default does not change through PATCH; it has its own route.
    if (d.isDefault && !before.isDefault) {
      saved = _map((await _a.customerSetDefaultAddress(id: before.id)).data!);
    }
    return saved;
  });

  @override
  Future<void> setDefault(String id) => _call(() => _a.customerSetDefaultAddress(id: id));

  @override
  Future<void> delete(String id) => _call(() => _a.customerDeleteAddress(id: id));
}

/// In-memory address book for USE_MOCKS and tests. The third address is locked (an order in progress).
class MockAddressRepository implements AddressRepository {
  MockAddressRepository({List<Address>? seed}) : _items = seed ?? [..._seed];

  static const _seed = [
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
      point: GeoPoint(24.6900, 46.6850),
      isDefault: false,
      city: 'الرياض',
      district: 'حي العليا',
      street: 'طريق الملك فهد',
    ),
    Address(
      id: 'a3',
      label: 'بيت العائلة',
      point: GeoPoint(24.8400, 46.6600),
      isDefault: false,
      city: 'الرياض',
      district: 'حي النرجس',
      locked: true,
    ),
    Address(
      id: 'a4',
      label: 'الاستراحة',
      point: GeoPoint(23.2, 45.1),
      isDefault: false,
      district: 'خارج المدن',
      covered: false,
    ),
  ];

  final List<Address> _items;
  int _next = 100;
  static const _delay = Duration(milliseconds: 400);

  static const limit = 10;

  @override
  Future<List<Address>> list() async {
    await Future<void>.delayed(_delay);
    return [..._items.where((a) => a.isDefault), ..._items.where((a) => !a.isDefault)];
  }

  Address _from(String id, AddressDraft d, {required bool isDefault, bool locked = false, bool covered = true}) =>
      Address(
        id: id,
        label: d.label.trim(),
        point: d.point,
        isDefault: isDefault,
        city: d.city,
        district: d.district,
        street: d.street,
        driverInstructions: d.driverInstructions,
        locked: locked,
        covered: covered,
      );

  void _makeDefault(String id) {
    for (var i = 0; i < _items.length; i++) {
      final a = _items[i];
      _items[i] = _from(
        a.id,
        AddressDraft(
          label: a.label,
          point: a.point,
          city: a.city,
          district: a.district,
          street: a.street,
          driverInstructions: a.driverInstructions,
        ),
        isDefault: a.id == id,
        locked: a.locked,
        covered: a.covered,
      );
    }
  }

  @override
  Future<Address> create(AddressDraft d) async {
    await Future<void>.delayed(_delay);
    if (_items.length >= limit) throw const ApiError(code: 'ADDRESS_LIMIT_REACHED', details: {'limit': limit});
    final a = _from('m${_next++}', d, isDefault: false);
    _items.insert(0, a);
    if (d.isDefault || _items.length == 1) _makeDefault(a.id);
    return _items.firstWhere((x) => x.id == a.id);
  }

  @override
  Future<Address> update(Address before, AddressDraft d) async {
    await Future<void>.delayed(_delay);
    final i = _items.indexWhere((a) => a.id == before.id);
    if (i < 0) throw const ApiError(code: 'NOT_FOUND');
    _items[i] = _from(before.id, d, isDefault: before.isDefault, locked: before.locked, covered: before.covered);
    if (d.isDefault) _makeDefault(before.id);
    return _items[i];
  }

  @override
  Future<void> setDefault(String id) async {
    await Future<void>.delayed(_delay);
    _makeDefault(id);
  }

  @override
  Future<void> delete(String id) async {
    await Future<void>.delayed(_delay);
    final i = _items.indexWhere((a) => a.id == id);
    if (i < 0) throw const ApiError(code: 'NOT_FOUND');
    final wasDefault = _items.removeAt(i).isDefault;
    if (wasDefault && _items.isNotEmpty) _makeDefault(_items.first.id);
  }
}
