import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:jazlah/app/router/router.dart';
import 'package:jazlah/app/theme/theme.dart';
import 'package:jazlah/core/widgets/widgets.dart';
import 'package:jazlah/features/catalog/domain/catalog.dart';
import 'package:jazlah/features/catalog/presentation/catalog_providers.dart';
import 'package:jazlah/features/catalog/presentation/catalog_widgets.dart';
import 'package:jazlah/l10n/app_localizations.dart';

/// One category's products: paged grid with sort. Figma has no screen for it; built from the store
/// page's grid, chips and states.
class CategoryScreen extends ConsumerStatefulWidget {
  const CategoryScreen({required this.id, super.key});

  final String id;

  @override
  ConsumerState<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends ConsumerState<CategoryScreen> {
  ProductSort _sort = ProductSort.popular;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final query = (categoryId: widget.id, vendorId: null, sort: _sort);
    final category = ref.watch(categoriesProvider).value?.where((c) => c.id == widget.id).firstOrNull;
    final sorts = {
      ProductSort.popular: l10n.sortPopular,
      ProductSort.priceAsc: l10n.sortPriceAsc,
      ProductSort.priceDesc: l10n.sortPriceDesc,
    };
    return SafeArea(
      bottom: false,
      child: Column(
        children: [
          JAppHeader.page(
            title: category?.name.of(context.lang) ?? '',
            cartLabel: l10n.cart,
            onBack: () => popOrHome(context),
          ),
          Expanded(
            child: LoadMoreListener(
              onEnd: () => ref.read(productPagesProvider(query).notifier).loadMore(),
              child: RefreshIndicator(
                color: JColors.ember,
                onRefresh: () => quietly(ref.refresh(productPagesProvider(query).future)),
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    const SliverToBoxAdapter(child: SizedBox(height: JSpace.s16)),
                    // The API cannot sort yet: no control rather than one that does nothing.
                    if (ref.watch(catalogRepositoryProvider).canSort)
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 40,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: JSpace.s16),
                            children: [
                              for (final MapEntry(key: sort, value: label) in sorts.entries) ...[
                                if (sort != ProductSort.popular) const SizedBox(width: JSpace.s8),
                                JChip(label: label, selected: sort == _sort, onTap: () => setState(() => _sort = sort)),
                              ],
                            ],
                          ),
                        ),
                      ),
                    const SliverToBoxAdapter(child: SizedBox(height: JSpace.s12)),
                    ...productSlivers(
                      context,
                      ref,
                      query,
                      empty: JEmptyState(
                        kind: JEmptyStateKind.search,
                        title: l10n.categoryEmptyTitle,
                        body: l10n.categoryEmptyBody,
                        actionLabel: l10n.homeCategories,
                        onAction: () => context.go(Routes.categories),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
