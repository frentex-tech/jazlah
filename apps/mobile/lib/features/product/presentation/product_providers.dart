import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/config/env.dart';
import 'package:jazlah/features/product/data/mock_product_repository.dart';
import 'package:jazlah/features/product/data/product_repository.dart';
import 'package:jazlah/features/product/domain/product.dart';

final productRepositoryProvider = Provider<ProductRepository>(
  (ref) => Env.useMocks ? MockProductRepository() : ApiProductRepository(ref.watch(apiProvider)),
);

/// No automatic retry: the error panel (with its own retry) shows at once.
final FutureProviderFamily<ProductDetail, String> productProvider = FutureProvider.autoDispose
    .family<ProductDetail, String>(
      (ref, id) => ref.watch(productRepositoryProvider).product(id),
      retry: (_, _) => null,
    );
