import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:jazla_api/jazla_api.dart';

import 'package:jazlah/app/providers.dart';
import 'package:jazlah/core/errors/api_error.dart';
import 'package:jazlah/features/_example/domain/category.dart';

/// Maps the generated DTOs to domain models, and Dio errors to [ApiError].
class CategoryRepository {
  const CategoryRepository(this._api);

  final JazlaApi _api;

  Future<List<Category>> list() async {
    try {
      final res = await _api.getPublicCatalogApi().publicListCategories();
      return [
        for (final c in res.data!.items) Category(id: c.id, nameAr: c.name.ar, nameEn: c.name.en),
      ];
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}

final Provider<CategoryRepository> categoryRepositoryProvider = Provider(
  (ref) => CategoryRepository(ref.watch(apiProvider)),
);

final FutureProvider<List<Category>> categoriesProvider = FutureProvider(
  (ref) => ref.watch(categoryRepositoryProvider).list(),
);
