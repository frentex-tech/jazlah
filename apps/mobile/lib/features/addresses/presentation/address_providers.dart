import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/addresses/data/address_repository.dart';
import 'package:jazlah/features/addresses/domain/address.dart';

final addressRepositoryProvider = Provider<AddressRepository>(
  (ref) => Env.useMocks ? MockAddressRepository() : ApiAddressRepository(ref.watch(apiProvider)),
);

/// The address book; each address carries `covered` from the API.
final FutureProvider<List<Address>> addressesProvider = FutureProvider.autoDispose<List<Address>>(
  (ref) => ref.watch(addressRepositoryProvider).list(),
);
